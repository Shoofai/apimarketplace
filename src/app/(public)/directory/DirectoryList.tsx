'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';

export type DirectoryAPI = {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  avg_rating?: number | null;
  total_reviews?: number | null;
  total_subscribers?: number | null;
  category_name?: string | null;
  organization?: { name: string; slug: string } | null;
};

export function DirectoryList({
  apis,
  categories,
}: {
  apis: DirectoryAPI[];
  categories: string[];
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = apis;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (api) =>
          api.name.toLowerCase().includes(q) ||
          (api.short_description && api.short_description.toLowerCase().includes(q)) ||
          (api.organization?.name && api.organization.name.toLowerCase().includes(q))
      );
    }
    if (category) {
      list = list.filter((api) => (api.category_name || '') === category);
    }
    return list;
  }, [apis, search, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder={`Search ${apis.length} APIs...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          aria-label="Search APIs"
        />
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                category === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No APIs match your filters. Clear filters or browse the full marketplace.
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((api) => (
            <li key={api.id}>
              <Link href={`/marketplace/${api.organization?.slug ?? 'org'}/${api.slug}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold text-lg">{api.name}</h2>
                        {api.short_description && (
                          <p className="text-muted-foreground text-sm mt-1">{api.short_description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {api.organization && <span>by {api.organization.name}</span>}
                          {typeof api.avg_rating === 'number' && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3 fill-amber-400 text-amber-400" />
                              {api.avg_rating.toFixed(1)}
                              {api.total_reviews != null && (
                                <span>({api.total_reviews})</span>
                              )}
                            </span>
                          )}
                          {api.total_subscribers != null && api.total_subscribers > 0 && (
                            <span>{api.total_subscribers} developers</span>
                          )}
                        </div>
                      </div>
                      {api.category_name && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                          {api.category_name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
