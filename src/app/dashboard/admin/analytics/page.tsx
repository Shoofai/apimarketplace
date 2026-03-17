import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// -----------------------------------------------------------------------
// Type definitions matching the RPC return shapes
// -----------------------------------------------------------------------
type FunnelSnapshotRow = {
  stakeholder_type: string;
  stage: string;
  count: number;
  avg_engagement_score: number | null;
};

type VelocityRow = {
  from_stage: string;
  to_stage: string;
  avg_hours: number | null;
  transition_count: number;
};

type TopSourceRow = {
  source: string;
  total_captured: number;
  total_converted: number;
  conversion_rate: number | null;
};

type DailyMetricRow = {
  metric_date: string;
  stakeholder_type: string;
  captured_count: number;
  segmented_count: number;
  activated_count: number;
  engaged_count: number;
  qualified_count: number;
  converting_count: number;
  converted_count: number;
  churned_count: number;
  overall_conversion_pct: number | null;
};

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const STAGE_ORDER = [
  'captured', 'segmented', 'activated', 'engaged',
  'qualified', 'converting', 'converted', 'churned',
];

const TYPE_LABELS: Record<string, string> = {
  investor:        'Investor',
  api_provider:    'Provider',
  developer:       'Developer',
  enterprise_buyer:'Enterprise',
  unknown:         'Unknown',
};

function fmt(n: number | null | undefined, decimals = 0) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtHours(h: number | null) {
  if (h == null) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${fmt(h, 1)}h`;
  return `${fmt(h / 24, 1)}d`;
}

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------
export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase.from('users').select('is_platform_admin').eq('id', user.id).single();
  if (!userData?.is_platform_admin) redirect('/dashboard');

  const admin = createAdminClient();

  // Run all queries in parallel
  const [snapshotRes, velocityRes, sourcesRes, dailyRes] = await Promise.all([
    admin.rpc('get_funnel_snapshot'),
    admin.rpc('get_conversion_velocity', { p_stakeholder_type: null, p_days: 30 }),
    admin.rpc('get_top_sources', { p_days: 30, p_limit: 10 }),
    admin
      .from('daily_funnel_metrics')
      .select('metric_date, stakeholder_type, captured_count, segmented_count, activated_count, engaged_count, qualified_count, converting_count, converted_count, churned_count, overall_conversion_pct')
      .order('metric_date', { ascending: false })
      .limit(14),
  ]);

  const snapshot  = (snapshotRes.data  ?? []) as FunnelSnapshotRow[];
  const velocity  = (velocityRes.data  ?? []) as VelocityRow[];
  const sources   = (sourcesRes.data   ?? []) as TopSourceRow[];
  const dailyRows = (dailyRes.data     ?? []) as DailyMetricRow[];

  // Group snapshot by stakeholder type
  const snapshotByType: Record<string, FunnelSnapshotRow[]> = {};
  for (const row of snapshot) {
    (snapshotByType[row.stakeholder_type] ??= []).push(row);
  }

  // Totals for header stats
  const totalStakeholders = snapshot.reduce((s, r) => s + (r.count ?? 0), 0);
  const totalConverted    = snapshot
    .filter((r) => r.stage === 'converted')
    .reduce((s, r) => s + (r.count ?? 0), 0);
  const overallConvRate   = totalStakeholders > 0
    ? Math.round((totalConverted / totalStakeholders) * 100)
    : 0;
  const uniqueTypes = Object.keys(snapshotByType).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Funnel Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Attribution, conversion velocity, and funnel health across all four segments.
        </p>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total stakeholders', value: fmt(totalStakeholders) },
          { label: 'Converted',          value: fmt(totalConverted) },
          { label: 'Overall conv. rate', value: `${overallConvRate}%` },
          { label: 'Active funnels',     value: uniqueTypes.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------
          Funnel Snapshot — one table per stakeholder type
      ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-sm font-semibold mb-4">Funnel Snapshot (current state)</h2>
        {Object.keys(snapshotByType).length === 0 ? (
          <p className="text-sm text-muted-foreground">No stakeholder data yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(snapshotByType).map(([type, rows]) => {
              const total = rows.reduce((s, r) => s + r.count, 0);
              const stageMap: Record<string, FunnelSnapshotRow> = {};
              for (const r of rows) stageMap[r.stage] = r;
              return (
                <div key={type} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{TYPE_LABELS[type] ?? type}</h3>
                    <span className="text-xs text-muted-foreground">{fmt(total)} total</span>
                  </div>
                  <div className="space-y-1.5">
                    {STAGE_ORDER.map((stage) => {
                      const r = stageMap[stage];
                      if (!r) return null;
                      const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                      return (
                        <div key={stage} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20 capitalize shrink-0">
                            {stage}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">
                            {fmt(r.count)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {rows[0]?.avg_engagement_score != null && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Avg engagement: <span className="font-medium text-foreground">{fmt(rows[0].avg_engagement_score, 1)}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------
          Top Sources
      ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Top Sources (last 30 days)</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Source</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Captured</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Converted</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Conv. rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((s) => (
                <tr key={s.source} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-medium capitalize">{s.source.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 px-4 text-right">{fmt(s.total_captured)}</td>
                  <td className="py-2.5 px-4 text-right">{fmt(s.total_converted)}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={`font-medium ${(s.conversion_rate ?? 0) > 10 ? 'text-primary' : ''}`}>
                      {fmt(s.conversion_rate, 1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No source data yet for the last 30 days.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Conversion Velocity
      ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Conversion Velocity (last 30 days)</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">From stage</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">To stage</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Avg time</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Transitions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {velocity.map((v, i) => (
                <tr key={i} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 capitalize text-muted-foreground">{v.from_stage}</td>
                  <td className="py-2.5 px-4 capitalize font-medium">{v.to_stage}</td>
                  <td className="py-2.5 px-4 text-right font-medium">{fmtHours(v.avg_hours)}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(v.transition_count)}</td>
                </tr>
              ))}
              {velocity.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No stage transitions recorded yet. The trigger fires on every{' '}
                    <code className="text-xs">funnel_stage</code> update.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Daily Trend (last 14 snapshots)
      ---------------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Daily Funnel Snapshots (last 14 days)</h2>
          <p className="text-xs text-muted-foreground">Aggregated daily at 5 AM UTC</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Captured</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Engaged</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Converting</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Converted</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Conv. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dailyRows.map((row) => (
                <tr key={`${row.metric_date}-${row.stakeholder_type}`} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-4 text-muted-foreground text-xs font-mono">
                    {new Date(row.metric_date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 capitalize">
                    {TYPE_LABELS[row.stakeholder_type] ?? row.stakeholder_type}
                  </td>
                  <td className="py-2 px-4 text-right">{fmt(row.captured_count)}</td>
                  <td className="py-2 px-4 text-right">{fmt(row.engaged_count)}</td>
                  <td className="py-2 px-4 text-right">{fmt(row.converting_count)}</td>
                  <td className="py-2 px-4 text-right font-medium">{fmt(row.converted_count)}</td>
                  <td className="py-2 px-4 text-right">
                    <span className={`font-medium ${(row.overall_conversion_pct ?? 0) > 5 ? 'text-primary' : ''}`}>
                      {fmt(row.overall_conversion_pct, 1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {dailyRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    No daily snapshots yet. First snapshot runs tonight at 5 AM UTC.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Full chart visualizations are available in the Growth Analytics view (Prompt 10).
        </p>
      </section>
    </div>
  );
}
