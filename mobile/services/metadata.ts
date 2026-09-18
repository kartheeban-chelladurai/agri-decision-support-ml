import { api } from './api';
import { CropsMetadataResponse, SeasonsMetadataResponse } from '../types/api';

// Simple in-memory cache to avoid repeated network calls
let cropsCache: CropsMetadataResponse | null = null;
let seasonsCache: SeasonsMetadataResponse | null = null;

export const metadataService = {
  async getCrops(forceRefresh = false): Promise<CropsMetadataResponse | null> {
    if (cropsCache && !forceRefresh) return cropsCache;
    
    const response = await api.getCrops();
    if (response) {
      cropsCache = response;
      return cropsCache;
    }
    return null;
  },

  async getSeasons(forceRefresh = false): Promise<SeasonsMetadataResponse | null> {
    if (seasonsCache && !forceRefresh) return seasonsCache;
    
    const response = await api.getSeasons();
    if (response) {
      seasonsCache = response;
      return seasonsCache;
    }
    return null;
  }
};
