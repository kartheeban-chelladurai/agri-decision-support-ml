export interface ApiResponse<T> {
  success: boolean;
  prediction?: T;
  input_summary?: Record<string, any>;
  timestamp?: string;
  error?: {
    code: string;
    message: string;
    details: Array<{ field?: string; message: string }>;
  };
}

export interface HealthCheckResponse {
  status: string;
  models_loaded: boolean;
  version: string;
}

export interface CropsMetadataResponse {
  recommendation_crops: string[];
  yield_crops: string[];
}

export interface SeasonsMetadataResponse {
  seasons: string[];
}

export interface ModelInfoDetail {
  model_name: string;
  features: string[];
  train_rows: number;
  test_rows: number;
}

export interface RecommendationModelInfo extends ModelInfoDetail {
  accuracy: number;
  cv_accuracy_mean: number;
  cv_accuracy_std: number;
  n_classes: number;
}

export interface YieldModelInfo extends ModelInfoDetail {
  r2: number;
  rmse: number;
  mae: number;
  cv_r2_mean: number;
  cv_r2_std: number;
  n_crops: number;
  n_seasons: number;
}

export interface ModelInfoResponse {
  recommendation: RecommendationModelInfo;
  yield_estimation: YieldModelInfo;
}
