import { Feed, Article } from '@/types';
import { DatabaseService } from './DatabaseService';

interface ParsedFeed {
  title?: string;
  description?: string;
  items: ParsedItem[];
}

interface ParsedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  content?: string;
  guid?: string;
  imageUrl?: string;
}

class RSSServiceClass {
  private readonly TIMEOUT = 10000; // 10 seconds

  constructor() {
    // No initialization needed for native browser APIs
  }

  async validateFeedUrl(url: string): Promise<{ isValid: boolean; title?: string; description?: string; error?: string }> {
    try {
      // Ensure URL has protocol
      const feedUrl = this.normalizeUrl(url);
      
      // Test the URL by fetching and parsing
      const feed = await this.fetchAndParseFeed(feedUrl);
      
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
      const parsedFeed = await this.fetchAndParseFeed(feedUrl);
      
      const articles: Article[] = [];
      
      for (const item of parsedFeed.items) {
        if (!item.title || !item.link) continue;
        
        const article: Article = {
          id: this.generateArticleId(item.link, item.guid),
          feedId: feed.id,
          title: this.cleanText(item.title),
          description: this.cleanText(item.description || ''),
          content: item.content || undefined,
          link: item.link,
          pubDate: this.parseDate(item.pubDate),
          imageUrl: item.imageUrl || undefined,
          isRead: false,
          isBookmarked: false,
          isSkipped: false,
        };
        
        articles.push(article);
      }
      
      return articles;
    } catch (error) {
      console.error(`Failed to fetch feed ${feed.url}:`, error);
      throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchAndParseFeed(url: string): Promise<ParsedFeed> {
    // Use a CORS proxy for development, or implement a backend proxy in production
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
    
    try {
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const xmlText = data.contents;
      
      if (!xmlText) {
        throw new Error('No content received from RSS feed');
      }
      
      return this.parseXML(xmlText);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private parseXML(xmlText: string): ParsedFeed {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }
    
    // Try RSS 2.0 first, then Atom
    const channel = doc.querySelector('channel');
    if (channel) {
      return this.parseRSS(doc);
    }
    
    const feed = doc.querySelector('feed');
    if (feed) {
      return this.parseAtom(doc);
    }
    
    throw new Error('Unsupported feed format');
  }

  private parseRSS(doc: Document): ParsedFeed {
    const channel = doc.querySelector('channel');
    if (!channel) throw new Error('Invalid RSS format');
    
    const title = channel.querySelector('title')?.textContent || '';
    const description = channel.querySelector('description')?.textContent || '';
    
    const items: ParsedItem[] = [];
    const itemElements = channel.querySelectorAll('item');
    
    itemElements.forEach(item => {
      const titleEl = item.querySelector('title');
      const linkEl = item.querySelector('link');
      const descEl = item.querySelector('description');
      const pubDateEl = item.querySelector('pubDate');
      const guidEl = item.querySelector('guid');
      const contentEl = item.querySelector('content\\:encoded, encoded');
      
      // Extract image from enclosure or media:thumbnail
      const enclosureEl = item.querySelector('enclosure[type^="image"]');
      const mediaEl = item.querySelector('media\\:thumbnail, thumbnail');
      
      let imageUrl = '';
      if (enclosureEl) {
        imageUrl = enclosureEl.getAttribute('url') || '';
      } else if (mediaEl) {
        imageUrl = mediaEl.getAttribute('url') || '';
      }
      
      if (titleEl?.textContent && linkEl?.textContent) {
        items.push({
          title: titleEl.textContent,
          link: linkEl.textContent,
          description: descEl?.textContent || '',
          content: contentEl?.textContent || '',
          pubDate: pubDateEl?.textContent || '',
          guid: guidEl?.textContent || '',
          imageUrl: imageUrl || undefined,
        });
      }
    });
    
    return { title, description, items };
  }

  private parseAtom(doc: Document): ParsedFeed {
    const feed = doc.querySelector('feed');
    if (!feed) throw new Error('Invalid Atom format');
    
    const title = feed.querySelector('title')?.textContent || '';
    const subtitle = feed.querySelector('subtitle')?.textContent || '';
    
    const items: ParsedItem[] = [];
    const entryElements = feed.querySelectorAll('entry');
    
    entryElements.forEach(entry => {
      const titleEl = entry.querySelector('title');
      const linkEl = entry.querySelector('link[rel="alternate"], link:not([rel])');
      const summaryEl = entry.querySelector('summary');
      const contentEl = entry.querySelector('content');
      const publishedEl = entry.querySelector('published');
      const updatedEl = entry.querySelector('updated');
      const idEl = entry.querySelector('id');
      
      const href = linkEl?.getAttribute('href');
      
      if (titleEl?.textContent && href) {
        items.push({
          title: titleEl.textContent,
          link: href,
          description: summaryEl?.textContent || '',
          content: contentEl?.textContent || '',
          pubDate: publishedEl?.textContent || updatedEl?.textContent || '',
          guid: idEl?.textContent || '',
        });
      }
    });
    
    return { title, description: subtitle, items };
  }

  private normalizeUrl(url: string): string {
    url = url.trim();
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }

  private generateArticleId(link: string, guid?: string): string {
    // Use GUID if available, otherwise hash the link
    const source = guid || link;
    return btoa(source).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private cleanText(text: string): string {
    // Remove HTML tags and decode entities
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  }

  private parseDate(dateString?: string): Date {
    if (!dateString) return new Date();
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  async updateFeed(feed: Feed): Promise<void> {
    try {
      const articles = await this.fetchFeed(feed);
      
      if (articles.length > 0) {
        await DatabaseService.saveArticles(articles);
        await DatabaseService.updateFeedUnreadCount(feed.id);
      }
    } catch (error) {
      console.error(`Failed to update feed ${feed.title}:`, error);
      throw error;
    }
  }

  async refreshAllFeeds(): Promise<void> {
    try {
      const feeds = await DatabaseService.getFeeds();
      const activeFeeds = feeds.filter(feed => feed.isActive);
      
      // Update feeds in parallel, but limit concurrency
      const BATCH_SIZE = 3;
      for (let i = 0; i < activeFeeds.length; i += BATCH_SIZE) {
        const batch = activeFeeds.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map(feed => this.updateFeed(feed))
        );
      }
    } catch (error) {
      console.error('Failed to refresh feeds:', error);
      throw error;
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(this.normalizeUrl(url));
      return true;
    } catch {
      return false;
    }
  }
}

export const RSSService = new RSSServiceClass();