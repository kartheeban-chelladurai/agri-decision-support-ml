from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import predict, metadata, health
from .services.crop_recommendation import load_crop_model
from .services.yield_estimation import load_yield_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    try:
        load_crop_model()
        load_yield_model()
    except Exception as e:
        print(f"Warning: Could not load models during startup: {e}")
    yield
    # Clean up on shutdown if necessary

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Override validation exception handler to match our standard format
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for error in exc.errors():
        # Get the field name, handling cases where it might be nested
        locs = [str(loc) for loc in error["loc"] if loc != "body"]
        field = ".".join(locs) if locs else "body"
        details.append({
            "field": field,
            "message": error["msg"]
        })
        
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": details
            }
        }
    )

app.include_router(predict.router, prefix=settings.API_V1_STR)
app.include_router(metadata.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
