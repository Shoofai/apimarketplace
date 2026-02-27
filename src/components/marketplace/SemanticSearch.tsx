'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { APICard } from '@/components/marketplace/APICard';
import { Sparkles, Search, Loader2, X } from 'lucide-react';

interface APIResult {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  avg_rating?: number | null;
  total_subscribers?: number | null;
  logo_url?: string | null;
  status: string;
  organization: { name: string; slug: string; logo_url?: string | null };
  category?: { name: string; slug: string } | null;
  pricing_plans?: { price_monthly?: number | null }[];
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<APIResult[] | null>(null);
  const [mode, setMode] = useState<'semantic' | 'unavailable' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function clear() {
    setQuery('');
    setResults(null);
    setMode(null);
    setError(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(async () => {
      setError(null);
      setResults(null);
      try {
        const res = await fetch('/api/marketplace/semantic-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Search failed');
        setMode(data.mode);
        setResults(data.apis ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search error');
      }
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need, e.g. 'send SMS notifications to users'"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isPending || !query.trim()} className="gap-2 shrink-0">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Ask AI
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {mode === 'unavailable' && (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-40" />
          AI search is not configured. Ask your admin to add an <code className="font-mono text-xs">OPENAI_API_KEY</code>.
        </div>
      )}

      {results !== null && mode === 'semantic' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-purple-600 border-purple-300 dark:border-purple-700">
              <Sparkles className="h-3 w-3" />
              AI results for &ldquo;{query}&rdquo;
            </Badge>
            <span className="text-xs text-muted-foreground">{results.length} match{results.length !== 1 ? 'es' : ''}</span>
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground ml-auto">
              Clear
            </button>
          </div>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No APIs found matching your description.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((api) => (
                <APICard
                  key={api.id}
                  api={{
                    ...api,
                    organization: api.organization,
                    category: api.category ?? null,
                    minPrice: api.pricing_plans?.reduce(
                      (min: number | undefined, p: { price_monthly?: number | null }) =>
                        p.price_monthly != null
                          ? min === undefined ? Number(p.price_monthly) : Math.min(min, Number(p.price_monthly))
                          : min,
                      undefined as number | undefined
                    ),
                  } as any}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
