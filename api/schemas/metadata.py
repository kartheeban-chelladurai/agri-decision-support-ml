from pydantic import BaseModel
from typing import List

class CropsMetadataResponse(BaseModel):
    recommendation_crops: List[str]
    yield_crops: List[str]

class SeasonsMetadataResponse(BaseModel):
    seasons: List[str]

class ModelInfoDetail(BaseModel):
    model_name: str
    features: List[str]
    train_rows: int
    test_rows: int

class RecommendationModelInfo(ModelInfoDetail):
    accuracy: float
    cv_accuracy_mean: float
    cv_accuracy_std: float
    n_classes: int

class YieldModelInfo(ModelInfoDetail):
    r2: float
    rmse: float
    mae: float
    cv_r2_mean: float
    cv_r2_std: float
    n_crops: int
    n_seasons: int

class ModelInfoResponse(BaseModel):
    recommendation: RecommendationModelInfo
    yield_estimation: YieldModelInfo
