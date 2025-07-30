import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '@/types';

const STORAGE_KEYS = {
  SETTINGS: '@swipefeed:settings',
  LAST_UPDATE: '@swipefeed:last_update',
  ONBOARDING_COMPLETED: '@swipefeed:onboarding_completed',
  CURRENT_ARTICLE_INDEX: '@swipefeed:current_article_index',
} as const;

class StorageServiceClass {
  async saveSettings(settings: Settings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, settingsJson);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async getSettings(): Promise<Settings | null> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        return JSON.parse(settingsJson) as Settings;
      }
      return null;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  }

  async saveLastUpdateTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp.toString());
    } catch (error) {
      console.error('Failed to save last update time:', error);
      throw new Error('Failed to save last update time');
    }
  }

  async getLastUpdateTime(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Failed to get last update time:', error);
      return null;
    }
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      throw new Error('Failed to save onboarding status');
    }
  }

  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      return false;
    }
  }

  async saveCurrentArticleIndex(index: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ARTICLE_INDEX, index.toString());
    } catch (error) {
      console.error('Failed to save current article index:', error);
      throw new Error('Failed to save current article index');
    }
  }

  async getCurrentArticleIndex(): Promise<number> {
    try {
      const index = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ARTICLE_INDEX);
      return index ? parseInt(index, 10) : 0;
    } catch (error) {
      console.error('Failed to get current article index:', error);
      return 0;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        if (key.startsWith('@swipefeed:')) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  async exportData(): Promise<string> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const swipeFeedKeys = keys.filter(key => key.startsWith('@swipefeed:'));
      const data: Record<string, string | null> = {};
      
      for (const key of swipeFeedKeys) {
        data[key] = await AsyncStorage.getItem(key);
      }
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  async importData(dataJson: string): Promise<void> {
    try {
      const data = JSON.parse(dataJson) as Record<string, string | null>;
      const entries: [string, string][] = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('@swipefeed:') && value !== null) {
          entries.push([key, value]);
        }
      }
      
      await AsyncStorage.multiSet(entries);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data');
    }
  }

  async debugLogAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const swipeFeedKeys = keys.filter(key => key.startsWith('@swipefeed:'));
      
      console.log('=== SwipeFeed AsyncStorage Data ===');
      for (const key of swipeFeedKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`${key}: ${value}`);
      }
      console.log('=== End SwipeFeed Data ===');
    } catch (error) {
      console.error('Failed to debug log data:', error);
    }
  }
}

export const StorageService = new StorageServiceClass();