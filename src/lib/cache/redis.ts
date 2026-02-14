import { logger } from '@/lib/utils/logger';

interface RedisClientLike {
  get(key: string): Promise<string | null>;
  setEx(key: string, seconds: number, value: string): Promise<void>;
  del(key: string | string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<number>;
  ping(): Promise<string>;
  on(event: string, listener: (err: Error) => void): void;
  connect(): Promise<void>;
}

let redisClient: RedisClientLike | null = null;

/**
 * Get Redis client singleton. Uses dynamic import so the optional redis package
 * does not break the build when missing or unresolved.
 */
export async function getRedisClient(): Promise<RedisClientLike | null> {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not configured, caching disabled');
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    const { createClient } = await import('redis');
    const client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err: Error) => {
      logger.error('Redis Client Error', { error: err });
    });

    await client.connect();
    logger.info('Redis client connected');
    redisClient = client as RedisClientLike;
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', { error });
    return null;
  }
}

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  },

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const client = await getRedisClient();
    if (!client) return;

    try {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    const client = await getRedisClient();
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  },

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const client = await getRedisClient();
    if (!client) return;

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.error('Cache pattern delete error', { pattern, error });
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      return (await client.exists(key)) === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  },
};

/**
 * Cache key generators
 */
export const cacheKeys = {
  apiCatalog: (filters: string) => `api:catalog:${filters}`,
  apiDetail: (orgSlug: string, apiSlug: string) => `api:detail:${orgSlug}:${apiSlug}`,
  apiDocs: (orgSlug: string, apiSlug: string) => `api:docs:${orgSlug}:${apiSlug}`,
  userSession: (userId: string) => `user:session:${userId}`,
  rankings: (type: string) => `rankings:${type}`,
  stats: (key: string) => `stats:${key}`,
};

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  /**
   * Invalidate API-related caches
   */
  async invalidateAPI(orgSlug: string, apiSlug: string): Promise<void> {
    await Promise.all([
      cache.delPattern('api:catalog:*'),
      cache.del(cacheKeys.apiDetail(orgSlug, apiSlug)),
      cache.del(cacheKeys.apiDocs(orgSlug, apiSlug)),
      cache.delPattern('rankings:*'),
    ]);
  },

  /**
   * Invalidate catalog caches
   */
  async invalidateCatalog(): Promise<void> {
    await cache.delPattern('api:catalog:*');
  },

  /**
   * Invalidate user session
   */
  async invalidateUserSession(userId: string): Promise<void> {
    await cache.del(cacheKeys.userSession(userId));
  },
};
