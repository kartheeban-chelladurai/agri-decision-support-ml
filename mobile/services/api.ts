import {
  ApiResponse,
  HealthCheckResponse,
  CropsMetadataResponse,
  SeasonsMetadataResponse,
  ModelInfoResponse,
} from '../types/api';
import { 
  CropRecommendationInput, 
  YieldEstimationInput, 
  CropPredictionData, 
  YieldPredictionData 
} from '../types/prediction';

// Use EXPO_PUBLIC_API_URL if defined, otherwise fallback to Android Emulator default
// For physical devices, you must set EXPO_PUBLIC_API_URL to your LAN IP (e.g., http://192.168.x.x:8000/api/v1)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Attempt to parse JSON response
    const data = await response.json();
    
    // For non-2xx responses, the API will still return our standard error format
    // but fetch() doesn't throw on non-2xx status, which is what we want.
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not connect to the server. Please check your internet connection or API URL configuration.',
        details: [],
      },
    };
  }
}

/**
 * The /health and /metadata/* endpoints return their payload directly, with no
 * { success, prediction } envelope -- only /predict/* is wrapped. Reading them
 * through fetchApi() made `response.success` undefined, so every metadata call
 * was treated as a failure and the crop/season dropdowns never populated.
 * Returns null on a network error; callers already handle null.
 */
async function fetchRaw<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const api = {
  healthCheck: () => fetchRaw<HealthCheckResponse>('/health'),
  getCrops: () => fetchRaw<CropsMetadataResponse>('/metadata/crops'),
  getSeasons: () => fetchRaw<SeasonsMetadataResponse>('/metadata/seasons'),
  getModelInfo: () => fetchRaw<ModelInfoResponse>('/metadata/model-info'),
  predictCrop: (data: CropRecommendationInput) => 
    fetchApi<CropPredictionData>('/predict/crop', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  predictYield: (data: YieldEstimationInput) => 
    fetchApi<YieldPredictionData>('/predict/yield', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
