import json
import sys
from pathlib import Path
from fastapi import APIRouter
from ..schemas.metadata import CropsMetadataResponse, SeasonsMetadataResponse, ModelInfoResponse

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from prototype_demo import known_crops, known_seasons, known_yield_crops

router = APIRouter(prefix="/metadata", tags=["metadata"])

@router.get("/crops", response_model=CropsMetadataResponse)
def get_crops():
    return CropsMetadataResponse(
        recommendation_crops=known_crops(),
        yield_crops=known_yield_crops()
    )

@router.get("/seasons", response_model=SeasonsMetadataResponse)
def get_seasons():
    return SeasonsMetadataResponse(
        seasons=known_seasons()
    )

@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    OUTPUTS_DIR = PROJECT_ROOT / "outputs"
    
    with open(OUTPUTS_DIR / "crop_classification_results.json", "r") as f:
        crop_res = json.load(f)
        
    with open(OUTPUTS_DIR / "crop_yield_results.json", "r") as f:
        yield_res = json.load(f)
        
    return {
        "recommendation": {
            "model_name": crop_res["best_model"],
            "accuracy": crop_res["tuned_test_scores"]["accuracy"],
            "cv_accuracy_mean": crop_res["cross_validation"]["mean"],
            "cv_accuracy_std": crop_res["cross_validation"]["std"],
            "n_classes": crop_res["dataset"]["n_classes"],
            "train_rows": crop_res["dataset"]["train_rows"],
            "test_rows": crop_res["dataset"]["test_rows"],
            "features": crop_res["dataset"]["features"]
        },
        "yield_estimation": {
            "model_name": yield_res["best_model"],
            "r2": yield_res["tuned_test_scores"]["r2"],
            "rmse": yield_res["tuned_test_scores"]["rmse"],
            "mae": yield_res["tuned_test_scores"]["mae"],
            "cv_r2_mean": yield_res["cross_validation"]["mean"],
            "cv_r2_std": yield_res["cross_validation"]["std"],
            "n_crops": yield_res["dataset"]["n_crops"],
            "n_seasons": yield_res["dataset"]["n_seasons"],
            "train_rows": yield_res["dataset"]["train_rows"],
            "test_rows": yield_res["dataset"]["test_rows"],
            "features": yield_res["dataset"]["features"]
        }
    }
