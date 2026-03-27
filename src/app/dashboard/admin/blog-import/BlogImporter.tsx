'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  SkipForward,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ManifestRow {
  application: string;
  order: number;
  category: string;
  articleName: string;
  imageName: string;
}

interface ImportResult {
  imported: string[];
  skipped: string[];
  errors: { article: string; error: string }[];
}

export default function BlogImporter() {
  const [manifest, setManifest] = useState<ManifestRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchManifest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blog-import/manifest');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setManifest(data.rows);
      setSelected(new Set(data.rows.map((r: ManifestRow) => r.articleName)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch manifest');
    } finally {
      setLoading(false);
    }
  };

  const runImport = async (dryRun = false) => {
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/blog-import/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: Array.from(selected),
          dryRun,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const toggleAll = () => {
    if (selected.size === manifest.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(manifest.map((r) => r.articleName)));
    }
  };

  const toggleOne = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Import</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Import blog articles from Google Sheets + Drive
          </p>
        </div>
        <Button onClick={fetchManifest} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {manifest.length > 0 ? 'Refresh' : 'Fetch Manifest'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {manifest.length > 0 && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">
                Articles ({selected.size}/{manifest.length} selected)
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selected.size === manifest.length ? 'Deselect All' : 'Select All'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {manifest.map((row) => (
                  <label
                    key={row.articleName}
                    className="flex cursor-pointer items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(row.articleName)}
                      onChange={() => toggleOne(row.articleName)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.articleName}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {row.category}
                        </Badge>
                        <span className="text-xs text-gray-400">Order: {row.order}</span>
                        {row.imageName && (
                          <span className="text-xs text-gray-400">Image: {row.imageName}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => runImport(true)}
              variant="outline"
              disabled={importing || selected.size === 0}
            >
              Dry Run ({selected.size})
            </Button>
            <Button
              onClick={() => runImport(false)}
              disabled={importing || selected.size === 0}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              {importing ? 'Importing...' : `Import ${selected.size} Articles`}
            </Button>
          </div>
        </>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.imported.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Imported ({result.imported.length})
                </p>
                <ul className="ml-6 list-disc text-sm text-gray-600 dark:text-gray-400">
                  {result.imported.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.skipped.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-amber-600">
                  <SkipForward className="h-4 w-4" />
                  Skipped ({result.skipped.length})
                </p>
                <ul className="ml-6 list-disc text-sm text-gray-600 dark:text-gray-400">
                  {result.skipped.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.errors.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <XCircle className="h-4 w-4" />
                  Errors ({result.errors.length})
                </p>
                <ul className="ml-6 list-disc text-sm text-red-600 dark:text-red-400">
                  {result.errors.map((e) => (
                    <li key={e.article}>
                      {e.article}: {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.imported.length > 0 && (
              <a
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View blog
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
