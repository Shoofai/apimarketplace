import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';

export interface CostAnomaly {
  id: string;
  type: 'spike' | 'drop';
  severity: 'warning' | 'critical';
  period: string;
  amount: number;
  expectedAmount: number;
  deviationPercent: number;
  message: string;
  detectedAt: string;
}

export interface SavingsOpportunity {
  id: string;
  type: 'unused' | 'over_provisioned' | 'alternative_plan' | 'caching' | 'downgrade' | 'alternative';
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  subscriptionId?: string;
  apiName?: string;
  /** For 'downgrade': suggested lower plan id */
  suggestedPlanId?: string;
  suggestedPlanName?: string;
  /** For 'alternative': slug to marketplace page */
  alternativeApiSlug?: string;
  alternativeApiOrgSlug?: string;
  alternativeApiName?: string;
}

export interface CostForecast {
  nextMonthAmount: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  basedOnDays: number;
}

export interface CostIntelligence {
  spendTimeSeries: { labels: string[]; values: number[] };
  totalSpendCurrentPeriod: number;
  totalSpendPreviousPeriod: number;
  periodOverPeriodChangePercent: number;
  anomalies: CostAnomaly[];
  savingsOpportunities: SavingsOpportunity[];
  forecast: CostForecast;
}

function getRangeDates(range: string): { from: Date; to: Date; previousFrom: Date; previousTo: Date } {
  const to = new Date();
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  const previousTo = new Date(from);
  previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - days);
  return { from, to, previousFrom, previousTo };
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const sq = arr.map((x) => (x - m) ** 2);
  return Math.sqrt(sq.reduce((a, b) => a + b, 0) / (arr.length - 1));
}

