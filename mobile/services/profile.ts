import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/profile';

const PROFILE_KEY = '@agrisense_profile';

export const profileService = {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load profile', e);
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
    } catch (e) {
      console.error('Failed to clear profile', e);
    }
  }
};
