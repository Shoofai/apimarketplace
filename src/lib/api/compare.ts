import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export interface CompareAPI {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  logo_url: string | null;
  base_url: string | null;
  avg_rating: number | null;
  total_reviews: number | null;
  total_subscribers: number | null;
  organization: { name: string; slug: string; logo_url: string | null } | null;
  category: { name: string; slug: string } | null;
  pricing_plans: Array<{
    name: string;
    price_monthly: number;
    included_calls: number | null;
    rate_limit_per_day: number | null;
    features: string[] | null;
  }>;
  endpoints_count: number;
}

const MAX_APIS = 4;

/**
 * Fetch APIs by IDs for comparison (max 4). Returns only published APIs.
 */
export async function getAPIsForCompare(ids: string[]): Promise<CompareAPI[]> {
  if (ids.length === 0 || ids.length > MAX_APIS) return [];
  const supabase = await createClient();

  const { data: apis, error } = await supabase
    .from('apis')
    .select(
      `
      id, name, slug, short_description, logo_url, base_url,
      avg_rating, total_reviews, total_subscribers,
      organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
      category:api_categories(name, slug),
      pricing_plans:api_pricing_plans(name, price_monthly, included_calls, rate_limit_per_day, features)
    `
    )
    .in('id', ids.slice(0, MAX_APIS))
    .eq('status', 'published')
    .limit(DEFAULT_LIST_LIMIT);

  if (error) return [];

  const idsWithEndpoints = await Promise.all(
    (apis ?? []).map(async (api) => {
      const { count } = await supabase
        .from('api_endpoints')
        .select('*', { count: 'exact', head: true })
        .eq('api_id', api.id);
      return { ...api, endpoints_count: count ?? 0 };
    })
  );

  return idsWithEndpoints as unknown as CompareAPI[];
}
