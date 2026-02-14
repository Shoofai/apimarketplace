'use client';

import { APICard } from '@/components/marketplace/APICard';
import { CompareBar } from '@/components/marketplace/CompareBar';
import { RecommendedAPIs } from '@/components/marketplace/RecommendedAPIs';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SearchResult } from '@/lib/api/search';
import type { RecommendedAPI } from '@/lib/recommendations/engine';

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
  searchParams: Record<string, string | undefined>;
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
  searchParams,
}: MarketplaceContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">API Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and integrate powerful APIs to accelerate your development
        </p>
      </div>

      <div className="flex gap-6">
        {/* Category Filters Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <Card className="p-6 sticky top-6">
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Categories
            </h2>
            <div className="space-y-1">
              <a
                href="/marketplace"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  !category
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                All APIs
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/marketplace?category=${cat.id}`}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Search and Sort */}
          <Card className="p-4 mb-6">
            <form
              id="search-form"
              action="/marketplace"
              method="get"
              className="space-y-4"
            >
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <div className="flex gap-4 flex-wrap items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search APIs..."
                    defaultValue={query}
                    className="pl-10"
                    name="q"
                  />
                </div>
                <select
                  name="sort"
                  className="rounded-md border border-input bg-background h-9 px-3 py-1 text-sm w-48"
                  defaultValue={sort}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <Button type="submit">Search</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                <label className="text-sm text-muted-foreground">Minimum rating</label>
                <select
                  name="minRating"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={minRating ?? ''}
                >
                  <option value="">Any</option>
                  <option value="4">4+ stars</option>
                  <option value="3">3+ stars</option>
                </select>
                <Button type="submit" variant="secondary" size="sm">
                  Apply filters
                </Button>
                {(query || category || minRating) && (
                  <Button type="reset" variant="ghost" size="sm" asChild>
                    <a href="/marketplace">Clear filters</a>
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Results */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {searchResults.apis.length} of {searchResults.total} APIs
              {query && ` for "${query}"`}
            </p>
          </div>

          {/* API Grid */}
          {searchResults.apis.length > 0 ? (
            <div className="space-y-4">
              {searchResults.apis.map((api) => (
                <APICard key={api.id} api={api} />
              ))}
            </div>
          ) : null}

          {/* Recommended for you (when no search or on first page) */}
          {recommendations.length > 0 && !query && page === 1 && (
            <div className="mt-10 pt-8 border-t">
              <RecommendedAPIs apis={recommendations} title="Recommended for you" />
            </div>
          )}

          {searchResults.apis.length === 0 ? (
            <Card className="p-12 text-center">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No APIs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button asChild variant="outline">
                <a href="/marketplace">Clear filters</a>
              </Button>
            </Card>
          ) : null}

          {/* Pagination */}
          {searchResults.totalPages > 1 ? (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 ? (
                <Button variant="outline" asChild>
                  <a href={`/marketplace?${new URLSearchParams({ ...searchParams, page: String(page - 1) } as Record<string, string>)}`}>
                    Previous
                  </a>
                </Button>
              ) : null}
              <div className="flex items-center gap-2 px-4">
                Page {page} of {searchResults.totalPages}
              </div>
              {page < searchResults.totalPages ? (
                <Button variant="outline" asChild>
                  <a href={`/marketplace?${new URLSearchParams({ ...searchParams, page: String(page + 1) } as Record<string, string>)}`}>
                    Next
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>
      <CompareBar />
    </div>
  );
}
