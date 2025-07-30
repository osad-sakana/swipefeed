import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedItem } from '@/components/FeedItem';
import { EmptyState } from '@/components/EmptyState';
import { useAppContext } from '@/context/AppContext';
import { Feed } from '@/types';
import { RSSService } from '@/services/RSSService';

interface FeedManagerScreenProps {
  navigation: any;
}

export function FeedManagerScreen({ navigation }: FeedManagerScreenProps): JSX.Element {
  const { state, theme, addFeed, removeFeed, refreshFeeds } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleAddFeed = async (): Promise<void> => {
    if (!feedUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid RSS feed URL');
      return;
    }

    setIsValidating(true);
    try {
      await addFeed(feedUrl.trim());
      setFeedUrl('');
      setShowAddModal(false);
      Alert.alert('Success', 'Feed added successfully!');
    } catch (error) {
      Alert.alert(
        'Failed to Add Feed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteFeed = async (feed: Feed): Promise<void> => {
    try {
      await removeFeed(feed.id);
      Alert.alert('Success', 'Feed deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete feed');
    }
  };

  const handleToggleFeedActive = async (feed: Feed): Promise<void> => {
    // This would update the feed's active status
    // For now, we'll just show a message
    Alert.alert(
      feed.isActive ? 'Disable Feed' : 'Enable Feed',
      `${feed.isActive ? 'Disable' : 'Enable'} "${feed.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: feed.isActive ? 'Disable' : 'Enable',
          onPress: () => {
            // Implementation would go here to toggle feed active status
            console.log(`Toggling feed ${feed.id} to ${!feed.isActive}`);
          }
        },
      ]
    );
  };

  const handleUpdateFeed = async (feed: Feed): Promise<void> => {
    setIsUpdating(feed.id);
    try {
      await RSSService.updateFeed(feed);
      Alert.alert('Success', `Updated "${feed.title}"`);
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update feed'
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRefreshAll = async (): Promise<void> => {
    try {
      await refreshFeeds();
      Alert.alert('Success', 'All feeds refreshed');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh feeds');
    }
  };

  const renderFeedItem = ({ item }: { item: Feed }): JSX.Element => (
    <View style={styles.feedItemContainer}>
      <FeedItem
        feed={item}
        onToggleActive={handleToggleFeedActive}
        onDelete={handleDeleteFeed}
        onUpdate={handleUpdateFeed}
      />
      {isUpdating === item.id && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.updatingText, { color: theme.colors.primary }]}>
            Updating...
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = (): JSX.Element => (
    <EmptyState
      title="No RSS Feeds"
      message="Add your first RSS feed to start reading articles. You can add feeds from your favorite news sites, blogs, or any website with an RSS feed."
      buttonText="Add Feed"
      onButtonPress={() => setShowAddModal(true)}
      icon="📡"
    />
  );

  const AddFeedModal = (): JSX.Element => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowAddModal(false)}
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Add RSS Feed
          </Text>
          <TouchableOpacity
            onPress={handleAddFeed}
            disabled={isValidating || !feedUrl.trim()}
            style={[
              styles.addButton,
              {
                backgroundColor: (!feedUrl.trim() || isValidating) 
                  ? theme.colors.border 
                  : theme.colors.primary
              }
            ]}
          >
            {isValidating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            RSS Feed URL
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }
            ]}
            placeholder="https://example.com/feed.xml"
            placeholderTextColor={theme.colors.textSecondary}
            value={feedUrl}
            onChangeText={setFeedUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            onSubmitEditing={handleAddFeed}
          />
          
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            Enter the URL of an RSS or Atom feed. Most news sites and blogs have RSS feeds you can subscribe to.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          RSS Feeds
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleRefreshAll}
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            disabled={state.isLoading}
          >
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Refresh All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={[styles.headerButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.addButtonText}>Add Feed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={state.feeds}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <AddFeedModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  feedItemContainer: {
    position: 'relative',
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  updatingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});