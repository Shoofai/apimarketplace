import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
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
  freeOnly?: boolean;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
}

/** Escape % and _ for safe use in ilike patterns (literal match). */
function sanitizeQuery(q: string): string {
  return q
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
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

const USE_RPC =
  (f: MarketplaceFilters) =>
    f.freeOnly === true ||
    (f.tags != null && f.tags.length > 0) ||
    f.priceMin != null ||
    f.priceMax != null ||
    f.sort === 'price_asc' ||
    f.sort === 'price_desc';

/** Map RPC row (snake_case) to SearchResult api shape. */
function mapRpcRow(row: Record<string, unknown>): API & { organization: Pick<Organization, 'name' | 'slug' | 'logo_url'>; category: Pick<APICategory, 'name' | 'slug'> | null; minPrice?: number; maxPrice?: number } {
  const api = { ...row } as Record<string, unknown>;
  const organization = {
    name: row.org_name,
    slug: row.org_slug,
    logo_url: row.org_logo_url,
  } as Pick<Organization, 'name' | 'slug' | 'logo_url'>;
  const category =
    row.cat_name != null || row.cat_slug != null
      ? ({ name: row.cat_name, slug: row.cat_slug } as Pick<APICategory, 'name' | 'slug'>)
      : null;
  delete api.org_name;
  delete api.org_slug;
  delete api.org_logo_url;
  delete api.cat_name;
  delete api.cat_slug;
  delete api.min_price;
  delete api.max_price;
  return {
    ...api,
    organization,
    category,
    minPrice: row.min_price != null ? Number(row.min_price) : undefined,
    maxPrice: row.max_price != null ? Number(row.max_price) : undefined,
  } as API & { organization: Pick<Organization, 'name' | 'slug' | 'logo_url'>; category: Pick<APICategory, 'name' | 'slug'> | null; minPrice?: number; maxPrice?: number };
}

/**
 * Searches and filters APIs in the marketplace.
 * Uses RPC for price sort, free-only, tags, or price range; otherwise Supabase query with sanitized search and tags.
 */
export async function searchAPIs(
  query: string,
  filters: MarketplaceFilters = {}
): Promise<SearchResult> {
  const supabase = await createClient();
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  if (USE_RPC(filters)) {
    const { data: rpcRows, error } = await supabase.rpc('search_marketplace_apis', {
      p_query: query && query.trim() ? query.trim() : null,
      p_category_id: filters.category || null,
      p_min_rating: filters.minRating ?? null,
      p_free_only: filters.freeOnly === true,
      p_tags: filters.tags && filters.tags.length > 0 ? filters.tags : null,
      p_price_min: filters.priceMin ?? null,
      p_price_max: filters.priceMax ?? null,
      p_sort: filters.sort || 'popular',
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    const row = Array.isArray(rpcRows) && rpcRows.length > 0 ? rpcRows[0] : { data: [], total: 0 };
    const data = (row?.data as Record<string, unknown>[] | null) ?? [];
    const total = Number(row?.total ?? 0);
    const apis = data.map((r) => mapRpcRow(r));
    return {
      apis,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  const safeQuery = query && query.trim().length > 0 ? sanitizeQuery(query) : '';
  const pattern = safeQuery ? `%${safeQuery}%` : '';

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

  if (pattern) {
    queryBuilder = queryBuilder.or(
      `name.ilike.${pattern},description.ilike.${pattern},short_description.ilike.${pattern}`
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    for (const tag of filters.tags) {
      queryBuilder = queryBuilder.contains('tags', [tag]);
    }
  }

  if (filters.category) {
    queryBuilder = queryBuilder.eq('category_id', filters.category);
  }

  if (filters.minRating != null) {
    queryBuilder = queryBuilder.gte('avg_rating', filters.minRating);
  }

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
    case 'price_desc':
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
    default:
      queryBuilder = queryBuilder.order('total_subscribers', { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;

  const apisWithPricing = (data || []).map((api: any) => {
    const prices = api.pricing_plans?.map((p: { price_monthly?: number }) => p.price_monthly ?? 0) ?? [];
    return {
      ...api,
      minPrice: prices.length > 0 ? Math.min(...prices) : undefined,
      maxPrice: prices.length > 0 ? Math.max(...prices) : undefined,
    };
  });

  return {
    apis: apisWithPricing,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
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
    .order('name')
    .limit(DEFAULT_LIST_LIMIT);

  return data || [];
}
