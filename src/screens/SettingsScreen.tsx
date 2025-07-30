import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import { Settings } from '@/types';
import { StorageService } from '@/services/StorageService';
import { DatabaseService } from '@/services/DatabaseService';

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps): JSX.Element {
  const { settings, theme, updateSettings } = useAppContext();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showUpdateIntervalModal, setShowUpdateIntervalModal] = useState(false);

  const handleThemeChange = async (newTheme: 'light' | 'dark'): Promise<void> => {
    try {
      await updateSettings({ theme: newTheme });
      setShowThemeModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large'): Promise<void> => {
    try {
      await updateSettings({ fontSize });
      setShowFontSizeModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update font size');
    }
  };

  const handleUpdateIntervalChange = async (interval: number): Promise<void> => {
    try {
      await updateSettings({ autoUpdateInterval: interval });
      setShowUpdateIntervalModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update refresh interval');
    }
  };

  const handleSwipeSensitivityChange = async (sensitivity: number): Promise<void> => {
    try {
      await updateSettings({ swipeSensitivity: sensitivity });
    } catch (error) {
      Alert.alert('Error', 'Failed to update swipe sensitivity');
    }
  };

  const handleShowImagesToggle = async (showImages: boolean): Promise<void> => {
    try {
      await updateSettings({ showImages });
    } catch (error) {
      Alert.alert('Error', 'Failed to update image settings');
    }
  };

  const handleClearData = (): void => {
    Alert.alert(
      'Clear All Data',
      'This will delete all feeds, articles, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.cleanupOldArticles(0); // Delete all articles
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        },
      ]
    );
  };

  const handleExportData = async (): Promise<void> => {
    try {
      const data = await StorageService.exportData();
      // In a real app, you would use a file picker or share sheet
      Alert.alert('Export Data', 'Data exported successfully (feature not fully implemented in demo)');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getThemeDisplayName = (themeName: string): string => {
    return themeName === 'light' ? 'Light' : 'Dark';
  };

  const getFontSizeDisplayName = (fontSize: string): string => {
    return fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
  };

  const SettingItem = ({ 
    title, 
    value, 
    onPress, 
    showArrow = true 
  }: { 
    title: string; 
    value?: string; 
    onPress: () => void; 
    showArrow?: boolean;
  }): JSX.Element => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {showArrow && (
          <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>
            →
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const SwitchItem = ({ 
    title, 
    value, 
    onValueChange 
  }: { 
    title: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
  }): JSX.Element => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const OptionModal = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    selectedValue, 
    onSelect 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: Array<{ label: string; value: any }>;
    selectedValue: any;
    onSelect: (value: any) => void;
  }): JSX.Element => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.modalOption,
                selectedValue === option.value && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modalOptionText, 
                { color: theme.colors.text },
                selectedValue === option.value && { color: theme.colors.primary }
              ]}>
                {option.label}
              </Text>
              {selectedValue === option.value && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.modalCloseButton, { backgroundColor: theme.colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalCloseButtonText, { color: theme.colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          APPEARANCE
        </Text>
        
        <SettingItem
          title="Theme"
          value={getThemeDisplayName(settings.theme)}
          onPress={() => setShowThemeModal(true)}
        />
        
        <SettingItem
          title="Font Size"
          value={getFontSizeDisplayName(settings.fontSize)}
          onPress={() => setShowFontSizeModal(true)}
        />
        
        <SwitchItem
          title="Show Images"
          value={settings.showImages}
          onValueChange={handleShowImagesToggle}
        />

        {/* Reading Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          READING
        </Text>
        
        <SettingItem
          title="Auto Refresh Interval"
          value={`${settings.autoUpdateInterval} minutes`}
          onPress={() => setShowUpdateIntervalModal(true)}
        />
        
        <SettingItem
          title="Swipe Sensitivity"
          value={`${Math.round(settings.swipeSensitivity * 100)}%`}
          onPress={() => {
            // Simple sensitivity adjustment - could be enhanced with a slider
            const newSensitivity = settings.swipeSensitivity >= 1 ? 0.3 : settings.swipeSensitivity + 0.1;
            handleSwipeSensitivityChange(Math.round(newSensitivity * 10) / 10);
          }}
        />

        {/* Data Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          DATA
        </Text>
        
        <SettingItem
          title="Export Data"
          onPress={handleExportData}
        />
        
        <SettingItem
          title="Clear All Data"
          onPress={handleClearData}
        />

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ABOUT
        </Text>
        
        <SettingItem
          title="Version"
          value="1.0.0"
          onPress={() => {}}
          showArrow={false}
        />
      </ScrollView>

      {/* Theme Modal */}
      <OptionModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="Theme"
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        selectedValue={settings.theme}
        onSelect={handleThemeChange}
      />

      {/* Font Size Modal */}
      <OptionModal
        visible={showFontSizeModal}
        onClose={() => setShowFontSizeModal(false)}
        title="Font Size"
        options={[
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ]}
        selectedValue={settings.fontSize}
        onSelect={handleFontSizeChange}
      />

      {/* Update Interval Modal */}
      <OptionModal
        visible={showUpdateIntervalModal}
        onClose={() => setShowUpdateIntervalModal(false)}
        title="Auto Refresh Interval"
        options={[
          { label: '15 minutes', value: 15 },
          { label: '30 minutes', value: 30 },
          { label: '1 hour', value: 60 },
          { label: '2 hours', value: 120 },
          { label: '4 hours', value: 240 },
          { label: 'Never', value: 0 },
        ]}
        selectedValue={settings.autoUpdateInterval}
        onSelect={handleUpdateIntervalChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});