'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HELP_ARTICLES, HELP_CATEGORIES, searchArticles, type HelpCategory } from '@/lib/help/articles';

const CATEGORY_ICONS: Record<HelpCategory, string> = {
  'Getting Started': '🚀',
  'Billing & Account': '💳',
  'API Integration': '🔌',
  'Security': '🔒',
  'For Providers': '📦',
  'Troubleshooting': '🔧',
};

export function HelpCenterClient() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<HelpCategory | null>(null);

  const results = useMemo(() => {
    const base = query.trim() ? searchArticles(query) : HELP_ARTICLES;
    if (activeCategory) return base.filter((a) => a.category === activeCategory);
    return base;
  }, [query, activeCategory]);

  const isSearching = query.trim().length > 0;

  return (
    <div>
      {/* Search bar */}
      <div className="relative max-w-xl mx-auto mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          className="pl-9 h-12 text-base"
          aria-label="Search help articles"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {HELP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            {results.length === 0
              ? 'No articles found. Try a different search term.'
              : `${results.length} article${results.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="space-y-3">
            {results.map((article) => (
              <Link
                key={article.slug}
                href={`/help/${article.slug}`}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors group"
              >
                <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{article.summary}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category grid (non-search state) */}
      {!isSearching && (
        <div className="space-y-10">
          {(activeCategory ? [activeCategory] : HELP_CATEGORIES).map((cat) => {
            const articles = HELP_ARTICLES.filter((a) => a.category === cat);
            return (
              <section key={cat}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {articles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors group"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{article.summary}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
