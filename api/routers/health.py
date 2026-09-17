import sys
from pathlib import Path
from fastapi import APIRouter

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from prototype_demo import _load_crop_bundle, _load_yield_bundle

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health_check():
    try:
        _load_crop_bundle()
        _load_yield_bundle()
        models_loaded = True
    except Exception:
        models_loaded = False
        
    return {
        "status": "healthy" if models_loaded else "unhealthy",
        "models_loaded": models_loaded,
        "version": "1.0.0"
    }
