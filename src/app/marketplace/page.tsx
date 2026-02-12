import { searchAPIs, getCategories } from '@/lib/api/search';
import { APICard } from '@/components/marketplace/APICard';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MarketplacePageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  };
}

export const metadata = {
  title: 'API Marketplace | APIMarketplace Pro',
  description: 'Discover and integrate powerful APIs for your applications',
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const query = searchParams.q || '';
  const category = searchParams.category;
  const sort = searchParams.sort as any;
  const page = parseInt(searchParams.page || '1');

  // Fetch categories and search results
  const [categories, searchResults] = await Promise.all([
    getCategories(),
    searchAPIs(query, {
      category,
      sort,
      page,
      limit: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Marketplace</h1>
          <p className="text-gray-600">
            Discover and integrate powerful APIs to accelerate your development
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                <a
                  href="/marketplace"
                  className={`block px-3 py-2 rounded-md text-sm ${
                    !category
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All APIs
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/marketplace?category=${cat.id}`}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      category === cat.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Sort */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search APIs..."
                    defaultValue={query}
                    className="pl-10"
                    name="q"
                    form="search-form"
                  />
                </div>
                <Select defaultValue={sort || 'popular'} name="sort">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
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
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No APIs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button asChild variant="outline">
                  <a href="/marketplace">Clear filters</a>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <a href={`/marketplace?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}>
                      Previous
                    </a>
                  </Button>
                )}
                <div className="flex items-center gap-2 px-4">
                  Page {page} of {searchResults.totalPages}
                </div>
                {page < searchResults.totalPages && (
                  <Button variant="outline" asChild>
                    <a href={`/marketplace?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}>
                      Next
                    </a>
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
