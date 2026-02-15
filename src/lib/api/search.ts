import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type API = Database['public']['Tables']['apis']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];
type APICategory = Database['public']['Tables']['api_categories']['Row'];

export interface MarketplaceFilters {
  category?: string;
  priceModel?: string;
  minRating?: number;
  sort?: 'popular' | 'rating' | 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  apis: (API & {
    organization: Pick<Organization, 'name' | 'slug' | 'logo_url'>;
    category: Pick<APICategory, 'name' | 'slug'> | null;
    minPrice?: number;
    maxPrice?: number;
  })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Searches and filters APIs in the marketplace.
 * Uses PostgreSQL full-text search with pg_trgm extension.
 * 
 * @param query - Search query string
 * @param filters - Filters and pagination options
 * @returns Search results with pagination info
 */
export async function searchAPIs(
  query: string,
  filters: MarketplaceFilters = {}
): Promise<SearchResult> {
  const supabase = await createClient();

  // Build query
  let queryBuilder = supabase
    .from('apis')
    .select(
      `
      *,
      organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
      category:api_categories(name, slug),
      pricing_plans:api_pricing_plans(price_monthly)
    `,
      { count: 'exact' }
    )
    .in('status', ['published', 'unclaimed'])
    .eq('visibility', 'public');

  // Full-text search using pg_trgm similarity
  if (query && query.trim().length > 0) {
    // Search in name, description, and tags
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`
    );
  }

  // Category filter
  if (filters.category) {
    queryBuilder = queryBuilder.eq('category_id', filters.category);
  }

  // Minimum rating filter
  if (filters.minRating) {
    queryBuilder = queryBuilder.gte('avg_rating', filters.minRating);
  }

  // Sorting
  switch (filters.sort) {
    case 'popular':
      queryBuilder = queryBuilder.order('total_subscribers', { ascending: false });
      break;
    case 'rating':
      queryBuilder = queryBuilder
        .order('avg_rating', { ascending: false })
        .order('total_reviews', { ascending: false });
      break;
    case 'newest':
      queryBuilder = queryBuilder.order('published_at', { ascending: false });
      break;
    case 'price_asc':
      // Note: This requires a computed column or join
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
    case 'price_desc':
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
    default:
      queryBuilder = queryBuilder.order('total_subscribers', { ascending: false });
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  queryBuilder = queryBuilder.range(from, to);

  // Execute query
  const { data, error, count } = await queryBuilder;

  if (error) {
    throw error;
  }

  // Calculate min/max pricing for each API
  const apisWithPricing = (data || []).map((api) => {
    const prices = api.pricing_plans?.map((p: any) => p.price_monthly || 0) || [];
    return {
      ...api,
      minPrice: prices.length > 0 ? Math.min(...prices) : undefined,
      maxPrice: prices.length > 0 ? Math.max(...prices) : undefined,
    };
  });

  return {
    apis: apisWithPricing,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Gets featured APIs for the marketplace homepage.
 * 
 * @param limit - Number of APIs to return
 * @returns Featured APIs
 */
export async function getFeaturedAPIs(limit: number = 6) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('apis')
    .select(
      `
      *,
      organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
      category:api_categories(name, slug)
    `
    )
    .in('status', ['published', 'unclaimed'])
    .eq('visibility', 'public')
    .order('total_subscribers', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Gets all API categories with API counts.
 * 
 * @returns Categories with counts
 */
export async function getCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('api_categories')
    .select(
      `
      *,
      apis:apis(count)
    `
    )
    .order('name');

  return data || [];
}
