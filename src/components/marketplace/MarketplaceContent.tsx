'use client';

import { useState } from 'react';
import { APICard } from '@/components/marketplace/APICard';
import { CompareBar } from '@/components/marketplace/CompareBar';
import { RecommendedAPIs } from '@/components/marketplace/RecommendedAPIs';
import { FilterSidebar, type Category as FilterCategory } from '@/components/marketplace/FilterSidebar';
import { ActiveFilters } from '@/components/marketplace/ActiveFilters';
import { MarketplaceTopBar } from '@/components/marketplace/MarketplaceTopBar';
import { MarketplacePagination } from '@/components/marketplace/MarketplacePagination';
import { Filter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { SearchResult } from '@/lib/api/search';
import type { RecommendedAPI } from '@/lib/recommendations/types';

type Category = { id: string; name: string; slug: string };

interface MarketplaceContentProps {
  categories: Category[];
  searchResults: SearchResult;
  recommendations: RecommendedAPI[];
  query: string;
  category: string | undefined;
  sort: string;
  page: number;
  minRating: number | undefined;
  freeOnly: boolean;
  tags: string[];
  priceMin: number | undefined;
  priceMax: number | undefined;
  searchParams: Record<string, string | undefined>;
}

const FORM_ID = 'marketplace-filters';

function buildParams(overrides: Record<string, string | number | boolean | string[] | undefined>, drop?: string[]): string {
  const p: Record<string, string> = {};
  Object.entries(overrides).forEach(([k, v]) => {
    if (drop?.includes(k)) return;
    if (v === undefined || v === '' || v === false) return;
    if (Array.isArray(v)) {
      if (v.length > 0) p[k] = v.join(',');
      return;
    }
    p[k] = String(v);
  });
  return new URLSearchParams(p).toString();
}

export function MarketplaceContent({
  categories,
  searchResults,
  recommendations,
  query,
  category,
  sort,
  page,
  minRating,
  freeOnly,
  tags,
  priceMin,
  priceMax,
  searchParams,
}: MarketplaceContentProps) {
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const base = {
    q: query || undefined,
    category,
    sort,
    page: page > 1 ? page : undefined,
    minRating,
    freeOnly: freeOnly ? '1' : undefined,
    tags: tags.length > 0 ? tags : undefined,
    priceMin,
    priceMax,
  };

  const categoryHref = (catId: string | null) => {
    const params = buildParams({ ...base, category: catId ?? undefined, page: undefined });
    return params ? `/marketplace?${params}` : '/marketplace';
  };

  const clearParam = (key: keyof typeof base) => {
    const next = { ...base, page: undefined, [key]: undefined };
    const params = buildParams(next);
    return params ? `/marketplace?${params}` : '/marketplace';
  };

  const buildSortHref = (sortValue: string) => {
    const params = buildParams({ ...base, sort: sortValue, page: undefined });
    return params ? `/marketplace?${params}` : '/marketplace';
  };

  const clearTagHref = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    const params = buildParams({ ...base, tags: nextTags.length ? nextTags : undefined, page: undefined });
    return params ? `/marketplace?${params}` : '/marketplace';
  };

  const categoryName = category ? categories.find((c) => c.id === category)?.name : undefined;
  const filterCategories: FilterCategory[] = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  const clearPriceHref = (() => {
    const params = buildParams({ ...base, priceMin: undefined, priceMax: undefined, page: undefined });
    return params ? `/marketplace?${params}` : '/marketplace';
  })();

  const buildPageHref = (p: number) => {
    const params = buildParams({ ...base, page: p === 1 ? undefined : p });
    return params ? `/marketplace?${params}` : '/marketplace';
  };

  const resultsCount =
    searchResults.total > 0
      ? `Showing ${searchResults.apis.length} of ${searchResults.total.toLocaleString()} APIs`
      : undefined;

  const title = categoryName ?? 'API Marketplace';
  const formatApiCount = (n: number) =>
    n >= 1000 ? `${Math.floor(n / 1000)}K+` : n.toString();
  const searchPlaceholder = categoryName
    ? `Search ${categoryName} APIs...`
    : `Search ${searchResults.total > 0 ? formatApiCount(searchResults.total) + ' ' : ''}APIs...`;

  return (
    <div className="space-y-0">
      <form id={FORM_ID} action="/marketplace" method="get" className="contents">
        <input type="hidden" name="sort" value={sort} />
        {category ? <input type="hidden" name="category" value={category} /> : null}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-6 self-start">
            <div className="p-4 border border-border rounded-lg bg-card">
              <FilterSidebar
                category={category}
                categoryHref={categoryHref}
                categories={filterCategories}
                query={query}
                sort={sort}
                freeOnly={freeOnly}
                priceMin={priceMin}
                priceMax={priceMax}
                minRating={minRating}
                tags={tags}
                formId={FORM_ID}
              />
            </div>
          </aside>

          {/* Main: top bar + active filters + grid + pagination */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <MarketplaceTopBar
              title={title}
              searchPlaceholder={searchPlaceholder}
              query={query}
              formId={FORM_ID}
              sort={sort}
              buildSortHref={buildSortHref}
              resultsCount={resultsCount}
              showFiltersButton
              onOpenFilters={() => setFiltersSheetOpen(true)}
            />

            <ActiveFilters
              query={query || undefined}
              categoryName={categoryName}
              clearCategoryHref={clearParam('category')}
              minRating={minRating}
              clearMinRatingHref={clearParam('minRating')}
              freeOnly={freeOnly}
              clearFreeOnlyHref={clearParam('freeOnly')}
              tags={tags}
              clearTagHref={clearTagHref}
              priceMin={priceMin}
              priceMax={priceMax}
              clearPriceHref={clearPriceHref}
              clearQueryHref={clearParam('q')}
              clearAllHref="/marketplace"
            />

            {searchResults.apis.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.apis.map((api) => (
                  <APICard key={api.id} api={api} />
                ))}
              </div>
            ) : null}

            {recommendations.length > 0 && !query && page === 1 && (
              <div className="pt-8 border-t border-border">
                <RecommendedAPIs apis={recommendations} title="Recommended for you" />
              </div>
            )}

            {searchResults.apis.length === 0 ? (
              <Card className="p-12 text-center col-span-full">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No APIs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button asChild variant="outline">
                  <Link href="/marketplace">Clear filters</Link>
                </Button>
              </Card>
            ) : null}

            {searchResults.totalPages > 1 ? (
              <div className="mt-6">
                <MarketplacePagination
                  currentPage={page}
                  totalPages={searchResults.totalPages}
                  buildPageHref={buildPageHref}
                />
              </div>
            ) : null}
          </main>
        </div>
      </form>

      {/* Mobile filters sheet */}
      <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
        <SheetContent side="left" className="w-[min(100%,20rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="pt-4">
            <FilterSidebar
              category={category}
              categoryHref={categoryHref}
              categories={filterCategories}
              query={query}
              sort={sort}
              freeOnly={freeOnly}
              priceMin={priceMin}
              priceMax={priceMax}
              minRating={minRating}
              tags={tags}
              formId={FORM_ID}
              standaloneForm
              onCategoryClick={(catId) => {
                setFiltersSheetOpen(false);
                window.location.href = categoryHref(catId);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <CompareBar />
    </div>
  );
}
