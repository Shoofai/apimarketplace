import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

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
  contract_signed: 'Contract Signed',
  churned: 'Churned',
};

const STAGE_COLORS: Record<string, string> = {
  discovered: 'bg-muted text-muted-foreground',
  governance_viewed: 'bg-blue-100 text-blue-700',
  roi_calculated: 'bg-indigo-100 text-indigo-700',
  demo_scheduled: 'bg-yellow-100 text-yellow-700',
  demo_completed: 'bg-orange-100 text-orange-700',
  pilot_started: 'bg-emerald-100 text-emerald-700',
  pilot_active: 'bg-green-100 text-green-700',
  proposal_sent: 'bg-purple-100 text-purple-700',
  negotiating: 'bg-pink-100 text-pink-700',
  contract_signed: 'bg-primary/10 text-primary font-semibold',
  churned: 'bg-destructive/10 text-destructive',
};

export default async function EnterpriseDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/enterprise');
  }

  const admin = createAdminClient();

  // Find stakeholder
  const { data: stakeholder } = await admin
    .from('stakeholders')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // Find enterprise profile (may not exist yet)
  const { data: profile } = stakeholder
    ? await admin
        .from('enterprise_profiles')
        .select('*')
        .eq('stakeholder_id', stakeholder.id)
        .maybeSingle()
    : { data: null };

  const roi = profile?.roi_calculation as {
    savings?: { annual_cost_savings?: number; three_year_roi_pct?: number; payback_period_months?: number };
    recommended_plan?: { name?: string };
  } | null;

  function fmt(n: number) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {profile?.company_name
              ? `${profile.company_name} — your governance journey`
              : 'Track your enterprise pilot and governance setup'}
          </p>
        </div>
        <Link
          href="/enterprise"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition"
        >
          View enterprise page →
        </Link>
      </div>

      {!profile ? (
        /* No profile yet — prompt to get started */
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-lg font-semibold mb-2">Set up your enterprise profile</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Calculate your ROI, book a demo, and start your free pilot — all from one place.
          </p>
          <Link
            href="/enterprise#roi"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Calculate my ROI →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Stage card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Funnel Stage
            </p>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STAGE_COLORS[profile.enterprise_stage ?? ''] ?? 'bg-muted text-muted-foreground'}`}
            >
              {STAGE_LABELS[profile.enterprise_stage ?? ''] ?? profile.enterprise_stage}
            </span>
            <div className="mt-4 text-sm text-muted-foreground">
              Deal probability:{' '}
              <span className="font-semibold text-foreground">
                {Math.round((profile.deal_probability ?? 0.1) * 100)}%
              </span>
            </div>
            {profile.demo_scheduled_at && (
              <p className="mt-2 text-sm text-muted-foreground">
                Demo scheduled:{' '}
                <span className="font-medium text-foreground">
                  {new Date(profile.demo_scheduled_at).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>

          {/* ROI summary card */}
          {roi?.savings ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Your ROI Estimate
              </p>
              <p className="text-3xl font-bold text-primary">
                {fmt(roi.savings.annual_cost_savings ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">estimated annual savings</p>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">3-year ROI</span>
                  <span className="font-medium">{roi.savings.three_year_roi_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payback period</span>
                  <span className="font-medium">
                    {roi.savings.payback_period_months === 999
                      ? 'N/A'
                      : `${roi.savings.payback_period_months} months`}
                  </span>
                </div>
                {roi.recommended_plan?.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommended plan</span>
                    <span className="font-medium">{roi.recommended_plan.name}</span>
                  </div>
                )}
              </div>
              <Link
                href="/enterprise#roi"
                className="mt-4 inline-block text-xs text-primary hover:underline"
              >
                Recalculate →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm text-muted-foreground">No ROI calculation yet</p>
              <Link
                href="/enterprise#roi"
                className="text-sm font-medium text-primary hover:underline"
              >
                Calculate now →
              </Link>
            </div>
          )}

          {/* Next step card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Next Step
            </p>
            {profile.enterprise_stage === 'discovered' ||
            profile.enterprise_stage === 'governance_viewed' ? (
              <>
                <p className="text-sm mb-3">Calculate your ROI to see your personalised savings.</p>
                <Link
                  href="/enterprise#roi"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Open ROI calculator →
                </Link>
              </>
            ) : profile.enterprise_stage === 'roi_calculated' ? (
              <>
                <p className="text-sm mb-3">Book a 15-min demo to see your savings in action.</p>
                <Link
                  href="/enterprise#demo"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Book demo →
                </Link>
              </>
            ) : profile.enterprise_stage === 'demo_scheduled' ? (
              <p className="text-sm text-muted-foreground">
                Demo scheduled — check your calendar invite. We look forward to meeting you.
              </p>
            ) : profile.enterprise_stage === 'demo_completed' ? (
              <>
                <p className="text-sm mb-3">Start your free pilot — live in under an hour.</p>
                <Link
                  href="/dashboard/settings/organization"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Set up pilot →
                </Link>
              </>
            ) : profile.enterprise_stage === 'contract_signed' ? (
              <p className="text-sm text-muted-foreground font-medium text-primary">
                Welcome aboard! Your account manager will be in touch shortly.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your account manager will reach out with the next steps.
              </p>
            )}
          </div>

          {/* Company details card (if populated) */}
          {profile.company_name && (
            <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2 xl:col-span-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Company Details
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Company</dt>
                  <dd className="font-medium">{profile.company_name}</dd>
                </div>
                {profile.industry && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Industry</dt>
                    <dd className="font-medium">{profile.industry}</dd>
                  </div>
                )}
                {profile.company_size && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="font-medium capitalize">{profile.company_size.replace('_', ' ')}</dd>
                  </div>
                )}
                {(profile.apis_managed ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">APIs managed</dt>
                    <dd className="font-medium">{profile.apis_managed}</dd>
                  </div>
                )}
              </dl>
              <Link
                href="/enterprise"
                className="mt-4 inline-block text-xs text-primary hover:underline"
              >
                Update details →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
