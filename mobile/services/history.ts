import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem } from '../types/history';

const HISTORY_KEY = '@agrisense_history';

export const historyService = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load history', e);
      return [];
    }
  },

  async addHistoryItem(item: HistoryItem): Promise<void> {
    try {
      const currentHistory = await this.getHistory();
      // Add to beginning of array (most recent first)
      const newHistory = [item, ...currentHistory];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history item', e);
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const currentHistory = await this.getHistory();
      const newHistory = currentHistory.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to delete history item', e);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  },
};
