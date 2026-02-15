'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  /** Build href for a page number (1-based) */
  buildPageHref: (page: number) => string;
  /** Optional: max numbered links to show (e.g. 7). Default 7. */
  maxVisible?: number;
  className?: string;
}

/**
 * Renders Prev, numbered page links with ellipsis, and Next.
 * Example: 1 … 5 6 7 … 100 when current is 6 and total is 100.
 */
export function MarketplacePagination({
  currentPage,
  totalPages,
  buildPageHref,
  maxVisible = 7,
  className,
}: MarketplacePaginationProps) {
  if (totalPages <= 1) return null;

  const prevHref = currentPage > 1 ? buildPageHref(currentPage - 1) : null;
  const nextHref = currentPage < totalPages ? buildPageHref(currentPage + 1) : null;

  // Build list of page numbers to show (with ellipsis)
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis');
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis');
      pages.push(totalPages);
    }
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-1 flex-wrap', className)}
      aria-label="Pagination"
    >
      {prevHref ? (
        <Button variant="outline" size="sm" asChild>
          <a href={prevHref} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled aria-disabled="true">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center gap-1 px-2">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground" aria-hidden>
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={currentPage === p ? 'default' : 'ghost'}
              size="sm"
              className="min-w-[2rem]"
              asChild={currentPage !== p}
            >
              {currentPage === p ? (
                <span aria-current="page">{p}</span>
              ) : (
                <a href={buildPageHref(p)}>{p}</a>
              )}
            </Button>
          )
        )}
      </div>

      {nextHref ? (
        <Button variant="outline" size="sm" asChild>
          <a href={nextHref} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled aria-disabled="true">
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
