'use client';

import { Search, Filter, LayoutGrid, List, ChevronDown, TrendingUp, Star, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SortOption = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: 'popular', label: 'Popular', description: 'Most subscribed', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'rating', label: 'Highest Rated', description: 'Best reviewed', icon: <Star className="h-4 w-4" /> },
  { value: 'newest', label: 'Newest', description: 'Recently added', icon: <Clock className="h-4 w-4" /> },
  { value: 'price_asc', label: 'Price: Low to High', description: '', icon: <ArrowUp className="h-4 w-4" /> },
  { value: 'price_desc', label: 'Price: High to Low', description: '', icon: <ArrowDown className="h-4 w-4" /> },
];

export interface MarketplaceTopBarProps {
  /** Page title, e.g. "API Marketplace" or category name */
  title: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Current search query (defaultValue for input) */
  query: string;
  /** Form id that contains the search input (so submit goes to that form) */
  formId: string;
  /** Current sort value */
  sort: string;
  /** Sort options; default has popular, rating, newest, price_asc, price_desc */
  sortOptions?: SortOption[];
  /** Build href when user selects a sort (preserves other params) */
  buildSortHref: (sortValue: string) => string;
  /** Optional results text, e.g. "Showing 24 of 10,000 APIs" */
  resultsCount?: string;
  /** Show "Filters" button (for mobile sheet) */
  showFiltersButton?: boolean;
  /** Called when Filters button is clicked */
  onOpenFilters?: () => void;
  /** Current view: grid or list */
  view?: 'grid' | 'list';
  /** Called when view changes (optional) */
  onViewChange?: (view: 'grid' | 'list') => void;
  className?: string;
}

export function MarketplaceTopBar({
  title,
  searchPlaceholder = 'Search APIs...',
  query,
  formId,
  sort,
  sortOptions = DEFAULT_SORT_OPTIONS,
  buildSortHref,
  resultsCount,
  showFiltersButton = false,
  onOpenFilters,
  view = 'grid',
  onViewChange,
  className,
}: MarketplaceTopBarProps) {
  const currentSortOption = sortOptions.find((o) => o.value === sort) ?? sortOptions[0];

  return (
    <div
      className={cn(
        'sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border py-4',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Left: title + optional results */}
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl font-semibold text-foreground truncate">
            {title}
          </h1>
          {resultsCount && (
            <p className="text-sm text-muted-foreground">{resultsCount}</p>
          )}
        </div>

        {/* Center: search + Filters (mobile) */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {showFiltersButton && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={onOpenFilters}
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
          <div className="relative flex-1 w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              name="q"
              form={formId}
              placeholder={searchPlaceholder}
              defaultValue={query}
              className="pl-10 h-11 w-full focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
              aria-label="Search APIs"
            />
          </div>
        </div>

        {/* Right: sort + view toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 min-w-[140px] justify-between">
                <span className="truncate">{currentSortOption.label}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {sortOptions.map((opt) => (
                <DropdownMenuItem key={opt.value} asChild>
                  <a href={buildSortHref(opt.value)} className="flex items-center gap-2 cursor-pointer">
                    {opt.icon}
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      )}
                    </div>
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onViewChange && (
            <div className="flex rounded-md border border-input overflow-hidden" role="group" aria-label="View mode">
              <Button
                type="button"
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none px-2"
                onClick={() => onViewChange('grid')}
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none px-2"
                onClick={() => onViewChange('list')}
                aria-label="List view"
                aria-pressed={view === 'list'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
