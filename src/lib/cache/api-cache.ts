import { searchAPIs, getFeaturedAPIs } from '@/lib/api/search';
import { cache, cacheKeys } from '@/lib/cache/redis';

/**
 * Cached version of searchAPIs with 5-minute TTL
 */
export async function searchAPIsWithCache(params: {
  query?: string;
  category?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const cacheKey = cacheKeys.apiCatalog(JSON.stringify(params));
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const result = await searchAPIs(params.query ?? '', {
    category: params.category,
    sort: params.sortBy as 'popular' | 'rating' | 'newest' | 'price_asc' | 'price_desc' | undefined,
    page: params.page,
    limit: params.limit,
  });

  // Cache for 5 minutes
  await cache.set(cacheKey, result, 300);

  return result;
}

/**
 * Cached version of getFeaturedAPIs with 10-minute TTL
 */
export async function getFeaturedAPIsWithCache() {
  const cacheKey = 'api:featured';

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const result = await getFeaturedAPIs();

  // Cache for 10 minutes
  await cache.set(cacheKey, result, 600);

  return result;
}
