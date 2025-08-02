import Dexie, { Table } from 'dexie';
import { Feed, Article } from '@/types';

interface FeedRow {
  id: string;
  title: string;
  url: string;
  description?: string;
  last_updated: number;
  unread_count: number;
  is_active: boolean;
}

interface ArticleRow {
  id: string;
  feed_id: string;
  title: string;
  description: string;
  content?: string;
  link: string;
  image_url?: string;
  pub_date: number;
  is_read: boolean;
  is_bookmarked: boolean;
  is_skipped: boolean;
}

class SwipeFeedDB extends Dexie {
  feeds!: Table<FeedRow, string>;
  articles!: Table<ArticleRow, string>;

  constructor() {
    super('SwipeFeedDB');
    this.version(1).stores({
      feeds: 'id, title, url, last_updated, unread_count, is_active',
      articles: 'id, feed_id, title, pub_date, is_read, is_bookmarked, is_skipped'
    });
  }
}

class DatabaseServiceClass {
  private db: SwipeFeedDB;

  constructor() {
    this.db = new SwipeFeedDB();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.open();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  // Feed operations
  async saveFeed(feed: Feed): Promise<void> {
    try {
      await this.db.feeds.put({
        id: feed.id,
        title: feed.title,
        url: feed.url,
        description: feed.description,
        last_updated: feed.lastUpdated.getTime(),
        unread_count: feed.unreadCount,
        is_active: feed.isActive,
      });
    } catch (error) {
      console.error('Failed to save feed:', error);
      throw error;
    }
  }

  async getFeeds(): Promise<Feed[]> {
    try {
      const feedRows = await this.db.feeds.orderBy('title').toArray();
      return feedRows.map(row => ({
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description,
        lastUpdated: new Date(row.last_updated),
        unreadCount: row.unread_count,
        isActive: row.is_active,
      }));
    } catch (error) {
      console.error('Failed to get feeds:', error);
      throw error;
    }
  }

  async deleteFeed(feedId: string): Promise<void> {
    try {
      await this.db.transaction('rw', this.db.feeds, this.db.articles, async () => {
        // Delete associated articles first
        await this.db.articles.where('feed_id').equals(feedId).delete();
        // Delete the feed
        await this.db.feeds.delete(feedId);
      });
    } catch (error) {
      console.error('Failed to delete feed:', error);
      throw error;
    }
  }

  // Article operations
  async saveArticles(articles: Article[]): Promise<void> {
    if (articles.length === 0) return;

    try {
      const articleRows: ArticleRow[] = articles.map(article => ({
        id: article.id,
        feed_id: article.feedId,
        title: article.title,
        description: article.description,
        content: article.content,
        link: article.link,
        image_url: article.imageUrl,
        pub_date: article.pubDate.getTime(),
        is_read: article.isRead,
        is_bookmarked: article.isBookmarked,
        is_skipped: article.isSkipped,
      }));
      
      await this.db.articles.bulkPut(articleRows);
    } catch (error) {
      console.error('Failed to save articles:', error);
      throw error;
    }
  }

  async getArticles(limit?: number): Promise<Article[]> {
    try {
      let query = this.db.articles.orderBy('pub_date').reverse();
      const articleRows = limit ? await query.limit(limit).toArray() : await query.toArray();
      
      return articleRows.map(row => ({
        id: row.id,
        feedId: row.feed_id,
        title: row.title,
        description: row.description,
        content: row.content,
        link: row.link,
        imageUrl: row.image_url,
        pubDate: new Date(row.pub_date),
        isRead: row.is_read,
        isBookmarked: row.is_bookmarked,
        isSkipped: row.is_skipped,
      }));
    } catch (error) {
      console.error('Failed to get articles:', error);
      throw error;
    }
  }

  async getUnreadArticles(): Promise<Article[]> {
    try {
      const allArticles = await this.db.articles.orderBy('pub_date').reverse().toArray();
      const articleRows = allArticles.filter(article => !article.is_read && !article.is_skipped);
      
      return articleRows.map(row => ({
        id: row.id,
        feedId: row.feed_id,
        title: row.title,
        description: row.description,
        content: row.content,
        link: row.link,
        imageUrl: row.image_url,
        pubDate: new Date(row.pub_date),
        isRead: row.is_read,
        isBookmarked: row.is_bookmarked,
        isSkipped: row.is_skipped,
      }));
    } catch (error) {
      console.error('Failed to get unread articles:', error);
      throw error;
    }
  }

  async getBookmarkedArticles(): Promise<Article[]> {
    try {
      const allArticles = await this.db.articles.orderBy('pub_date').reverse().toArray();
      const articleRows = allArticles.filter(article => article.is_bookmarked);
      
      return articleRows.map(row => ({
        id: row.id,
        feedId: row.feed_id,
        title: row.title,
        description: row.description,
        content: row.content,
        link: row.link,
        imageUrl: row.image_url,
        pubDate: new Date(row.pub_date),
        isRead: row.is_read,
        isBookmarked: row.is_bookmarked,
        isSkipped: row.is_skipped,
      }));
    } catch (error) {
      console.error('Failed to get bookmarked articles:', error);
      throw error;
    }
  }

  async markArticleAsRead(articleId: string): Promise<void> {
    try {
      await this.db.articles.update(articleId, { is_read: true });
    } catch (error) {
      console.error('Failed to mark article as read:', error);
      throw error;
    }
  }

  async bookmarkArticle(articleId: string, isBookmarked: boolean): Promise<void> {
    try {
      await this.db.articles.update(articleId, { is_bookmarked: isBookmarked });
    } catch (error) {
      console.error('Failed to bookmark article:', error);
      throw error;
    }
  }

  async skipArticle(articleId: string): Promise<void> {
    try {
      await this.db.articles.update(articleId, { is_skipped: true });
    } catch (error) {
      console.error('Failed to skip article:', error);
      throw error;
    }
  }

  async updateFeedUnreadCount(feedId: string): Promise<void> {
    try {
      const allArticles = await this.db.articles.where('feed_id').equals(feedId).toArray();
      const unreadCount = allArticles.filter(article => !article.is_read && !article.is_skipped).length;
      
      await this.db.feeds.update(feedId, { unread_count: unreadCount });
    } catch (error) {
      console.error('Failed to update feed unread count:', error);
      throw error;
    }
  }

  async cleanupOldArticles(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      
      await this.db.articles
        .where('pub_date')
        .below(cutoffDate)
        .and(article => !article.is_bookmarked)
        .delete();
    } catch (error) {
      console.error('Failed to cleanup old articles:', error);
      throw error;
    }
  }
}

export const DatabaseService = new DatabaseServiceClass();