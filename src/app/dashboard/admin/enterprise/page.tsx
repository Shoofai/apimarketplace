import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EnterpriseInvoicePanel } from './EnterpriseInvoicePanel';

const STAGE_ORDER = [
  'discovered',
  'governance_viewed',
  'roi_calculated',
  'demo_scheduled',
  'demo_completed',
  'pilot_started',
  'pilot_active',
  'proposal_sent',
  'negotiating',
  'contract_signed',
  'churned',
];

const STAGE_LABELS: Record<string, string> = {
  discovered: 'Discovered',
  governance_viewed: 'Governance Viewed',
  roi_calculated: 'ROI Calculated',
  demo_scheduled: 'Demo Scheduled',
  demo_completed: 'Demo Completed',
  pilot_started: 'Pilot Started',
  pilot_active: 'Pilot Active',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  contract_signed: 'Contract Signed ✅',
  churned: 'Churned',
};

const STAGE_BG: Record<string, string> = {
  discovered: 'bg-muted/50',
  governance_viewed: 'bg-blue-50 dark:bg-blue-950/30',
  roi_calculated: 'bg-indigo-50 dark:bg-indigo-950/30',
  demo_scheduled: 'bg-yellow-50 dark:bg-yellow-950/30',
  demo_completed: 'bg-orange-50 dark:bg-orange-950/30',
  pilot_started: 'bg-emerald-50 dark:bg-emerald-950/30',
  pilot_active: 'bg-green-50 dark:bg-green-950/30',
  proposal_sent: 'bg-purple-50 dark:bg-purple-950/30',
  negotiating: 'bg-pink-50 dark:bg-pink-950/30',
  contract_signed: 'bg-primary/5',
  churned: 'bg-destructive/5',
};

function fmt(n: number | null | undefined) {
  if (!n) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

type EnterpriseProfile = {
  id: string;
  company_name: string;
  company_size: string | null;
  industry: string | null;
  enterprise_stage: string;
  deal_probability: number;
  estimated_deal_value: number | null;
  expected_close_date: string | null;
  demo_scheduled_at: string | null;
  created_at: string;
  stakeholder_id: string;
};

export default async function AdminEnterprisePipelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();

  const [profilesResult, orgsResult] = await Promise.all([
    admin
      .from('enterprise_profiles')
      .select(
        'id, company_name, company_size, industry, enterprise_stage, deal_probability, estimated_deal_value, expected_close_date, demo_scheduled_at, created_at, stakeholder_id'
      )
      .order('created_at', { ascending: false }),
    admin
      .from('organizations')
      .select('id, name, plan')
      .in('plan', ['enterprise', 'pro'])
      .order('name'),
  ]);

  if (profilesResult.error) {
    return (
      <div className="p-8 text-destructive">
        Failed to load pipeline: {profilesResult.error.message}
      </div>
    );
  }

  const rows = (profilesResult.data ?? []) as EnterpriseProfile[];
  const orgs = (orgsResult.data ?? []) as { id: string; name: string; plan: string }[];

  // Group by stage
  const byStage: Record<string, EnterpriseProfile[]> = {};
  for (const stage of STAGE_ORDER) {
    byStage[stage] = rows.filter((r) => r.enterprise_stage === stage);
  }

  const activeDeals = rows.filter((r) => r.enterprise_stage !== 'churned' && r.enterprise_stage !== 'discovered');
  const totalPipelineValue = activeDeals.reduce(
    (sum, r) => sum + (r.estimated_deal_value ?? 0) * (r.deal_probability ?? 0.1),
    0
  );
  const closedWon = rows.filter((r) => r.enterprise_stage === 'contract_signed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Enterprise</h1>
        <p className="text-muted-foreground mt-1">
          Pipeline tracking and custom invoicing
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total accounts', value: rows.length.toString() },
          { label: 'Active deals', value: activeDeals.length.toString() },
          { label: 'Weighted pipeline', value: fmt(totalPipelineValue) },
          { label: 'Closed won', value: closedWon.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Custom Invoicing Panel */}
      <EnterpriseInvoicePanel orgs={orgs} />

      {/* Pipeline board */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Pipeline</h2>
        {STAGE_ORDER.map((stage) => {
          const stageRows = byStage[stage] ?? [];
          if (stageRows.length === 0) return null;

          return (
            <div key={stage}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold">{STAGE_LABELS[stage]}</h3>
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {stageRows.length}
                </span>
                {stageRows.some((r) => r.estimated_deal_value) && (
                  <span className="text-xs text-muted-foreground">
                    {fmt(stageRows.reduce((s, r) => s + (r.estimated_deal_value ?? 0), 0))} pipeline
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b border-border ${STAGE_BG[stage]}`}>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Industry</th>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Size</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Deal value</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Probability</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Close date</th>
                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">Entered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stageRows.map((r) => (
                      <tr key={r.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-medium">
                          {r.company_name || <span className="text-muted-foreground italic">Unknown</span>}
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">{r.industry ?? '—'}</td>
                        <td className="py-2.5 px-4 text-muted-foreground capitalize">
                          {r.company_size?.replace(/_/g, ' ') ?? '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium">{fmt(r.estimated_deal_value)}</td>
                        <td className="py-2.5 px-4 text-right">
                          {Math.round((r.deal_probability ?? 0.1) * 100)}%
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                          {r.expected_close_date
                            ? new Date(r.expected_close_date).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No enterprise accounts yet. Share the{' '}
            <a href="/enterprise" className="text-primary hover:underline">
              enterprise page
            </a>{' '}
            to get started.
          </div>
        )}
      </div>
    </div>
  );
}
