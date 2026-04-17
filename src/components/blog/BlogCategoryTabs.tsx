'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CategoryTabData {
  slug: string;
  name: string;
  count: number;
}

interface BlogCategoryTabsProps {
  categories: CategoryTabData[];
  activeSlug?: string;
}

export function BlogCategoryTabs({ categories, activeSlug }: BlogCategoryTabsProps) {
  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Blog categories"
    >
      <Link
        href="/blog"
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
          !activeSlug
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/blog?category=${cat.slug}`}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            activeSlug === cat.slug
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
          )}
        >
          {cat.name}
          <span className="ml-1.5 tabular-nums opacity-70">({cat.count})</span>
        </Link>
      ))}
    </nav>
  );
}
