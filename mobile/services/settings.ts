import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types/settings';

const SETTINGS_KEY = '@agrisense_settings';

const defaultSettings: AppSettings = {
  theme: 'system',
  measurementUnit: 'metric',
  notificationsEnabled: false,
  hasCompletedOnboarding: false,
};

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : defaultSettings;
    } catch (e) {
      console.error('Failed to load settings', e);
      return defaultSettings;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },
};
