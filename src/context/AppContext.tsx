import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, Settings, Theme, Feed } from '@/types';
import { DatabaseService } from '@/services/DatabaseService';
import { StorageService } from '@/services/StorageService';
import { RSSService } from '@/services/RSSService';

const initialState: AppState = {
  feeds: [],
  articles: [],
  currentArticleIndex: 0,
  unreadArticles: [],
  isLoading: false,
  error: null,
};

const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
  },
};

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF453A',
  },
};

const defaultSettings: Settings = {
  theme: 'light',
  autoUpdateInterval: 30,
  swipeSensitivity: 0.7,
  showImages: true,
  fontSize: 'medium',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FEEDS':
      return { ...state, feeds: action.payload };
    
    case 'ADD_FEED':
      return { ...state, feeds: [...state.feeds, action.payload] };
    
    case 'REMOVE_FEED':
      return {
        ...state,
        feeds: state.feeds.filter(feed => feed.id !== action.payload),
        articles: state.articles.filter(article => article.feedId !== action.payload),
      };
    
    case 'UPDATE_FEED':
      return {
        ...state,
        feeds: state.feeds.map(feed =>
          feed.id === action.payload.id ? action.payload : feed
        ),
      };
    
    case 'REORDER_FEEDS':
      const { from, to } = action.payload;
      const reorderedFeeds = [...state.feeds];
      const [movedFeed] = reorderedFeeds.splice(from, 1);
      reorderedFeeds.splice(to, 0, movedFeed);
      
      // Update order property for all feeds
      const feedsWithUpdatedOrder = reorderedFeeds.map((feed, index) => ({
        ...feed,
        order: index
      }));
      
      return {
        ...state,
        feeds: feedsWithUpdatedOrder,
      };
    
    case 'SET_ARTICLES':
      const unreadArticles = action.payload.filter(article => !article.isRead && !article.isSkipped);
      return {
        ...state,
        articles: action.payload,
        unreadArticles,
        currentArticleIndex: Math.min(state.currentArticleIndex, unreadArticles.length - 1),
      };
    
    case 'ADD_ARTICLES':
      const newArticles = [...state.articles, ...action.payload];
      const newUnreadArticles = newArticles.filter(article => !article.isRead && !article.isSkipped);
      return {
        ...state,
        articles: newArticles,
        unreadArticles: newUnreadArticles,
      };
    
    case 'MARK_AS_READ':
      const updatedReadArticles = state.articles.map(article =>
        article.id === action.payload ? { ...article, isRead: true } : article
      );
      return {
        ...state,
        articles: updatedReadArticles,
        unreadArticles: updatedReadArticles.filter(article => !article.isRead && !article.isSkipped),
      };
    
    case 'ADD_BOOKMARK':
      const updatedBookmarkArticles = state.articles.map(article =>
        article.id === action.payload ? { ...article, isBookmarked: true } : article
      );
      return {
        ...state,
        articles: updatedBookmarkArticles,
      };
    
    case 'REMOVE_BOOKMARK':
      const updatedUnbookmarkArticles = state.articles.map(article =>
        article.id === action.payload ? { ...article, isBookmarked: false } : article
      );
      return {
        ...state,
        articles: updatedUnbookmarkArticles,
      };
    
    case 'SKIP_ARTICLE':
      const updatedSkippedArticles = state.articles.map(article =>
        article.id === action.payload ? { ...article, isSkipped: true } : article
      );
      const updatedUnreadAfterSkip = updatedSkippedArticles.filter(
        article => !article.isRead && !article.isSkipped
      );
      return {
        ...state,
        articles: updatedSkippedArticles,
        unreadArticles: updatedUnreadAfterSkip,
      };
    
    case 'SET_CURRENT_ARTICLE_INDEX':
      return {
        ...state,
        currentArticleIndex: Math.max(0, Math.min(action.payload, state.unreadArticles.length - 1)),
      };
    
    case 'NEXT_ARTICLE':
      const nextIndex = state.currentArticleIndex + 1;
      return {
        ...state,
        currentArticleIndex: nextIndex < state.unreadArticles.length ? nextIndex : state.currentArticleIndex,
      };
    
    case 'UPDATE_UNREAD_ARTICLES':
      const filteredUnread = state.articles.filter(article => !article.isRead && !article.isSkipped);
      return {
        ...state,
        unreadArticles: filteredUnread,
        currentArticleIndex: Math.min(state.currentArticleIndex, filteredUnread.length - 1),
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  settings: Settings;
  theme: Theme;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  markAsRead: (articleId: string) => Promise<void>;
  addBookmark: (articleId: string) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  skipArticle: (articleId: string) => Promise<void>;
  nextArticle: () => void;
  refreshFeeds: () => Promise<void>;
  addFeed: (url: string) => Promise<void>;
  removeFeed: (feedId: string) => Promise<void>;
  reorderFeeds: (fromIndex: number, toIndex: number) => Promise<void>;
  updateFeed: (feed: Feed) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);
  
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await DatabaseService.initialize();
      
      const savedSettings = await StorageService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
      
      const feeds = await DatabaseService.getFeeds();
      dispatch({ type: 'SET_FEEDS', payload: feeds });
      
      const articles = await DatabaseService.getArticles();
      dispatch({ type: 'SET_ARTICLES', payload: articles });
      
      // If we have feeds but no articles, try to fetch articles
      if (feeds.length > 0 && articles.length === 0) {
        console.log('Found feeds but no articles, attempting to fetch...');
        try {
          await RSSService.refreshAllFeeds();
          const refreshedArticles = await DatabaseService.getArticles();
          dispatch({ type: 'SET_ARTICLES', payload: refreshedArticles });
        } catch (refreshError) {
          console.warn('Failed to refresh feeds during initialization:', refreshError);
        }
      }
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to initialize app' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>): Promise<void> => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await StorageService.saveSettings(updatedSettings);
  };

  const markAsRead = async (articleId: string): Promise<void> => {
    try {
      await DatabaseService.markArticleAsRead(articleId);
      dispatch({ type: 'MARK_AS_READ', payload: articleId });
      dispatch({ type: 'UPDATE_UNREAD_ARTICLES' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark article as read' });
    }
  };

  const addBookmark = async (articleId: string): Promise<void> => {
    try {
      await DatabaseService.bookmarkArticle(articleId, true);
      dispatch({ type: 'ADD_BOOKMARK', payload: articleId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to bookmark article' });
    }
  };

  const removeBookmark = async (articleId: string): Promise<void> => {
    try {
      await DatabaseService.bookmarkArticle(articleId, false);
      dispatch({ type: 'REMOVE_BOOKMARK', payload: articleId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove bookmark' });
    }
  };

  const skipArticle = async (articleId: string): Promise<void> => {
    try {
      await DatabaseService.skipArticle(articleId);
      dispatch({ type: 'SKIP_ARTICLE', payload: articleId });
      dispatch({ type: 'UPDATE_UNREAD_ARTICLES' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to skip article' });
    }
  };

  const nextArticle = (): void => {
    dispatch({ type: 'NEXT_ARTICLE' });
  };

  const refreshFeeds = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await RSSService.refreshAllFeeds();
      
      // Reload feeds and articles
      const feeds = await DatabaseService.getFeeds();
      dispatch({ type: 'SET_FEEDS', payload: feeds });
      
      const articles = await DatabaseService.getArticles();
      dispatch({ type: 'SET_ARTICLES', payload: articles });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh feeds' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addFeed = async (url: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Validate the feed first
      const validation = await RSSService.validateFeedUrl(url);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid RSS feed');
      }
      
      // Get current max order
      const maxOrder = state.feeds.length > 0 ? Math.max(...state.feeds.map(f => f.order)) : -1;
      
      // Create new feed object
      const newFeed: Feed = {
        id: btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16),
        title: validation.title || 'New Feed',
        url: url,
        description: validation.description,
        lastUpdated: new Date(),
        unreadCount: 0,
        isActive: true,
        order: maxOrder + 1,
      };
      
      // Save feed to database
      await DatabaseService.saveFeed(newFeed);
      
      // Fetch articles for the new feed
      const articles = await RSSService.fetchFeed(newFeed);
      if (articles.length > 0) {
        await DatabaseService.saveArticles(articles);
        await DatabaseService.updateFeedUnreadCount(newFeed.id);
      }
      
      dispatch({ type: 'ADD_FEED', payload: newFeed });
      
      // Reload articles to include new feed's articles
      const allArticles = await DatabaseService.getArticles();
      dispatch({ type: 'SET_ARTICLES', payload: allArticles });
      
    } catch (error) {
      throw error; // Let the calling component handle the error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFeed = async (feedId: string): Promise<void> => {
    try {
      await DatabaseService.deleteFeed(feedId);
      dispatch({ type: 'REMOVE_FEED', payload: feedId });
      dispatch({ type: 'UPDATE_UNREAD_ARTICLES' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove feed' });
    }
  };

  const reorderFeeds = async (fromIndex: number, toIndex: number): Promise<void> => {
    try {
      dispatch({ type: 'REORDER_FEEDS', payload: { from: fromIndex, to: toIndex } });
      
      // Update database with new order
      const reorderedFeeds = [...state.feeds];
      const [movedFeed] = reorderedFeeds.splice(fromIndex, 1);
      reorderedFeeds.splice(toIndex, 0, movedFeed);
      const feedsWithUpdatedOrder = reorderedFeeds.map((feed, index) => ({
        ...feed,
        order: index
      }));
      
      await DatabaseService.reorderFeeds(feedsWithUpdatedOrder);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder feeds' });
    }
  };

  const updateFeed = async (updatedFeed: Feed): Promise<void> => {
    try {
      await DatabaseService.saveFeed(updatedFeed);
      dispatch({ type: 'UPDATE_FEED', payload: updatedFeed });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update feed' });
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    settings,
    theme,
    updateSettings,
    markAsRead,
    addBookmark,
    removeBookmark,
    skipArticle,
    nextArticle,
    refreshFeeds,
    addFeed,
    removeFeed,
    reorderFeeds,
    updateFeed,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}