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

export default async function MarketplacePage(props: {
  searchParams: { q?: string; category?: string; sort?: string; page?: string; minRating?: string };
}) {
  const { searchParams } = props;
  const query = searchParams.q || '';
  const category = searchParams.category;
  const sort = (searchParams.sort as 'popular' | 'rating' | 'newest' | 'price_asc' | 'price_desc') || 'popular';
  const page = parseInt(searchParams.page || '1');
  const minRating = searchParams.minRating ? parseInt(searchParams.minRating, 10) : undefined;

  const [categories, searchResults, recommendations] = await Promise.all([
    getCategories(),
    searchAPIs(query, {
      category,
      sort,
      page,
      limit: 20,
      minRating: minRating != null && !Number.isNaN(minRating) ? minRating : undefined,
    }),
    getRecommendations(6),
  ]);

  return <MarketplaceContent
    categories={categories}
    searchResults={searchResults}
    recommendations={recommendations}
    query={query}
    category={category}
    sort={sort}
    page={page}
    minRating={minRating ?? undefined}
    searchParams={searchParams}
  />;
}
