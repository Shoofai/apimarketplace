import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export interface DeveloperAnalytics {
  subscriptions: { id: string; name: string; api_name: string }[];
  apiCalls: number;
  successRate: number;
  avgLatencyMs: number | null;
  monthlySpend: number;
  timeSeries: { labels: string[]; values: number[] };
}

function getRangeDates(range: string): { from: Date; to: Date } {
  const to = new Date();
  const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from, to };
}

export async function getDeveloperAnalytics(
  supabase: SupabaseClient,
  organizationId: string,
  range: string = '30d',
  subscriptionIdFilter: string | null = null
): Promise<DeveloperAnalytics> {
  const { from, to } = getRangeDates(range);
  const fromStr = from.toISOString();
  const toStr = to.toISOString();

  const { data: subs } = await supabase
    .from('api_subscriptions')
    .select('id, api:apis!api_subscriptions_api_id_fkey(id, name)')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .limit(DEFAULT_LIST_LIMIT);

  const allSubIds = (subs ?? []).map((s) => s.id);
  const subscriptionIds =
    subscriptionIdFilter && subscriptionIdFilter !== 'all'
      ? allSubIds.filter((id) => id === subscriptionIdFilter)
      : allSubIds;

  const subscriptions = (subs ?? []).map((s: { id: string; api?: { name: string } | { name: string }[] }) => {
    const api = Array.isArray(s.api) ? s.api[0] : s.api;
    return {
      id: s.id,
      name: api?.name ?? 'Unknown API',
      api_name: api?.name ?? 'Unknown',
    };
  });

  let apiCalls = 0;
  let successCount = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  const dailyMap: Record<string, number> = {};

  if (subscriptionIds.length > 0) {
    const { data: requests } = await supabase
      .from('api_requests_log')
      .select('status_code, latency_ms, created_at')
      .in('subscription_id', subscriptionIds)
      .gte('created_at', fromStr)
      .lte('created_at', toStr)
      .limit(DEFAULT_LIST_LIMIT);

    if (requests?.length) {
      apiCalls = requests.length;
      successCount = requests.filter((r: { status_code: number }) => r.status_code >= 200 && r.status_code < 300).length;
      requests.forEach((r: { latency_ms?: number; created_at?: string }) => {
        if (r.latency_ms != null) {
          totalLatency += r.latency_ms;
          latencyCount++;
        }
        const day = r.created_at?.slice(0, 10);
        if (day) dailyMap[day] = (dailyMap[day] ?? 0) + 1;
      });
    }
  }

  let monthlySpend = 0;
  try {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, total')
      .eq('organization_id', organizationId)
      .gte('created_at', fromStr)
      .lte('created_at', toStr)
      .eq('status', 'paid')
      .limit(DEFAULT_LIST_LIMIT);
    monthlySpend = (invoices ?? []).reduce(
      (sum, inv: { total_amount?: number; total?: number }) =>
        sum + Number((inv as { total_amount?: number }).total_amount ?? (inv as { total?: number }).total ?? 0),
      0
    );
  } catch {
    // ignore
  }

  const labels: string[] = [];
  const values: number[] = [];
  const d = new Date(from);
  while (d <= to) {
    const key = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    values.push(dailyMap[key] ?? 0);
    d.setDate(d.getDate() + 1);
  }

  return {
    subscriptions,
    apiCalls,
    successRate: apiCalls > 0 ? Math.round((successCount / apiCalls) * 100) : 100,
    avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : null,
    monthlySpend,
    timeSeries: { labels, values },
  };
}
