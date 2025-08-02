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
      localStorage.setItem(STORAGE_KEYS.SETTINGS, settingsJson);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async getSettings(): Promise<Settings | null> {
    try {
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
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
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp.toString());
    } catch (error) {
      console.error('Failed to save last update time:', error);
      throw new Error('Failed to save last update time');
    }
  }

  async getLastUpdateTime(): Promise<number | null> {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Failed to get last update time:', error);
      return null;
    }
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      throw new Error('Failed to save onboarding status');
    }
  }

  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      return false;
    }
  }

  async saveCurrentArticleIndex(index: number): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ARTICLE_INDEX, index.toString());
    } catch (error) {
      console.error('Failed to save current article index:', error);
      throw new Error('Failed to save current article index');
    }
  }

  async getCurrentArticleIndex(): Promise<number> {
    try {
      const index = localStorage.getItem(STORAGE_KEYS.CURRENT_ARTICLE_INDEX);
      return index ? parseInt(index, 10) : 0;
    } catch (error) {
      console.error('Failed to get current article index:', error);
      return 0;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  async getStorageSize(): Promise<number> {
    try {
      let totalSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('@swipefeed:')) {
          const value = localStorage.getItem(key);
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
      const data: Record<string, string | null> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('@swipefeed:')) {
          data[key] = localStorage.getItem(key);
        }
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
      
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('@swipefeed:') && value !== null) {
          localStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data');
    }
  }

  async debugLogAllData(): Promise<void> {
    try {
      console.log('=== SwipeFeed localStorage Data ===');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('@swipefeed:')) {
          const value = localStorage.getItem(key);
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=== End SwipeFeed Data ===');
    } catch (error) {
      console.error('Failed to debug log data:', error);
    }
  }
}

export const StorageService = new StorageServiceClass();