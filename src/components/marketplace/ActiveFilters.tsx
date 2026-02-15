'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ActiveFiltersProps {
  /** Search query */
  query?: string;
  /** Category name (for display) */
  categoryName?: string;
  /** Href to clear category only */
  clearCategoryHref: string;
  /** Min rating (e.g. 4 for "4+") */
  minRating?: number;
  /** Href to clear minRating only */
  clearMinRatingHref: string;
  /** Free tier filter on */
  freeOnly?: boolean;
  /** Href to clear freeOnly */
  clearFreeOnlyHref: string;
  /** Active tags */
  tags: string[];
  /** Href builder: (tagToRemove) => href that clears that tag */
  clearTagHref: (tag: string) => string;
  /** Price range active */
  priceMin?: number;
  priceMax?: number;
  /** Href to clear price range */
  clearPriceHref: string;
  /** Href to clear query */
  clearQueryHref: string;
  /** Href to clear all filters */
  clearAllHref: string;
  /** Optional class for container */
  className?: string;
}

export function ActiveFilters({
  query,
  categoryName,
  clearCategoryHref,
  minRating,
  clearMinRatingHref,
  freeOnly,
  clearFreeOnlyHref,
  tags,
  clearTagHref,
  priceMin,
  priceMax,
  clearPriceHref,
  clearQueryHref,
  clearAllHref,
  className,
}: ActiveFiltersProps) {
  const chips: { key: string; label: string; clearHref: string; ariaLabel: string }[] = [];
  if (query) {
    chips.push({
      key: 'q',
      label: `"${query}"`,
      clearHref: clearQueryHref,
      ariaLabel: 'Remove search',
    });
  }
  if (categoryName) {
    chips.push({
      key: 'cat',
      label: categoryName,
      clearHref: clearCategoryHref,
      ariaLabel: 'Remove category',
    });
  }
  if (minRating != null) {
    chips.push({
      key: 'rating',
      label: `${minRating}+ stars`,
      clearHref: clearMinRatingHref,
      ariaLabel: 'Remove rating filter',
    });
  }
  if (freeOnly) {
    chips.push({
      key: 'free',
      label: 'Free tier',
      clearHref: clearFreeOnlyHref,
      ariaLabel: 'Remove free tier filter',
    });
  }
  tags.forEach((tag) => {
    chips.push({
      key: `tag-${tag}`,
      label: tag,
      clearHref: clearTagHref(tag),
      ariaLabel: `Remove tag ${tag}`,
    });
  });
  if (priceMin != null || priceMax != null) {
    chips.push({
      key: 'price',
      label: `$${priceMin ?? 0}–${priceMax != null ? `$${priceMax}` : '∞'}`,
      clearHref: clearPriceHref,
      ariaLabel: 'Remove price range',
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground transition-[background-color,color] duration-200"
        >
          <span>{chip.label}</span>
          <a
            href={chip.clearHref}
            className="ml-0.5 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            aria-label={chip.ariaLabel}
          >
            <X className="h-3.5 w-3.5" />
          </a>
        </span>
      ))}
      <span className="text-xs text-muted-foreground">
        <a href={clearAllHref} className="underline hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          {chips.length} active filter{chips.length !== 1 ? 's' : ''} • Clear all
        </a>
      </span>
    </div>
  );
}
