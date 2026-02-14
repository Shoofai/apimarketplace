import type { SupabaseClient } from '@supabase/supabase-js';
import { getRedisClient } from '@/lib/cache/redis';

export type PerformanceMetrics = {
  requests: {
    last24h: number;
    last1h: number;
    errorCount24h: number;
    errorRate: number;
    p50Ms: number | null;
    p95Ms: number | null;
    p99Ms: number | null;
    byEndpoint: Array<{ endpoint: string; count: number; avgLatency: number | null }>;
  };
  database: {
    responseTimeMs: number | null;
  };
  redis: {
    status: 'ok' | 'disabled' | 'error';
    responseTimeMs: number | null;
    keyCount: number | null;
  };
  performanceMetricsTable: Array<{
    metric_type: string;
    endpoint: string | null;
    p50_ms: number | null;
    p95_ms: number | null;
    p99_ms: number | null;
    count: number;
    error_count: number;
    timestamp: string;
  }>;
};

const toIso = (ms: number) => new Date(Date.now() - ms).toISOString();

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

/**
 * Collect performance metrics for the admin dashboard.
 * Uses admin client to read api_requests_log and performance_metrics.
 */
export async function getPerformanceMetrics(
  supabase: SupabaseClient
): Promise<PerformanceMetrics> {
  const iso24 = toIso(24 * 60 * 60 * 1000);
  const iso1h = toIso(60 * 60 * 1000);

  const [requestsMetrics, dbMetrics, redisMetrics, storedMetrics] = await Promise.all([
    fetchRequestMetrics(supabase, iso24, iso1h),
    measureDatabaseResponse(supabase),
    measureRedisMetrics(),
    fetchStoredPerformanceMetrics(supabase),
  ]);

  return {
    requests: requestsMetrics,
    database: dbMetrics,
    redis: redisMetrics,
    performanceMetricsTable: storedMetrics,
  };
}

async function fetchRequestMetrics(
  supabase: SupabaseClient,
  iso24: string,
  iso1h: string
): Promise<PerformanceMetrics['requests']> {
  const { data: requests24 } = await supabase
    .from('api_requests_log')
    .select('status_code, latency_ms, path, created_at')
    .gte('created_at', iso24)
    .limit(50000);

  const requests = requests24 ?? [];
  const last1h = requests.filter((r) => r.created_at >= iso1h).length;
  const errorCount24h = requests.filter(
    (r) => r.status_code < 200 || r.status_code >= 300
  ).length;
  const latencies = requests
    .map((r) => r.latency_ms)
    .filter((ms): ms is number => ms != null && typeof ms === 'number')
    .sort((a, b) => a - b);

  const pathCounts: Record<string, { count: number; totalLatency: number }> = {};
  for (const r of requests) {
    const path = r.path ?? 'unknown';
    if (!pathCounts[path]) pathCounts[path] = { count: 0, totalLatency: 0 };
    pathCounts[path].count++;
    if (r.latency_ms != null) pathCounts[path].totalLatency += r.latency_ms;
  }
  const byEndpoint = Object.entries(pathCounts)
    .map(([endpoint, { count, totalLatency }]) => ({
      endpoint,
      count,
      avgLatency: count > 0 ? Math.round(totalLatency / count) : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    last24h: requests.length,
    last1h,
    errorCount24h,
    errorRate: requests.length > 0 ? errorCount24h / requests.length : 0,
    p50Ms: latencies.length > 0 ? Math.round(percentile(latencies, 50)) : null,
    p95Ms: latencies.length > 0 ? Math.round(percentile(latencies, 95)) : null,
    p99Ms: latencies.length > 0 ? Math.round(percentile(latencies, 99)) : null,
    byEndpoint,
  };
}

async function measureDatabaseResponse(supabase: SupabaseClient): Promise<PerformanceMetrics['database']> {
  const start = Date.now();
  try {
    await supabase.from('users').select('id').limit(1).single();
    return { responseTimeMs: Date.now() - start };
  } catch {
    return { responseTimeMs: null };
  }
}

async function measureRedisMetrics(): Promise<PerformanceMetrics['redis']> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return { status: 'disabled', responseTimeMs: null, keyCount: null };
    }
    const start = Date.now();
    await client.ping();
    const responseTimeMs = Date.now() - start;
    let keyCount: number | null = null;
    if ('keys' in client && typeof (client as { keys: (p: string) => Promise<string[]> }).keys === 'function') {
      const keys = await (client as { keys: (p: string) => Promise<string[]> }).keys('*');
      keyCount = keys.length;
    }
    return { status: 'ok', responseTimeMs, keyCount };
  } catch {
    return { status: 'error', responseTimeMs: null, keyCount: null };
  }
}

async function fetchStoredPerformanceMetrics(
  supabase: SupabaseClient
): Promise<PerformanceMetrics['performanceMetricsTable']> {
  try {
    const { data } = await supabase
      .from('performance_metrics')
      .select('metric_type, endpoint, p50_ms, p95_ms, p99_ms, count, error_count, timestamp')
      .order('timestamp', { ascending: false })
      .limit(50);
    return (data ?? []) as PerformanceMetrics['performanceMetricsTable'];
  } catch {
    return [];
  }
}
