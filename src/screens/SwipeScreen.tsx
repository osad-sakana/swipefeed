import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGesture } from '@/components/SwipeGesture';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { useAppContext } from '@/context/AppContext';
import { SwipeAction, Feed } from '@/types';

interface SwipeScreenProps {
  navigation: any;
}

export function SwipeScreen({ navigation }: SwipeScreenProps): JSX.Element {
  const { 
    state, 
    theme, 
    markAsRead, 
    addBookmark, 
    nextArticle,
    refreshFeeds 
  } = useAppContext();
  
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentArticle = state.unreadArticles[state.currentArticleIndex];
  const currentFeed = feeds.find(feed => feed.id === currentArticle?.feedId);

  useEffect(() => {
    loadFeeds();
  }, [state.feeds]);

  const loadFeeds = (): void => {
    setFeeds(state.feeds);
  };

  const handleSwipeAction = async (action: SwipeAction): Promise<void> => {
    if (!currentArticle) return;

    try {
      switch (action.type) {
        case 'read':
          await markAsRead(currentArticle.id);
          break;
        case 'bookmark':
          await addBookmark(currentArticle.id);
          break;
      }
      
      // Move to next article
      nextArticle();
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to perform action. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRefresh = async (): Promise<void> => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshFeeds();
    } catch (error) {
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh feeds. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddFeed = (): void => {
    navigation.navigate('FeedManager');
  };

  const renderContent = (): JSX.Element => {
    if (state.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (state.error) {
      return (
        <EmptyState
          title="Something went wrong"
          message={state.error}
          buttonText="Try Again"
          onButtonPress={handleRefresh}
          icon="⚠️"
        />
      );
    }

    if (state.feeds.length === 0) {
      return (
        <EmptyState
          title="No RSS Feeds"
          message="Add your first RSS feed to start reading articles. Swipe right to mark as read, swipe left to bookmark."
          buttonText="Add Feed"
          onButtonPress={handleAddFeed}
          icon="📡"
        />
      );
    }

    if (state.unreadArticles.length === 0) {
      return (
        <EmptyState
          title="All Caught Up!"
          message="You've read all available articles. Pull down to refresh or add more feeds to discover new content."
          buttonText="Refresh"
          onButtonPress={handleRefresh}
          icon="🎉"
        />
      );
    }

    if (!currentArticle) {
      return (
        <EmptyState
          title="No Articles"
          message="No articles available to display."
          buttonText="Refresh"
          onButtonPress={handleRefresh}
          icon="📰"
        />
      );
    }

    return (
      <SwipeGesture
        onSwipeAction={handleSwipeAction}
        disabled={isRefreshing}
        style={styles.swipeContainer}
      >
        <ArticleCard
          article={currentArticle}
          feed={currentFeed}
        />
      </SwipeGesture>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderContent()}
      
      {/* Progress indicator */}
      {state.unreadArticles.length > 0 && (
        <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
          <View 
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.border }
            ]}
          >
            <View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${((state.currentArticleIndex + 1) / state.unreadArticles.length) * 100}%`
                }
              ]}
            />
          </View>
          <View style={styles.progressText}>
            <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
              {state.currentArticleIndex + 1} of {state.unreadArticles.length}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});