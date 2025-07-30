import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { useAppContext } from '@/context/AppContext';
import { Article, Feed } from '@/types';
import { DatabaseService } from '@/services/DatabaseService';
import { formatDate } from '@/utils/dateUtils';

interface BookmarksScreenProps {
  navigation: any;
}

export function BookmarksScreen({ navigation }: BookmarksScreenProps): JSX.Element {
  const { state, theme, settings, removeBookmark } = useAppContext();
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarkedArticles();
  }, [state.articles]);

  const loadBookmarkedArticles = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const articles = await DatabaseService.getBookmarkedArticles();
      setBookmarkedArticles(articles);
    } catch (error) {
      console.error('Failed to load bookmarked articles:', error);
      Alert.alert('Error', 'Failed to load bookmarked articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (article: Article): Promise<void> => {
    Alert.alert(
      'Remove Bookmark',
      `Remove "${article.title}" from bookmarks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBookmark(article.id);
              setBookmarkedArticles(prev => prev.filter(a => a.id !== article.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove bookmark');
            }
          }
        },
      ]
    );
  };

  const handleOpenArticle = async (article: Article): Promise<void> => {
    try {
      await Linking.openURL(article.link);
    } catch (error) {
      Alert.alert('Error', 'Failed to open article');
    }
  };

  const getFeedTitle = (feedId: string): string => {
    const feed = state.feeds.find(f => f.id === feedId);
    return feed?.title || 'Unknown Feed';
  };

  const renderArticleItem = ({ item }: { item: Article }): JSX.Element => (
    <TouchableOpacity
      style={[styles.articleItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleOpenArticle(item)}
      activeOpacity={0.7}
    >
      {settings.showImages && item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <Text style={[styles.feedName, { color: theme.colors.primary }]} numberOfLines={1}>
            {getFeedTitle(item.feedId)}
          </Text>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {formatDate(item.pubDate)}
          </Text>
        </View>
        
        <Text style={[styles.articleTitle, { color: theme.colors.text }]} numberOfLines={3}>
          {item.title}
        </Text>
        
        <Text style={[styles.articleDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.articleActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleOpenArticle(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={() => handleRemoveBookmark(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (): JSX.Element => (
    <EmptyState
      title="No Bookmarks"
      message="Articles you bookmark will appear here. While reading articles, swipe left to bookmark them for later reading."
      buttonText="Start Reading"
      onButtonPress={() => navigation.navigate('Swipe')}
      icon="🔖"
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bookmarks
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading bookmarks...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Bookmarks
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {bookmarkedArticles.length} {bookmarkedArticles.length === 1 ? 'article' : 'articles'}
        </Text>
      </View>

      <FlatList
        data={bookmarkedArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  articleItem: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleImage: {
    width: '100%',
    height: 150,
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  articleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  articleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
});