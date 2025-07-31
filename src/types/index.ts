export interface Feed {
  id: string;
  title: string;
  url: string;
  description?: string | undefined;
  lastUpdated: Date;
  unreadCount: number;
  isActive: boolean;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  description: string;
  content?: string | undefined;
  link: string;
  pubDate: Date;
  imageUrl?: string | undefined;
  isRead: boolean;
  isBookmarked: boolean;
  isSkipped: boolean;
}

export interface SwipeAction {
  type: 'read' | 'bookmark';
  direction: 'left' | 'right';
  threshold: number;
}

export interface AppState {
  feeds: Feed[];
  articles: Article[];
  currentArticleIndex: number;
  unreadArticles: Article[];
  isLoading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FEEDS'; payload: Feed[] }
  | { type: 'ADD_FEED'; payload: Feed }
  | { type: 'REMOVE_FEED'; payload: string }
  | { type: 'UPDATE_FEED'; payload: Feed }
  | { type: 'SET_ARTICLES'; payload: Article[] }
  | { type: 'ADD_ARTICLES'; payload: Article[] }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'ADD_BOOKMARK'; payload: string }
  | { type: 'REMOVE_BOOKMARK'; payload: string }
  | { type: 'SKIP_ARTICLE'; payload: string }
  | { type: 'SET_CURRENT_ARTICLE_INDEX'; payload: number }
  | { type: 'NEXT_ARTICLE' }
  | { type: 'UPDATE_UNREAD_ARTICLES' };

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

export interface Settings {
  theme: 'light' | 'dark';
  autoUpdateInterval: number; // minutes
  swipeSensitivity: number; // 0.1 to 1.0
  showImages: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface SwipeGestureState {
  translateX: number;
  opacity: number;
  scale: number;
  isActive: boolean;
  actionType?: 'read' | 'bookmark';
}