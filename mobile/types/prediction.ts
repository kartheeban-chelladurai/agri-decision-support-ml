export interface CropRecommendationInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface YieldEstimationInput {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  area: number;
  season: string;
  crop: string;
}

export interface CropPredictionData {
  crop: string;
  model_used: string;
  analyzed_crops: number;
}

export interface YieldPredictionData {
  yield_value: number;
  total_production: number;
  unit_note: string;
  model_used: string;
}
