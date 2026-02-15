import { searchAPIs, getCategories } from '@/lib/api/search';
import { getRecommendations } from '@/lib/recommendations/engine';
import { MarketplaceContent } from '@/components/marketplace/MarketplaceContent';
import { getPlatformName } from '@/lib/settings/platform-name';

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
  searchParams: { q?: string; category?: string; sort?: string; page?: string; minRating?: string; freeOnly?: string; tag?: string; tags?: string; priceMin?: string; priceMax?: string };
}) {
  const { searchParams } = props;
  const query = searchParams.q || '';
  const category = searchParams.category;
  const sort = (searchParams.sort as 'popular' | 'rating' | 'newest' | 'price_asc' | 'price_desc') || 'popular';
  const page = parseInt(searchParams.page || '1');
  const minRating = searchParams.minRating ? parseInt(searchParams.minRating, 10) : undefined;
  const freeOnly = searchParams.freeOnly === '1' || searchParams.freeOnly === 'true';
  const tags = parseTags(searchParams as Record<string, string | string[] | undefined>);
  const priceMin = searchParams.priceMin != null ? parseFloat(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax != null ? parseFloat(searchParams.priceMax) : undefined;

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
    }),
    getRecommendations(6),
  ]);

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
      searchParams={searchParams}
    />
  );
}
