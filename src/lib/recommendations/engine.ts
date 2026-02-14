import { createClient } from '@/lib/supabase/server';

export interface RecommendedAPI {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  logo_url: string | null;
  avg_rating: number | null;
  total_reviews: number | null;
  total_subscribers: number | null;
  organization: { name: string; slug: string; logo_url: string | null } | null;
  category: { name: string; slug: string } | null;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Get personalized API recommendations for the current user:
 * high-rated APIs in the same categories as their subscriptions, excluding already subscribed.
 * If not logged in or no subscriptions, returns popular high-rated APIs.
 */
export async function getRecommendations(limit = 6): Promise<RecommendedAPI[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let categoryIds: string[] = [];
  let subscribedApiIds: string[] = [];

  if (user) {
    const { data: subs } = await supabase
      .from('api_subscriptions')
      .select('api_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (subs?.length) {
      subscribedApiIds = subs.map((s) => s.api_id);
      const { data: subscribedApis } = await supabase
        .from('apis')
        .select('category_id')
        .in('id', subscribedApiIds);
      categoryIds = [
        ...new Set(
          (subscribedApis ?? [])
            .map((a) => a.category_id)
            .filter((id): id is string => !!id)
        ),
      ];
    }
  }

  let query = supabase
    .from('apis')
    .select(
      `
      id, name, slug, short_description, logo_url, avg_rating, total_reviews, total_subscribers,
      organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
      category:api_categories(name, slug),
      pricing_plans:api_pricing_plans(price_monthly)
    `
    )
    .eq('status', 'published')
    .eq('visibility', 'public');

  if (subscribedApiIds.length > 0) {
    query = query.not('id', 'in', `(${subscribedApiIds.join(',')})`);
  }

  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  const { data: apis, error } = await query
    .gte('avg_rating', 4.0)
    .order('total_subscribers', { ascending: false })
    .limit(limit);

  if (error || !apis?.length) {
    const fallback = await supabase
      .from('apis')
      .select(
        `
        id, name, slug, short_description, logo_url, avg_rating, total_reviews, total_subscribers,
        organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
        category:api_categories(name, slug),
        pricing_plans:api_pricing_plans(price_monthly)
      `
      )
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order('total_subscribers', { ascending: false })
      .limit(limit);

    if (fallback.error || !fallback.data?.length) return [];
    return (fallback.data as unknown as RecommendedAPI[]).map(addMinMaxPrice);
  }

  return (apis as unknown as RecommendedAPI[]).map(addMinMaxPrice);
}

function addMinMaxPrice(api: RecommendedAPI & { pricing_plans?: { price_monthly?: number }[] }): RecommendedAPI {
  const prices = api.pricing_plans?.map((p) => p.price_monthly ?? 0).filter((n) => n !== undefined) ?? [];
  return {
    ...api,
    minPrice: prices.length ? Math.min(...prices) : undefined,
    maxPrice: prices.length ? Math.max(...prices) : undefined,
  };
}

/**
 * Get similar APIs (same category, exclude current, sort by rating).
 */
export async function getSimilarAPIs(apiId: string, categoryId: string | null, limit = 4): Promise<RecommendedAPI[]> {
  if (!categoryId) return [];
  const supabase = await createClient();

  const { data: apis, error } = await supabase
    .from('apis')
    .select(
      `
      id, name, slug, short_description, logo_url, avg_rating, total_reviews, total_subscribers,
      organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
      category:api_categories(name, slug),
      pricing_plans:api_pricing_plans(price_monthly)
    `
    )
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', apiId)
    .order('avg_rating', { ascending: false })
    .limit(limit);

  if (error || !apis?.length) return [];
  return (apis as unknown as (RecommendedAPI & { pricing_plans?: { price_monthly?: number }[] })[]).map(addMinMaxPrice);
}
