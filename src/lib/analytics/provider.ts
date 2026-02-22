import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export interface ProviderAnalytics {
  apis: { id: string; name: string; slug: string }[];
  totalRevenue: number;
  totalPayout: number;
  totalSubscribers: number;
  revenueTimeSeries: { labels: string[]; values: number[] };
  subscribersTimeSeries: { labels: string[]; values: number[] };
  topApisByRevenue: { id: string; name: string; revenue: number; subscribers: number }[];
  planDistribution: { plan: string; count: number }[];
  /** Subscriber count by signup month (cohort). */
  cohortByMonth: { month: string; count: number }[];
  /** Top endpoints by request count (path, requests, apiId). */
  topEndpoints: { path: string; requests: number; apiId: string; apiName?: string }[];
}

function getRangeDates(range: string): { from: Date; to: Date } {
  const to = new Date();
  const days = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from, to };
}

export async function getProviderAnalytics(
  supabase: SupabaseClient,
  organizationId: string,
  range: string = '30d',
  apiIdFilter: string | null = null
): Promise<ProviderAnalytics> {
  const { from, to } = getRangeDates(range);
  const fromStr = from.toISOString();
  const toStr = to.toISOString();

  const { data: apis } = await supabase
    .from('apis')
    .select('id, name, slug')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .limit(DEFAULT_LIST_LIMIT);

  const apiIds = (apis ?? []).map((a) => a.id);
  const filteredApiIds =
    apiIdFilter && apiIdFilter !== 'all' ? apiIds.filter((id) => id === apiIdFilter) : apiIds;

  let totalRevenue = 0;
  let totalPayout = 0;
  const revenueByDay: Record<string, number> = {};
  const subscribersByDay: Record<string, number> = {};
  const apiRevenue: Record<string, number> = {};
  const apiSubscribers: Record<string, number> = {};
  const cohortByMonth: Record<string, number> = {};

  if (filteredApiIds.length > 0) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('api_id, total_amount, total, platform_fee, created_at')
      .in('api_id', filteredApiIds)
      .gte('created_at', fromStr)
      .lte('created_at', toStr)
      .eq('status', 'paid')
      .limit(DEFAULT_LIST_LIMIT);

    (invoices ?? []).forEach((inv: { api_id?: string; total_amount?: number; total?: number; platform_fee?: number; created_at?: string }) => {
      const amt = Number(inv.total_amount ?? inv.total ?? 0);
      const fee = Number(inv.platform_fee ?? 0);
      totalRevenue += amt;
      totalPayout += amt - fee;
      const day = inv.created_at?.slice(0, 10);
      if (day) revenueByDay[day] = (revenueByDay[day] ?? 0) + amt;
      if (inv.api_id) apiRevenue[inv.api_id] = (apiRevenue[inv.api_id] ?? 0) + amt;
    });

    const { data: subs } = await supabase
      .from('api_subscriptions')
      .select('api_id, created_at')
      .in('api_id', filteredApiIds)
      .eq('status', 'active')
      .limit(DEFAULT_LIST_LIMIT);

    (subs ?? []).forEach((s: { api_id?: string; created_at?: string }) => {
      if (s.api_id) apiSubscribers[s.api_id] = (apiSubscribers[s.api_id] ?? 0) + 1;
      const day = s.created_at?.slice(0, 10);
      if (day) subscribersByDay[day] = (subscribersByDay[day] ?? 0) + 1;
      const month = s.created_at?.slice(0, 7);
      if (month) cohortByMonth[month] = (cohortByMonth[month] ?? 0) + 1;
    });
  }

  const cohortByMonthList = Object.entries(cohortByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalSubscribers = filteredApiIds.reduce((sum, id) => sum + (apiSubscribers[id] ?? 0), 0);

  const labels: string[] = [];
  const revValues: number[] = [];
  const subValues: number[] = [];
  const d = new Date(from);
  while (d <= to) {
    const key = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    revValues.push(revenueByDay[key] ?? 0);
    subValues.push(subscribersByDay[key] ?? 0);
    d.setDate(d.getDate() + 1);
  }

  const topApisByRevenue = (apis ?? [])
    .filter((a) => filteredApiIds.includes(a.id))
    .map((a) => ({
      id: a.id,
      name: a.name,
      revenue: apiRevenue[a.id] ?? 0,
      subscribers: apiSubscribers[a.id] ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const { data: planCounts } = await supabase
    .from('api_subscriptions')
    .select('pricing_plan_id, api_pricing_plans(name)')
    .in('api_id', filteredApiIds)
    .eq('status', 'active')
    .limit(DEFAULT_LIST_LIMIT);

  const planMap: Record<string, number> = {};
  (planCounts ?? []).forEach((r: { api_pricing_plans?: { name?: string } | { name?: string }[] }) => {
    const plans = Array.isArray(r.api_pricing_plans) ? r.api_pricing_plans[0] : r.api_pricing_plans;
    const name = plans?.name ?? 'Unknown';
    planMap[name] = (planMap[name] ?? 0) + 1;
  });
  const planDistribution = Object.entries(planMap).map(([plan, count]) => ({ plan, count }));

  let topEndpoints: { path: string; requests: number; apiId: string; apiName?: string }[] = [];
  if (filteredApiIds.length > 0) {
    const { data: logRows } = await supabase
      .from('api_requests_log')
      .select('api_id, path')
      .in('api_id', filteredApiIds)
      .gte('created_at', fromStr)
      .lte('created_at', toStr)
      .limit(DEFAULT_LIST_LIMIT);
    const pathCount: Record<string, { requests: number; apiId: string; path: string }> = {};
    (logRows ?? []).forEach((r: { api_id?: string; path?: string }) => {
      const apiId = r.api_id ?? '';
      const path = r.path ?? '/';
      const key = `${apiId}:${path}`;
      if (!pathCount[key]) pathCount[key] = { requests: 0, apiId, path };
      pathCount[key].requests += 1;
    });
    const apiNameById = Object.fromEntries((apis ?? []).map((a) => [a.id, a.name]));
    topEndpoints = Object.values(pathCount)
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10)
      .map((e) => ({ path: e.path, requests: e.requests, apiId: e.apiId, apiName: apiNameById[e.apiId] }));
  }

  return {
    apis: apis ?? [],
    totalRevenue,
    totalPayout,
    totalSubscribers,
    revenueTimeSeries: { labels, values: revValues },
    subscribersTimeSeries: { labels, values: subValues },
    topApisByRevenue,
    planDistribution,
    cohortByMonth: cohortByMonthList,
    topEndpoints,
  };
}
