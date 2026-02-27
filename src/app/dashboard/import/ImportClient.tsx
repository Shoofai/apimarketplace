'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, FileJson, CheckCircle, XCircle, Loader2, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface MatchedAPI {
  api: {
    id: string;
    name: string;
    slug: string;
    base_url: string;
    short_description?: string | null;
    logo_url?: string | null;
    avg_rating?: number | null;
    organization?: { name: string; slug: string } | null;
  };
  matchedBaseUrl: string;
  endpoints: { name: string; method: string; path: string }[];
}

interface ImportResult {
  collection: { name: string; format: string; total_requests: number; base_urls: string[] };
  matched: MatchedAPI[];
  unmatched: string[];
}

const FORMAT_OPTIONS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'postman', label: 'Postman v2.1' },
  { value: 'insomnia', label: 'Insomnia v4' },
  { value: 'bruno', label: 'Bruno (.bru)' },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-700 border-green-500/20',
  POST: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  PUT: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  PATCH: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  DELETE: 'bg-red-500/10 text-red-700 border-red-500/20',
};

export function ImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('auto');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [subscribing, setSubscribing] = useState<Set<string>>(new Set());
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('format', format);
      const res = await fetch('/api/import/collection', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Import failed');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(apiId: string, orgSlug: string, apiSlug: string) {
    setSubscribing((s) => new Set(s).add(apiId));
    try {
      // Navigate to marketplace page where user can pick a plan and subscribe
      window.open(`/marketplace/${orgSlug}/${apiSlug}`, '_blank');
      setSubscribed((s) => new Set(s).add(apiId));
    } finally {
      setSubscribing((s) => { const n = new Set(s); n.delete(apiId); return n; });
    }
  }

  const org = (api: MatchedAPI['api']) => {
    const o = api.organization;
    if (!o) return { name: '', slug: '' };
    return Array.isArray(o) ? (o[0] ?? { name: '', slug: '' }) : o;
  };

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Collection</CardTitle>
          <CardDescription>
            Supports Postman v2.1 (.json), Insomnia v4 (.json), and Bruno (.bru) collection files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".json,.bru"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileJson className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">Drop your collection file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
            )}
          </div>

          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleImport} disabled={!file || loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Analyse Collection
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-muted-foreground">
              <strong className="text-foreground">{result.collection.name}</strong>
              &nbsp;·&nbsp;{result.collection.total_requests} requests
              &nbsp;·&nbsp;<Badge variant="secondary" className="capitalize">{result.collection.format}</Badge>
            </span>
            <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              {result.matched.length} API{result.matched.length !== 1 ? 's' : ''} matched
            </span>
            {result.unmatched.length > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <XCircle className="h-4 w-4" />
                {result.unmatched.length} unmatched base URL{result.unmatched.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Matched APIs */}
          {result.matched.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Matched APIs on the marketplace</h3>
              {result.matched.map(({ api, matchedBaseUrl, endpoints }) => {
                const orgInfo = org(api);
                const isSubscribed = subscribed.has(api.id);
                return (
                  <Card key={api.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-sm font-bold">
                            {api.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{api.name}</span>
                              {orgInfo.name && <span className="text-xs text-muted-foreground">by {orgInfo.name}</span>}
                              {api.avg_rating != null && (
                                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {api.avg_rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Matched: <code className="font-mono bg-muted px-1 rounded">{matchedBaseUrl}</code>
                            </p>
                            {api.short_description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{api.short_description}</p>
                            )}

                            {/* Endpoints */}
                            {endpoints.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {endpoints.slice(0, 5).map((ep, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className={`inline-flex px-1.5 py-0.5 rounded border font-mono font-medium ${METHOD_COLORS[ep.method] ?? 'bg-muted text-muted-foreground border-border'}`}>
                                      {ep.method}
                                    </span>
                                    <code className="font-mono text-muted-foreground truncate">{ep.path}</code>
                                    {ep.name && <span className="text-muted-foreground/60 truncate">{ep.name}</span>}
                                  </div>
                                ))}
                                {endpoints.length > 5 && (
                                  <p className="text-xs text-muted-foreground pl-1">+{endpoints.length - 5} more endpoints</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant={isSubscribed ? 'secondary' : 'default'}
                            onClick={() => handleSubscribe(api.id, orgInfo.slug, api.slug)}
                            disabled={subscribing.has(api.id)}
                            className="gap-1.5 whitespace-nowrap"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {isSubscribed ? 'Opening…' : 'Subscribe'}
                          </Button>
                          <Link
                            href={`/marketplace/${orgInfo.slug}/${api.slug}`}
                            target="_blank"
                            className="text-xs text-primary hover:underline text-center"
                          >
                            View in marketplace
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Unmatched */}
          {result.unmatched.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  Unmatched base URLs
                </CardTitle>
                <CardDescription>These base URLs weren&apos;t found in the marketplace. You can submit these APIs for listing.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.unmatched.map((url) => (
                    <li key={url} className="text-sm font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded">
                      {url}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/apis/publish" className="text-xs text-primary hover:underline mt-3 inline-block">
                  Submit an API to the marketplace →
                </Link>
              </CardContent>
            </Card>
          )}

          {result.matched.length === 0 && result.unmatched.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No base URLs were detected in this collection. Ensure the requests contain absolute URLs.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
