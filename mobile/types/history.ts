import { CropRecommendationInput, YieldEstimationInput, CropPredictionData, YieldPredictionData } from './prediction';

export interface HistoryItemBase {
  id: string;
  timestamp: string;
}

export interface CropHistoryItem extends HistoryItemBase {
  type: 'crop';
  input: CropRecommendationInput;
  result: CropPredictionData;
}

export interface YieldHistoryItem extends HistoryItemBase {
  type: 'yield';
  input: YieldEstimationInput;
  result: YieldPredictionData;
}

export type HistoryItem = CropHistoryItem | YieldHistoryItem;
