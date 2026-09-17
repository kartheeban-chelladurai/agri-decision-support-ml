import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from ..schemas.predict import (
    CropRecommendationRequest, CropRecommendationResponse, CropPredictionData,
    YieldEstimationRequest, YieldEstimationResponse, YieldPredictionData
)
from ..services.crop_recommendation import get_crop_recommendation, load_crop_model
from ..services.yield_estimation import get_yield_estimation, load_yield_model

router = APIRouter(prefix="/predict", tags=["predict"])

@router.post("/crop", response_model=CropRecommendationResponse)
def predict_crop(request: CropRecommendationRequest):
    try:
        crop = get_crop_recommendation(
            N=request.N, P=request.P, K=request.K,
            temperature=request.temperature, humidity=request.humidity,
            ph=request.ph, rainfall=request.rainfall
        )
        bundle = load_crop_model()
        analyzed_crops = len(bundle["label_encoder"].classes_)
        model_name = bundle.get("model_name", "Random Forest")
        
        return CropRecommendationResponse(
            success=True,
            prediction=CropPredictionData(
                crop=crop,
                model_used=model_name,
                analyzed_crops=analyzed_crops
            ),
            input_summary=request.model_dump(),
            timestamp=datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": str(e),
                    "details": []
                }
            }
        )

@router.post("/yield", response_model=YieldEstimationResponse)
def predict_yield(request: YieldEstimationRequest):
    try:
        yield_val = get_yield_estimation(
            temperature=request.temperature,
            humidity=request.humidity,
            soil_moisture=request.soil_moisture,
            area=request.area,
            season=request.season,
            crop=request.crop
        )
        bundle = load_yield_model()
        model_name = bundle.get("model_name", "XGBoost")
        
        return YieldEstimationResponse(
            success=True,
            prediction=YieldPredictionData(
                yield_value=yield_val,
                total_production=yield_val * request.area,
                unit_note="Yield is expressed in the dataset's native production units per hectare. These units vary by crop and do not represent a single standard measure. Compare estimates within the same crop only.",
                model_used=model_name
            ),
            input_summary=request.model_dump(),
            timestamp=datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        )
    except ValueError as ve:
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": "UNKNOWN_VALUE",
                    "message": str(ve),
                    "details": []
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": str(e),
                    "details": []
                }
            }
        )
