'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ROIOutput {
  current_state: {
    annual_api_spend: number;
    annual_management_cost: number;
    total_annual_cost: number;
    hours_wasted_annually: number;
  };
  with_platform: {
    annual_api_spend: number;
    annual_management_cost: number;
    platform_cost: number;
    total_annual_cost: number;
    hours_saved_annually: number;
  };
  savings: {
    annual_cost_savings: number;
    annual_time_savings_hours: number;
    payback_period_months: number;
    three_year_roi_pct: number;
    five_year_savings: number;
  };
  recommended_plan: {
    name: string;
    monthly_cost: number;
    annual_cost: number;
    features: string[];
  };
}

const COMPANY_SIZES = [
  { id: 'startup', label: 'Startup (1–50)', employees: '1-50' },
  { id: 'smb', label: 'SMB (51–200)', employees: '51-200' },
  { id: 'mid_market', label: 'Mid-Market (201–1,000)', employees: '201-1000' },
  { id: 'enterprise', label: 'Enterprise (1,001–10,000)', employees: '1001-10000' },
  { id: 'large_enterprise', label: 'Large Enterprise (10,000+)', employees: '10000+' },
];

const PAIN_POINTS = [
  { id: 'api_sprawl', label: 'API sprawl — hard to track what exists' },
  { id: 'no_governance', label: 'No central governance or access control' },
  { id: 'cost_overruns', label: 'Unpredictable API costs' },
  { id: 'security_gaps', label: 'Security & compliance gaps' },
  { id: 'slow_onboarding', label: 'Slow developer onboarding' },
  { id: 'no_monitoring', label: 'No real-time monitoring or alerts' },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function EnterpriseROICalculator({
  enterpriseId,
  stakeholderId,
  onDemoClick,
  className,
}: {
  enterpriseId?: string;
  stakeholderId?: string;
  onDemoClick?: () => void;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ROIOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [companySize, setCompanySize] = useState('smb');
  const [apisManaged, setApisManaged] = useState(20);
  const [monthlyApiCalls, setMonthlyApiCalls] = useState(1000000);
  const [annualApiSpend, setAnnualApiSpend] = useState(50000);
  const [teamSize, setTeamSize] = useState(3);
  const [avgSalary, setAvgSalary] = useState(120000);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [painPoints, setPainPoints] = useState<string[]>(['api_sprawl', 'no_governance']);

  const togglePain = (id: string) =>
    setPainPoints((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/enterprise/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_size: companySize,
          apis_managed: apisManaged,
          monthly_api_calls: monthlyApiCalls,
          current_annual_api_spend: annualApiSpend,
          team_size_managing_apis: teamSize,
          avg_salary_api_team: avgSalary,
          hours_per_week_api_management: hoursPerWeek,
          pain_points: painPoints,
          enterprise_id: enterpriseId,
          stakeholder_id: stakeholderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Calculation failed');
      setResult(data);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return (
    <div id="roi" className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${className ?? ''}`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold">Enterprise ROI Calculator</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          See your estimated savings in 2 minutes — no signup required.
        </p>
      </div>

      {/* Step progress */}
      {step < 3 && (
        <div className="px-6 pt-4">
          <div className="flex gap-1">
            {['Company', 'API Usage', 'Your Team'].map((label, i) => (
              <div key={i} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                <p
                  className={`text-xs mt-1 ${
                    i === step ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Step 0 — Company */}
        {step === 0 && (
          <>
            <div>
              <label className={labelClass}>Company size</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {COMPANY_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCompanySize(s.id)}
                    className={`px-3 py-2 rounded-lg border text-sm text-left transition ${
                      companySize === s.id
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Pain points (select all that apply)</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PAIN_POINTS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition ${
                      painPoints.includes(p.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={painPoints.includes(p.id)}
                      onChange={() => togglePain(p.id)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={() => setStep(1)}>
              Continue &rarr;
            </Button>
          </>
        )}

        {/* Step 1 — API Usage */}
        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Number of APIs managed</label>
                <input
                  type="number"
                  min={1}
                  value={apisManaged}
                  onChange={(e) => setApisManaged(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Monthly API calls (total)</label>
                <input
                  type="number"
                  min={0}
                  value={monthlyApiCalls}
                  onChange={(e) => setMonthlyApiCalls(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Current annual API spend ($)</label>
                <input
                  type="number"
                  min={0}
                  value={annualApiSpend}
                  onChange={(e) => setAnnualApiSpend(Number(e.target.value))}
                  className={inputClass}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include all API subscriptions, gateway costs, and third-party service fees.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                &larr; Back
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Continue &rarr;
              </Button>
            </div>
          </>
        )}

        {/* Step 2 — Team */}
        {step === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Engineers managing APIs</label>
                <input
                  type="number"
                  min={1}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Average annual salary ($)</label>
                <input
                  type="number"
                  min={0}
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Hours per week spent on API management (per engineer)
                </label>
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>1 hr</span>
                  <span className="font-medium text-foreground">{hoursPerWeek} hrs/week</span>
                  <span>40 hrs</span>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                &larr; Back
              </Button>
              <Button onClick={calculate} disabled={loading} className="flex-1">
                {loading ? 'Calculating…' : 'Calculate my ROI →'}
              </Button>
            </div>
          </>
        )}

        {/* Step 3 — Results */}
        {step === 3 && result && (
          <>
            {/* Headline savings */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 text-center">
              <p className="text-sm text-muted-foreground">Estimated annual savings</p>
              <p className="text-4xl font-bold text-primary mt-1">
                {fmt(result.savings.annual_cost_savings)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.savings.three_year_roi_pct}% 3-year ROI &middot; payback in{' '}
                {result.savings.payback_period_months === 999
                  ? 'N/A'
                  : `${result.savings.payback_period_months} months`}
              </p>
            </div>

            {/* Current vs. platform */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Current annual cost</p>
                <p className="text-xl font-bold text-destructive">
                  {fmt(result.current_state.total_annual_cost)}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>API spend: {fmt(result.current_state.annual_api_spend)}</li>
                  <li>Management: {fmt(result.current_state.annual_management_cost)}</li>
                  <li>Hours wasted/yr: {result.current_state.hours_wasted_annually.toLocaleString()}</li>
                </ul>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">With platform</p>
                <p className="text-xl font-bold text-primary">
                  {fmt(result.with_platform.total_annual_cost)}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>API spend: {fmt(result.with_platform.annual_api_spend)}</li>
                  <li>Management: {fmt(result.with_platform.annual_management_cost)}</li>
                  <li>Hours saved/yr: {result.with_platform.hours_saved_annually.toLocaleString()}</li>
                </ul>
              </div>
            </div>

            {/* Recommended plan */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-sm">Recommended: {result.recommended_plan.name}</p>
                <p className="text-sm font-bold">
                  {fmt(result.recommended_plan.monthly_cost)}/mo
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {result.recommended_plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 5-year savings */}
            <p className="text-center text-sm text-muted-foreground">
              5-year savings potential:{' '}
              <span className="font-semibold text-foreground">
                {fmt(result.savings.five_year_savings)}
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={onDemoClick}>
                Book a 15-min Demo →
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                Recalculate
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
