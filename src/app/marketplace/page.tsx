import { searchAPIs, getCategories } from '@/lib/api/search';
import { getRecommendations } from '@/lib/recommendations/engine';
import { MarketplaceContent } from '@/components/marketplace/MarketplaceContent';
import { getPlatformName } from '@/lib/settings/platform-name';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `API Marketplace | ${name}`,
    description: 'Discover and integrate powerful APIs for your applications',
  };
}

function parseTags(searchParams: Record<string, string | string[] | undefined>): string[] {
  const tag = searchParams.tag ?? searchParams.tags;
  if (Array.isArray(tag)) return tag.filter((t): t is string => typeof t === 'string' && t.length > 0);
  if (typeof tag === 'string') return tag.split(',').map((t) => t.trim()).filter(Boolean);
  return [];
}

export default async function MarketplacePage(props: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string; minRating?: string; freeOnly?: string; tag?: string; tags?: string; priceMin?: string; priceMax?: string; productType?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const category = searchParams.category;
  const sort = (searchParams.sort as 'popular' | 'rating' | 'newest' | 'price_asc' | 'price_desc') || 'popular';
  const page = parseInt(searchParams.page || '1');
  const minRating = searchParams.minRating ? parseInt(searchParams.minRating, 10) : undefined;
  const freeOnly = searchParams.freeOnly === '1' || searchParams.freeOnly === 'true';
  const tags = parseTags(searchParams as Record<string, string | string[] | undefined>);
  const priceMin = searchParams.priceMin != null ? parseFloat(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax != null ? parseFloat(searchParams.priceMax) : undefined;
  const productTypeRaw = searchParams.productType ?? 'all';
  const productType = (['api', 'dataset', 'mcp', 'all'].includes(productTypeRaw) ? productTypeRaw : 'all') as 'api' | 'dataset' | 'mcp' | 'all';

  const [categories, searchResults, recommendations] = await Promise.all([
    getCategories(),
    searchAPIs(query, {
      category,
      sort,
      page,
      limit: 20,
      minRating: minRating != null && !Number.isNaN(minRating) ? minRating : undefined,
      freeOnly: freeOnly || undefined,
      tags: tags.length > 0 ? tags : undefined,
      priceMin: priceMin != null && !Number.isNaN(priceMin) ? priceMin : undefined,
      priceMax: priceMax != null && !Number.isNaN(priceMax) ? priceMax : undefined,
      productType,
    }),
    getRecommendations(6),
  ]);

  // Fetch latest health check per API (fire-and-forget on error — health is non-critical)
  const apiIds = searchResults.apis.map((a) => a.id);
  let healthMap: Record<string, { is_healthy: boolean | null; response_time_ms: number | null }> = {};
  if (apiIds.length > 0) {
    try {
      const supabase = await createClient();
      const { data: healthRows } = await supabase
        .from('api_health_checks')
        .select('api_id, is_healthy, response_time_ms')
        .in('api_id', apiIds)
        .order('checked_at', { ascending: false });
      if (healthRows) {
        const seen = new Set<string>();
        for (const row of healthRows) {
          if (!seen.has(row.api_id)) {
            seen.add(row.api_id);
            healthMap[row.api_id] = { is_healthy: row.is_healthy, response_time_ms: row.response_time_ms };
          }
        }
      }
    } catch {
      // Health data is best-effort
    }
  }

  return (
    <MarketplaceContent
      categories={categories}
      searchResults={searchResults}
      recommendations={recommendations}
      query={query}
      category={category}
      sort={sort}
      page={page}
      minRating={minRating ?? undefined}
      freeOnly={freeOnly}
      tags={tags}
      priceMin={priceMin != null && !Number.isNaN(priceMin) ? priceMin : undefined}
      priceMax={priceMax != null && !Number.isNaN(priceMax) ? priceMax : undefined}
      productType={productType}
      searchParams={searchParams}
      healthMap={healthMap}
    />
  );
}
