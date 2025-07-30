import SQLite from 'react-native-sqlite-storage';
import { Feed, Article } from '@/types';

// Enable debugging (remove in production)
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseServiceClass {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase(
        {
          name: 'swipefeed.db',
          location: 'default',
        }
      );
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create feeds table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS feeds (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          url TEXT UNIQUE NOT NULL,
          description TEXT,
          last_updated INTEGER,
          unread_count INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1
        );
      `);

      // Create articles table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          feed_id TEXT,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT,
          link TEXT,
          image_url TEXT,
          pub_date INTEGER,
          is_read INTEGER DEFAULT 0,
          is_bookmarked INTEGER DEFAULT 0,
          is_skipped INTEGER DEFAULT 0,
          FOREIGN KEY (feed_id) REFERENCES feeds (id)
        );
      `);

      // Create indexes for better performance
      await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles (feed_id);
      `);
      
      await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles (pub_date DESC);
      `);
      
      await this.db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_articles_unread ON articles (is_read, is_skipped);
      `);
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  // Feed operations
  async saveFeed(feed: Feed): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.executeSql(
        `INSERT OR REPLACE INTO feeds 
         (id, title, url, description, last_updated, unread_count, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          feed.id,
          feed.title,
          feed.url,
          feed.description || null,
          feed.lastUpdated.getTime(),
          feed.unreadCount,
          feed.isActive ? 1 : 0,
        ]
      );
    } catch (error) {
      console.error('Failed to save feed:', error);
      throw error;
    }
  }

  async getFeeds(): Promise<Feed[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const [results] = await this.db.executeSql('SELECT * FROM feeds ORDER BY title');
      const feeds: Feed[] = [];
      
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        feeds.push({
          id: row.id,
          title: row.title,
          url: row.url,
          description: row.description,
          lastUpdated: new Date(row.last_updated),
          unreadCount: row.unread_count,
          isActive: row.is_active === 1,
        });
      }
      
      return feeds;
    } catch (error) {
      console.error('Failed to get feeds:', error);
      throw error;
    }
  }

  async deleteFeed(feedId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          // Delete associated articles first
          tx.executeSql('DELETE FROM articles WHERE feed_id = ?', [feedId]);
          // Delete the feed
          tx.executeSql('DELETE FROM feeds WHERE id = ?', [feedId]);
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  // Article operations
  async saveArticles(articles: Article[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db || articles.length === 0) {
        resolve();
        return;
      }

      this.db.transaction(
        (tx) => {
          articles.forEach((article) => {
            tx.executeSql(
              `INSERT OR REPLACE INTO articles 
               (id, feed_id, title, description, content, link, image_url, pub_date, 
                is_read, is_bookmarked, is_skipped) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                article.id,
                article.feedId,
                article.title,
                article.description,
                article.content || null,
                article.link,
                article.imageUrl || null,
                article.pubDate.getTime(),
                article.isRead ? 1 : 0,
                article.isBookmarked ? 1 : 0,
                article.isSkipped ? 1 : 0,
              ]
            );
          });
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async getArticles(limit?: number): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = limit 
        ? 'SELECT * FROM articles ORDER BY pub_date DESC LIMIT ?'
        : 'SELECT * FROM articles ORDER BY pub_date DESC';
      const params = limit ? [limit] : [];

      this.db.transaction((tx) => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const articles: Article[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              articles.push({
                id: row.id,
                feedId: row.feed_id,
                title: row.title,
                description: row.description,
                content: row.content,
                link: row.link,
                imageUrl: row.image_url,
                pubDate: new Date(row.pub_date),
                isRead: row.is_read === 1,
                isBookmarked: row.is_bookmarked === 1,
                isSkipped: row.is_skipped === 1,
              });
            }
            resolve(articles);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getUnreadArticles(): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM articles WHERE is_read = 0 AND is_skipped = 0 ORDER BY pub_date DESC',
          [],
          (_, { rows }) => {
            const articles: Article[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              articles.push({
                id: row.id,
                feedId: row.feed_id,
                title: row.title,
                description: row.description,
                content: row.content,
                link: row.link,
                imageUrl: row.image_url,
                pubDate: new Date(row.pub_date),
                isRead: row.is_read === 1,
                isBookmarked: row.is_bookmarked === 1,
                isSkipped: row.is_skipped === 1,
              });
            }
            resolve(articles);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getBookmarkedArticles(): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM articles WHERE is_bookmarked = 1 ORDER BY pub_date DESC',
          [],
          (_, { rows }) => {
            const articles: Article[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              articles.push({
                id: row.id,
                feedId: row.feed_id,
                title: row.title,
                description: row.description,
                content: row.content,
                link: row.link,
                imageUrl: row.image_url,
                pubDate: new Date(row.pub_date),
                isRead: row.is_read === 1,
                isBookmarked: row.is_bookmarked === 1,
                isSkipped: row.is_skipped === 1,
              });
            }
            resolve(articles);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async markArticleAsRead(articleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE articles SET is_read = 1 WHERE id = ?',
            [articleId]
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async bookmarkArticle(articleId: string, isBookmarked: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE articles SET is_bookmarked = ? WHERE id = ?',
            [isBookmarked ? 1 : 0, articleId]
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async skipArticle(articleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE articles SET is_skipped = 1 WHERE id = ?',
            [articleId]
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async updateFeedUnreadCount(feedId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            `UPDATE feeds SET unread_count = (
               SELECT COUNT(*) FROM articles 
               WHERE feed_id = ? AND is_read = 0 AND is_skipped = 0
             ) WHERE id = ?`,
            [feedId, feedId]
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  async cleanupOldArticles(daysToKeep: number = 30): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM articles WHERE pub_date < ? AND is_bookmarked = 0',
            [cutoffDate]
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }
}

export const DatabaseService = new DatabaseServiceClass();