from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class CropRecommendationRequest(BaseModel):
    N: float = Field(ge=0, le=200, description="Nitrogen (kg/ha)")
    P: float = Field(ge=0, le=200, description="Phosphorus (kg/ha)")
    K: float = Field(ge=0, le=250, description="Potassium (kg/ha)")
    temperature: float = Field(ge=-5, le=60, description="Temperature (°C)")
    humidity: float = Field(ge=0, le=100, description="Humidity (%)")
    ph: float = Field(ge=0, le=14, description="Soil pH")
    rainfall: float = Field(ge=0, le=500, description="Rainfall (mm)")

class CropPredictionData(BaseModel):
    crop: str
    model_used: str
    analyzed_crops: int

class CropRecommendationResponse(BaseModel):
    success: bool
    prediction: CropPredictionData
    input_summary: Dict[str, float]
    timestamp: str

class YieldEstimationRequest(BaseModel):
    temperature: float = Field(ge=-5, le=60, description="Temperature (°C)")
    humidity: float = Field(ge=0, le=100, description="Humidity (%)")
    soil_moisture: float = Field(ge=0, le=100, description="Soil moisture (%)")
    area: float = Field(gt=0, le=1_000_000, description="Area (hectares)")
    season: str = Field(min_length=1, description="Season name")
    crop: str = Field(min_length=1, description="Crop name")

class YieldPredictionData(BaseModel):
    yield_value: float
    total_production: float
    unit_note: str
    model_used: str

class YieldEstimationResponse(BaseModel):
    success: bool
    prediction: YieldPredictionData
    input_summary: Dict[str, Any]
    timestamp: str

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str

class ErrorData(BaseModel):
    code: str
    message: str
    details: List[ErrorDetail]

class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorData
