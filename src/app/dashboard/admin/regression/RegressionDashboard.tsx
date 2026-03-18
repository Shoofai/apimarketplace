'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, CheckCircle, XCircle, SkipForward, Clock, AlertCircle } from 'lucide-react';

interface RegressionSummary {
  lastRun: string | null;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  durationMs: number;
  error?: string;
  results: Array<{ title: string; outcome: string; duration?: number }>;
}

export function RegressionDashboard() {
  const [data, setData] = useState<RegressionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/regression-results');
      if (!res.ok) throw new Error(res.status === 403 ? 'Forbidden' : await res.text());
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = data ?? {
    lastRun: null,
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    durationMs: 0,
    error: 'No data',
    results: [],
  };

  const allPassed = summary.total > 0 && summary.failed === 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.lastRun ? (
              <span className="text-sm text-muted-foreground">
                {new Date(summary.lastRun).toLocaleString()}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{summary.passed}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{summary.failed}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            <SkipForward className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{summary.skipped}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {summary.durationMs >= 1000
                ? `${(summary.durationMs / 1000).toFixed(1)}s`
                : `${summary.durationMs}ms`}
            </span>
          </CardContent>
        </Card>
      </div>

      {summary.error && (
        <Card className="border-amber-500/50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700 dark:text-amber-400">{summary.error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Status</CardTitle>
          <div className="flex items-center gap-2">
            {allPassed ? (
              <Badge className="bg-green-600">All passed</Badge>
            ) : summary.total === 0 ? (
              <Badge variant="secondary">No run yet</Badge>
            ) : (
              <Badge variant="destructive">Failures</Badge>
            )}
            <button
              type="button"
              onClick={fetchResults}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Run the full suite locally: <code className="bg-muted px-1 rounded">npm run test:e2e:regression</code>.
            Results are written to <code className="bg-muted px-1 rounded">test-results/regression-summary.json</code>.
          </p>
          {summary.results.length > 0 ? (
            <div className="rounded-md border overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Test</th>
                    <th className="text-left p-3 font-medium w-24">Outcome</th>
                    <th className="text-left p-3 font-medium w-20">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.results.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-mono text-xs">{r.title}</td>
                      <td className="p-3">
                        {(r.outcome === 'expected' || r.outcome === 'passed') && (
                          <Badge className="bg-green-600/10 text-green-700 dark:text-green-400">passed</Badge>
                        )}
                        {(r.outcome === 'unexpected' || r.outcome === 'failed') && (
                          <Badge variant="destructive">failed</Badge>
                        )}
                        {r.outcome === 'skipped' && (
                          <Badge variant="secondary">skipped</Badge>
                        )}
                        {!['expected', 'unexpected', 'passed', 'failed', 'skipped'].includes(r.outcome) && (
                          <Badge variant="outline">{r.outcome}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {r.duration != null ? `${Math.round(r.duration)}ms` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No test results to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
