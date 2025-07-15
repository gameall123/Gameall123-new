import { Product, Order, User } from '@shared/schema';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cache = new MemoryCache();

// Clean up expired cache entries every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Cache keys for different data types
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  DASHBOARD_STATS: 'dashboard_stats',
  TOP_PRODUCTS: 'top_products',
  RECENT_ORDERS: 'recent_orders',
  CATEGORIES: 'categories',
  USERS: 'users',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
} as const;

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes
  TOP_PRODUCTS: 15 * 60 * 1000, // 15 minutes
  RECENT_ORDERS: 1 * 60 * 1000, // 1 minute
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  USERS: 5 * 60 * 1000, // 5 minutes
  ORDERS: 5 * 60 * 1000, // 5 minutes
  REVIEWS: 10 * 60 * 1000, // 10 minutes
} as const;