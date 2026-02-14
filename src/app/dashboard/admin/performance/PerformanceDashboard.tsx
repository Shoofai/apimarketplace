'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Gauge, Database, HardDrive, Activity, Zap } from 'lucide-react';
import type { PerformanceMetrics } from '@/lib/monitoring/performance';

const REFRESH_INTERVAL_MS = 30_000;

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/performance/metrics', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMetrics(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch performance metrics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const { requests, database, redis, performanceMetricsTable } = metrics;
  const errorRatePct = (requests.errorRate * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Auto-refreshes every 30 seconds.
        </span>
        <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Requests (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.last24h.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {requests.last1h} in last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Error rate (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{errorRatePct}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {requests.errorCount24h} errors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              Latency (p95)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.p95Ms != null ? `${requests.p95Ms} ms` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              p50: {requests.p50Ms != null ? `${requests.p50Ms} ms` : '—'} · p99: {requests.p99Ms != null ? `${requests.p99Ms} ms` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {database.responseTimeMs != null ? `${database.responseTimeMs} ms` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              Redis
            </CardTitle>
            <Badge variant={redis.status === 'ok' ? 'default' : redis.status === 'disabled' ? 'secondary' : 'destructive'}>
              {redis.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {redis.responseTimeMs != null ? `${redis.responseTimeMs} ms` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {redis.keyCount != null ? `${redis.keyCount} keys` : 'Response time'}
            </p>
          </CardContent>
        </Card>
      </div>

      {requests.byEndpoint.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top endpoints by request count (24h)</CardTitle>
            <CardDescription>From API request log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Endpoint</th>
                    <th className="text-right py-2 font-medium">Count</th>
                    <th className="text-right py-2 font-medium">Avg latency</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.byEndpoint.map((row) => (
                    <tr key={row.endpoint} className="border-b border-muted/50">
                      <td className="py-2 font-mono text-xs truncate max-w-[200px]" title={row.endpoint}>
                        {row.endpoint}
                      </td>
                      <td className="py-2 text-right">{row.count.toLocaleString()}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {row.avgLatency != null ? `${row.avgLatency} ms` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {performanceMetricsTable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stored performance metrics</CardTitle>
            <CardDescription>Aggregated from performance_metrics table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Endpoint</th>
                    <th className="text-right py-2 font-medium">p50</th>
                    <th className="text-right py-2 font-medium">p95</th>
                    <th className="text-right py-2 font-medium">Count</th>
                    <th className="text-right py-2 font-medium">Errors</th>
                    <th className="text-left py-2 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMetricsTable.slice(0, 20).map((row, i) => (
                    <tr key={row.timestamp + i} className="border-b border-muted/50">
                      <td className="py-2">{row.metric_type}</td>
                      <td className="py-2 font-mono text-xs truncate max-w-[120px]">{row.endpoint ?? '—'}</td>
                      <td className="py-2 text-right">{row.p50_ms ?? '—'}</td>
                      <td className="py-2 text-right">{row.p95_ms ?? '—'}</td>
                      <td className="py-2 text-right">{row.count}</td>
                      <td className="py-2 text-right">{row.error_count}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
