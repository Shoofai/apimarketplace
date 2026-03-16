import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TrendingDown, AlertTriangle, Users, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

// ── Types ──────────────────────────────────────────────────────────────────

type RiskSignal = { signal: string; weight: number };

type AssessmentRow = {
  id: string;
  stakeholder_id: string;
  risk_score: number;
  risk_level: string;
  risk_signals: RiskSignal[];
  intervention_type: string | null;
  intervention_sent: boolean;
  intervention_result: string | null;
  assessed_at: string;
  stakeholder: {
    full_name: string | null;
    email: string;
    stakeholder_type: string;
    funnel_stage: string;
  } | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function riskBadgeVariant(level: string): 'destructive' | 'default' | 'secondary' | 'outline' {
  if (level === 'critical') return 'destructive';
  if (level === 'high')     return 'default';
  if (level === 'medium')   return 'secondary';
  return 'outline';
}

function resultBadgeVariant(result: string | null): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (result === 'recovered')  return 'default';
  if (result === 'churned')    return 'destructive';
  if (result === 'pending')    return 'secondary';
  return 'outline';
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AdminChurnPage() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await userClient
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_platform_admin) redirect('/dashboard');

  const supabase = createAdminClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Today's assessments
  const { data: todayAssessments } = await supabase
    .from('churn_risk_assessments')
    .select(`
      id, stakeholder_id, risk_score, risk_level, risk_signals,
      intervention_type, intervention_sent, intervention_result, assessed_at,
      stakeholder:stakeholders(full_name, email, stakeholder_type, funnel_stage)
    `)
    .gte('assessed_at', todayStart.toISOString())
    .order('risk_score', { ascending: false })
    .limit(100);

  // All-time intervention outcomes
  const { data: allAssessments } = await supabase
    .from('churn_risk_assessments')
    .select('intervention_result, risk_level')
    .not('intervention_result', 'is', null);

  // Summary counts (today)
  const rows = (todayAssessments as AssessmentRow[] ?? []);
  const criticalCount = rows.filter(r => r.risk_level === 'critical').length;
  const highCount     = rows.filter(r => r.risk_level === 'high').length;
  const mediumCount   = rows.filter(r => r.risk_level === 'medium').length;
  const totalToday    = rows.length;

  // Intervention outcome counts (all time)
  const all = allAssessments ?? [];
  const outcomes = {
    pending:     all.filter(r => r.intervention_result === 'pending').length,
    recovered:   all.filter(r => r.intervention_result === 'recovered').length,
    churned:     all.filter(r => r.intervention_result === 'churned').length,
    no_response: all.filter(r => r.intervention_result === 'no_response').length,
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <TrendingDown className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Churn Risk</h1>
          <p className="text-sm text-muted-foreground">
            Proactive churn detection across all four funnels — assessed daily at 8 AM UTC
          </p>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          Today&apos;s Assessments
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total at risk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalToday}</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Human outreach triggered</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-500">High</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-500">{highCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Automated email sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Medium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mediumCount}</p>
              <p className="text-xs text-muted-foreground mt-1">In-app nudge queued</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Intervention Outcomes */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          Intervention Outcomes (all time)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: outcomes.pending, color: 'text-muted-foreground' },
            { label: 'Recovered', value: outcomes.recovered, color: 'text-green-600' },
            { label: 'No response', value: outcomes.no_response, color: 'text-orange-500' },
            { label: 'Churned', value: outcomes.churned, color: 'text-destructive' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${color}`}>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* At-risk Stakeholders Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          At-Risk Stakeholders — Today
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stakeholder</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Level</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Signals</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Intervention</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Result</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assessed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium truncate max-w-[160px]">
                          {row.stakeholder?.full_name ?? '—'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {row.stakeholder?.email ?? row.stakeholder_id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-xs text-muted-foreground">
                          {row.stakeholder?.stakeholder_type?.replace(/_/g, ' ') ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold tabular-nums">{row.risk_score}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={riskBadgeVariant(row.risk_level)} className="capitalize text-xs">
                          {row.risk_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {(row.risk_signals ?? []).map((s) => (
                            <span
                              key={s.signal}
                              className="inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono"
                              title={`weight: ${s.weight}`}
                            >
                              {s.signal.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize text-muted-foreground">
                          {row.intervention_type?.replace(/_/g, ' ') ?? 'none'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.intervention_result ? (
                          <Badge
                            variant={resultBadgeVariant(row.intervention_result)}
                            className="capitalize text-xs"
                          >
                            {row.intervention_result.replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.assessed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                        No at-risk stakeholders assessed today. The cron runs daily at 8 AM UTC.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
