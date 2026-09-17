import AsyncStorage from '@react-native-async-storage/async-storage';
import { SoilData } from '../types/soil';

const SOIL_KEY = '@agrisense_soil';

export const soilService = {
  async getSoilData(): Promise<SoilData | null> {
    try {
      const data = await AsyncStorage.getItem(SOIL_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load soil data', e);
      return null;
    }
  },

  async saveSoilData(data: SoilData): Promise<void> {
    try {
      await AsyncStorage.setItem(SOIL_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save soil data', e);
    }
  },

  async clearSoilData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SOIL_KEY);
    } catch (e) {
      console.error('Failed to clear soil data', e);
    }
  }
};
