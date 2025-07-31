import Parser from 'rss-parser';
import { Feed, Article } from '@/types';
import { DatabaseService } from './DatabaseService';

interface RSSFeedData {
  title?: string;
  description?: string;
  items: RSSItem[];
}

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  categories?: string[];
  isoDate?: string;
  enclosure?: {
    url: string;
    type: string;
  };
}

class RSSServiceClass {
  private parser: Parser<RSSFeedData, RSSItem>;
  private readonly TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.parser = new Parser({
      timeout: this.TIMEOUT,
      headers: {
        'User-Agent': 'SwipeFeed/1.0 (RSS Reader App)',
      },
    });
  }

  async validateFeedUrl(url: string): Promise<{ isValid: boolean; title?: string; description?: string; error?: string }> {
    try {
      // Ensure URL has protocol
      const feedUrl = this.normalizeUrl(url);
      
      // Test the URL by fetching and parsing
      const feed = await this.parser.parseURL(feedUrl);
      
      return {
        isValid: true,
        title: feed.title || 'Untitled Feed',
        description: feed.description || '',
      };
    } catch (error) {
      console.error('Feed validation error:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid RSS feed',
      };
    }
  }

  async fetchFeed(feed: Feed): Promise<Article[]> {
    try {
      const feedUrl = this.normalizeUrl(feed.url);
      const parsedFeed = await this.parser.parseURL(feedUrl);
      
      const articles: Article[] = [];
      
      for (const item of parsedFeed.items) {
        if (!item.title || !item.link) continue;
        
        const article: Article = {
          id: this.generateArticleId(item.link, item.guid),
          feedId: feed.id,
          title: this.cleanText(item.title),
          description: this.cleanText(item.contentSnippet || item.content || ''),
          content: item.content || undefined,
          link: item.link,
          pubDate: this.parseDate(item.pubDate || item.isoDate),
          imageUrl: this.extractImageUrl(item) || undefined,
          isRead: false,
          isBookmarked: false,
          isSkipped: false,
        };
        
        articles.push(article);
      }
      
      return articles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    } catch (error) {
      console.error(`Failed to fetch feed ${feed.title}:`, error);
      throw new Error(`Failed to fetch feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addFeed(url: string): Promise<Feed> {
    try {
      const validation = await this.validateFeedUrl(url);
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid RSS feed');
      }
      
      const feedId = this.generateFeedId(url);
      const feed: Feed = {
        id: feedId,
        title: validation.title || 'Untitled Feed',
        url: this.normalizeUrl(url),
        description: validation.description || undefined,
        lastUpdated: new Date(),
        unreadCount: 0,
        isActive: true,
      };
      
      // Save to database
      await DatabaseService.saveFeed(feed);
      
      // Fetch initial articles
      try {
        const articles = await this.fetchFeed(feed);
        if (articles.length > 0) {
          await DatabaseService.saveArticles(articles);
          feed.unreadCount = articles.length;
          await DatabaseService.saveFeed(feed);
        }
      } catch (error) {
        console.warn('Failed to fetch initial articles for new feed:', error);
      }
      
      return feed;
    } catch (error) {
      console.error('Failed to add feed:', error);
      throw error;
    }
  }

  async updateFeed(feed: Feed): Promise<{ articlesAdded: number; feed: Feed }> {
    try {
      const articles = await this.fetchFeed(feed);
      
      // Get existing article IDs to avoid duplicates
      const existingArticles = await DatabaseService.getArticles();
      const existingIds = new Set(existingArticles.map(a => a.id));
      
      const newArticles = articles.filter(article => !existingIds.has(article.id));
      
      if (newArticles.length > 0) {
        await DatabaseService.saveArticles(newArticles);
      }
      
      // Update feed metadata
      const updatedFeed: Feed = {
        ...feed,
        lastUpdated: new Date(),
      };
      
      await DatabaseService.saveFeed(updatedFeed);
      await DatabaseService.updateFeedUnreadCount(feed.id);
      
      return {
        articlesAdded: newArticles.length,
        feed: updatedFeed,
      };
    } catch (error) {
      console.error(`Failed to update feed ${feed.title}:`, error);
      throw error;
    }
  }

  async updateAllFeeds(): Promise<{ totalArticlesAdded: number; errors: string[] }> {
    const feeds = await DatabaseService.getFeeds();
    const activeFeeds = feeds.filter(feed => feed.isActive);
    
    let totalArticlesAdded = 0;
    const errors: string[] = [];
    
    // Update feeds sequentially to avoid overwhelming servers
    for (const feed of activeFeeds) {
      try {
        const result = await this.updateFeed(feed);
        totalArticlesAdded += result.articlesAdded;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${feed.title}: ${errorMessage}`);
      }
      
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { totalArticlesAdded, errors };
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  private generateFeedId(url: string): string {
    const normalizedUrl = this.normalizeUrl(url);
    return `feed_${btoa(normalizedUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}_${Date.now()}`;
  }

  private generateArticleId(link: string, guid?: string): string {
    const source = guid || link;
    return `article_${btoa(source).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`;
  }

  private parseDate(dateString?: string): Date {
    if (!dateString) return new Date();
    
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private extractImageUrl(item: RSSItem): string | undefined {
    // Try enclosure first (podcasts often use this)
    if (item.enclosure && item.enclosure.type.startsWith('image/')) {
      return item.enclosure.url;
    }
    
    // Try to extract image from content
    if (item.content) {
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        return imgMatch[1];
      }
    }
    
    return undefined;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a reliable RSS feed
      const testUrl = 'https://feeds.feedburner.com/TechCrunch';
      await this.parser.parseURL(testUrl);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async searchFeedsByUrl(query: string): Promise<string[]> {
    // This could be enhanced to discover feeds from websites
    const possibleUrls = [
      `${query}/feed`,
      `${query}/rss`,
      `${query}/feed.xml`,
      `${query}/rss.xml`,
      `${query}/index.xml`,
    ];
    
    const validUrls: string[] = [];
    
    for (const url of possibleUrls) {
      try {
        const validation = await this.validateFeedUrl(url);
        if (validation.isValid) {
          validUrls.push(url);
        }
      } catch (error) {
        // Ignore validation errors for discovery
      }
    }
    
    return validUrls;
  }
}

export const RSSService = new RSSServiceClass();