export async function getCostIntelligence(
  supabase: SupabaseClient,
  organizationId: string,
  range: string = '30d'
): Promise<CostIntelligence> {
  const { from, to, previousFrom, previousTo } = getRangeDates(range);
  const fromStr = from.toISOString();
  const toStr = to.toISOString();
  const prevFromStr = previousFrom.toISOString();
  const prevToStr = previousTo.toISOString();

  const { data: currentInvoices } = await supabase
    .from('invoices')
    .select('total, created_at')
    .eq('organization_id', organizationId)
    .in('status', ['paid', 'pending'])
    .gte('created_at', fromStr)
    .lte('created_at', toStr)
    .limit(DEFAULT_LIST_LIMIT);

  const { data: previousInvoices } = await supabase
    .from('invoices')
    .select('total, created_at')
    .eq('organization_id', organizationId)
    .in('status', ['paid', 'pending'])
    .gte('created_at', prevFromStr)
    .lte('created_at', prevToStr)
    .limit(DEFAULT_LIST_LIMIT);

  const toNum = (v: unknown) => Number(v ?? 0);
  const currentTotal = (currentInvoices ?? []).reduce((s, i) => s + toNum(i.total), 0);
  const previousTotal = (previousInvoices ?? []).reduce((s, i) => s + toNum(i.total), 0);
  const periodChange =
    previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : (currentTotal > 0 ? 100 : 0);

  const dailyMap: Record<string, number> = {};
  const d = new Date(from);
  while (d <= to) {
    dailyMap[d.toISOString().slice(0, 10)] = 0;
    d.setDate(d.getDate() + 1);
  }
  (currentInvoices ?? []).forEach((inv: { total?: unknown; created_at?: string }) => {
    const day = inv.created_at?.slice(0, 10);
    if (day && day in dailyMap) dailyMap[day] += toNum(inv.total);
  });

  const labels: string[] = [];
  const values: number[] = [];
  const d2 = new Date(from);
  while (d2 <= to) {
    const key = d2.toISOString().slice(0, 10);
    labels.push(d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    values.push(dailyMap[key] ?? 0);
    d2.setDate(d2.getDate() + 1);
  }

  const anomalies: CostAnomaly[] = [];
  const dailyValues = values.filter((v) => v > 0);
  if (dailyValues.length >= 3) {
    const avg = mean(dailyValues);
    const sigma = std(dailyValues);
    dailyValues.forEach((val, i) => {
      if (sigma === 0) return;
      const z = (val - avg) / sigma;
      if (z >= 2) {
        anomalies.push({
          id: `anom-${i}-spike`,
          type: 'spike',
          severity: z >= 3 ? 'critical' : 'warning',
          period: labels[i] ?? '',
          amount: val,
          expectedAmount: Math.round(avg),
          deviationPercent: Math.round(((val - avg) / avg) * 100),
          message: `Spend on ${labels[i]} was ${z >= 3 ? 'critically' : 'unusually'} high (${Math.round((val - avg) / avg * 100)}% above average).`,
          detectedAt: new Date().toISOString(),
        });
      } else if (z <= -2) {
        anomalies.push({
          id: `anom-${i}-drop`,
          type: 'drop',
          severity: 'warning',
          period: labels[i] ?? '',
          amount: val,
          expectedAmount: Math.round(avg),
          deviationPercent: Math.round(((val - avg) / avg) * 100),
          message: `Spend on ${labels[i]} was unusually low.`,
          detectedAt: new Date().toISOString(),
        });
      }
    });
  }
  if (Math.abs(periodChange) >= 50 && previousTotal > 0) {
    anomalies.push({
      id: 'anom-period',
      type: periodChange > 0 ? 'spike' : 'drop',
      severity: Math.abs(periodChange) >= 100 ? 'critical' : 'warning',
      period: `${range} vs previous ${range}`,
      amount: currentTotal,
      expectedAmount: previousTotal,
      deviationPercent: Math.round(periodChange),
      message: `Period-over-period spend changed by ${Math.round(periodChange)}%.`,
      detectedAt: new Date().toISOString(),
    });
  }

  const savingsOpportunities: SavingsOpportunity[] = [];

  // Load active subscriptions with plan and API info
  const { data: subs } = await supabase
    .from('api_subscriptions')
    .select(`
      id,
      plan_id,
      api:apis!api_subscriptions_api_id_fkey(
        id, name, slug, category_id,
        organization:organizations!apis_organization_id_fkey(slug)
      ),
      plan:api_pricing_plans!api_subscriptions_plan_id_fkey(
        id, name, price_monthly, included_calls
      )
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .limit(DEFAULT_LIST_LIMIT);

  const subIds = (subs ?? []).map((s: { id: string }) => s.id);
  const subToCalls: Record<string, number> = {};
  if (subIds.length > 0) {
    const { data: requestCounts } = await supabase
      .from('api_requests_log')
      .select('subscription_id')
      .in('subscription_id', subIds)
      .gte('created_at', fromStr)
      .lte('created_at', toStr)
      .limit(DEFAULT_LIST_LIMIT);
    (requestCounts ?? []).forEach((r: { subscription_id?: string }) => {
      const id = r.subscription_id ?? '';
      subToCalls[id] = (subToCalls[id] ?? 0) + 1;
    });
  }

  type SubRow = {
    id: string;
    plan_id?: string | null;
    api?: { id: string; name: string; slug: string; category_id?: string | null; organization?: { slug?: string } | { slug?: string }[] | null } | { id: string; name: string; slug: string; category_id?: string | null; organization?: { slug?: string } | { slug?: string }[] | null }[];
    plan?: { id: string; name: string; price_monthly?: number | null; included_calls?: number | null } | { id: string; name: string; price_monthly?: number | null; included_calls?: number | null }[];
  };

  for (const s of (subs ?? []) as SubRow[]) {
    const api = Array.isArray(s.api) ? s.api[0] : s.api;
    const plan = Array.isArray(s.plan) ? s.plan[0] : s.plan;
    const apiName = api?.name ?? 'Unknown API';
    const calls = subToCalls[s.id] ?? 0;

    // 1. Unused subscription
    if (calls === 0) {
      savingsOpportunities.push({
        id: `sav-${s.id}-unused`,
        type: 'unused',
        title: `Unused subscription: ${apiName}`,
        description: 'No API calls in the selected period. Consider pausing or cancelling.',
        estimatedMonthlySavings: plan?.price_monthly ? Math.round(Number(plan.price_monthly)) : 29,
        subscriptionId: s.id,
        apiName,
      });
      continue; // unused implies we shouldn't also suggest downgrade
    }

    // 2. Downgrade: usage is less than 20% of included_calls on a paid plan
    const includedCalls = plan?.included_calls ? Number(plan.included_calls) : null;
    const monthlyPrice = plan?.price_monthly ? Number(plan.price_monthly) : null;
    if (
      includedCalls &&
      includedCalls > 0 &&
      calls < includedCalls * 0.2 &&
      monthlyPrice &&
      monthlyPrice > 0 &&
      api?.id
    ) {
      // Look for a cheaper plan on the same API
      const { data: lowerPlans } = await supabase
        .from('api_pricing_plans')
        .select('id, name, price_monthly, included_calls')
        .eq('api_id', api.id)
        .eq('is_active', true)
        .lt('price_monthly', monthlyPrice)
        .gte('included_calls', calls * 1.5) // still covers projected usage
        .order('price_monthly', { ascending: false })
        .limit(1);

      const lowerPlan = lowerPlans?.[0];
      if (lowerPlan) {
        const savings = Math.round(monthlyPrice - Number(lowerPlan.price_monthly));
        savingsOpportunities.push({
          id: `sav-${s.id}-downgrade`,
          type: 'downgrade',
          title: `Consider downgrading: ${apiName}`,
          description: `You're using ~${Math.round((calls / includedCalls) * 100)}% of your included calls. The "${lowerPlan.name}" plan would cover your usage at a lower price.`,
          estimatedMonthlySavings: savings > 0 ? savings : 1,
          subscriptionId: s.id,
          apiName,
          suggestedPlanId: lowerPlan.id,
          suggestedPlanName: lowerPlan.name,
        });
      }
    }

    // 3. Alternative API: find cheaper published APIs in same category
    if (api?.category_id && monthlyPrice && monthlyPrice > 10) {
      const { data: altApis } = await supabase
        .from('apis')
        .select(`
          id, name, slug,
          organization:organizations!apis_organization_id_fkey(slug),
          pricing_plans:api_pricing_plans(price_monthly)
        `)
        .eq('category_id', api.category_id)
        .eq('status', 'published')
        .neq('id', api.id)
        .limit(5);

      const cheaper = (altApis ?? []).find((alt: Record<string, unknown>) => {
        const plans = (alt.pricing_plans as { price_monthly?: unknown }[] | null) ?? [];
        const minPrice = plans.reduce((min: number, p: { price_monthly?: unknown }) => {
          const v = Number(p.price_monthly ?? 999999);
          return v < min ? v : min;
        }, 999999);
        return minPrice < monthlyPrice * 0.6 && minPrice >= 0;
      });

      if (cheaper) {
        const altOrg = Array.isArray((cheaper as Record<string, unknown>).organization)
          ? ((cheaper as Record<string, unknown>).organization as { slug?: string }[])[0]
          : ((cheaper as Record<string, unknown>).organization as { slug?: string } | null);
        savingsOpportunities.push({
          id: `sav-${s.id}-alt-${cheaper.id}`,
          type: 'alternative',
          title: `Cheaper alternative to ${apiName}`,
          description: `"${cheaper.name}" offers similar functionality in the same category at a potentially lower price.`,
          estimatedMonthlySavings: Math.round(monthlyPrice * 0.3),
          subscriptionId: s.id,
          apiName,
          alternativeApiName: cheaper.name as string,
          alternativeApiSlug: cheaper.slug as string,
          alternativeApiOrgSlug: altOrg?.slug ?? undefined,
        });
      }
    }
  }

  const avgDaily = values.length > 0 ? mean(values) : 0;
  const nextMonthAmount = avgDaily * 30;
  const trend: 'up' | 'down' | 'stable' =
    periodChange > 10 ? 'up' : periodChange < -10 ? 'down' : 'stable';
  const forecast: CostForecast = {
    nextMonthAmount: Math.round(nextMonthAmount * 100) / 100,
    trend,
    confidence: values.filter((v) => v > 0).length >= 7 ? 0.8 : 0.5,
    basedOnDays: values.length,
  };

  return {
    spendTimeSeries: { labels, values },
    totalSpendCurrentPeriod: Math.round(currentTotal * 100) / 100,
    totalSpendPreviousPeriod: Math.round(previousTotal * 100) / 100,
    periodOverPeriodChangePercent: Math.round(periodChange * 10) / 10,
    anomalies: anomalies.slice(0, 10),
    savingsOpportunities: savingsOpportunities.slice(0, 8),
    forecast,
  };
}
