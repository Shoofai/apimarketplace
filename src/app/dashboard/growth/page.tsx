import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, TrendingDown, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GrowthTrendChart, { type DailyMetricRow } from '@/components/growth/GrowthTrendChart';
import FunnelSnapshotChart, { type FunnelSnapshotRow } from '@/components/growth/FunnelSnapshotChart';
import ConversionWaterfallChart from '@/components/growth/ConversionWaterfallChart';
import ConversionVelocityChart, { type VelocityRow } from '@/components/growth/ConversionVelocityChart';
import TopSourcesChart, { type TopSourceRow } from '@/components/growth/TopSourcesChart';

export const dynamic = 'force-dynamic';

// ── Types ──────────────────────────────────────────────────────────────────

type FunnelSnapshotRpc = FunnelSnapshotRow;
type VelocityRpc = VelocityRow;
type TopSourceRpc = TopSourceRow;

// ── Helpers ────────────────────────────────────────────────────────────────

function trendDirection(data: DailyMetricRow[]): { direction: 'up' | 'down' | 'flat'; pct: number } {
  const dates = [...new Set(data.map(r => r.metric_date))].sort();
  if (dates.length < 2) return { direction: 'flat', pct: 0 };
  const half = Math.floor(dates.length / 2);
  const firstHalf = dates.slice(0, half);
  const secondHalf = dates.slice(half);
  const avg = (ds: string[]) => {
    const rows = data.filter(r => ds.includes(r.metric_date));
    const total = rows.reduce((s, r) => s + r.captured_count, 0);
    return ds.length > 0 ? total / ds.length : 0;
  };
  const first = avg(firstHalf);
  const second = avg(secondHalf);
  if (first === 0) return { direction: 'flat', pct: 0 };
  const pct = Math.round(((second - first) / first) * 100);
  return { direction: pct > 2 ? 'up' : pct < -2 ? 'down' : 'flat', pct: Math.abs(pct) };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function GrowthPage() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await userClient
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_platform_admin) redirect('/dashboard');

  const admin = createAdminClient();

  const [snapshotRes, velocityRes, sourcesRes, dailyRes] = await Promise.all([
    admin.rpc('get_funnel_snapshot'),
    admin.rpc('get_conversion_velocity', { p_stakeholder_type: null, p_days: 30 }),
    admin.rpc('get_top_sources', { p_days: 30, p_limit: 10 }),
    admin
      .from('daily_funnel_metrics')
      .select('metric_date, stakeholder_type, captured_count, converted_count, overall_conversion_pct')
      .order('metric_date', { ascending: true })
      .limit(14),
  ]);

  const snapshot  = (snapshotRes.data  ?? []) as FunnelSnapshotRpc[];
  const velocity  = (velocityRes.data  ?? []) as VelocityRpc[];
  const sources   = (sourcesRes.data   ?? []) as TopSourceRpc[];
  const daily     = (dailyRes.data     ?? []) as DailyMetricRow[];

  // ── Summary stats ──────────────────────────────────────────────────────

  const totalCaptured  = snapshot.reduce((s, r) => r.stage === 'captured'  ? s + r.count : s, 0);
  const totalConverted = snapshot.reduce((s, r) => r.stage === 'converted' ? s + r.count : s, 0);
  const totalAll       = snapshot.reduce((s, r) => s + r.count, 0);
  const overallConvPct = totalAll > 0
    ? Math.round((totalConverted / totalAll) * 100 * 10) / 10
    : 0;

  const trend = trendDirection(daily);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Growth</h1>
          <p className="text-sm text-muted-foreground">
            Funnel health, conversion rates, velocity, and acquisition sources — last 30 days
          </p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Total captured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalCaptured.toLocaleString()} at captured stage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ArrowRight className="h-4 w-4 text-green-600" />
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalConverted.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">all stakeholder types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallConvPct}%</p>
            <p className="text-xs text-muted-foreground mt-1">of all stakeholders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">14-day capture trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {trend.direction === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
              {trend.direction === 'down' && <TrendingDown className="h-5 w-5 text-destructive" />}
              {trend.direction === 'flat' && <span className="text-2xl">→</span>}
              <p className={`text-3xl font-bold ${
                trend.direction === 'up' ? 'text-green-600'
                : trend.direction === 'down' ? 'text-destructive'
                : ''
              }`}>
                {trend.pct > 0 ? `${trend.pct}%` : '—'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {trend.direction === 'up' ? 'growing' : trend.direction === 'down' ? 'declining' : 'stable'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 1. Growth Trend Line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">14-Day Growth Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Daily captures per stakeholder type + total conversions</p>
        </CardHeader>
        <CardContent>
          <GrowthTrendChart data={daily} />
        </CardContent>
      </Card>

      {/* 2 + 3. Funnel Distribution + Conversion Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funnel Stage Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Stakeholder counts stacked by stage</p>
          </CardHeader>
          <CardContent>
            <FunnelSnapshotChart data={snapshot} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Waterfall</CardTitle>
            <p className="text-sm text-muted-foreground">% of captured reaching each stage</p>
          </CardHeader>
          <CardContent>
            <ConversionWaterfallChart data={snapshot} />
          </CardContent>
        </Card>
      </div>

      {/* 4. Stage Velocity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage Transition Velocity</CardTitle>
          <p className="text-sm text-muted-foreground">Average time to move between stages (last 30 days)</p>
        </CardHeader>
        <CardContent>
          <ConversionVelocityChart data={velocity} />
        </CardContent>
      </Card>

      {/* 5. Top Acquisition Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Acquisition Sources</CardTitle>
          <p className="text-sm text-muted-foreground">Where stakeholders come from — captured vs converted</p>
        </CardHeader>
        <CardContent>
          <TopSourcesChart data={sources} />
        </CardContent>
      </Card>
    </div>
  );
}
