'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const API_CATEGORIES = [
  { value: 'payments', label: 'Payments' },
  { value: 'ai', label: 'AI / ML' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'communication', label: 'Communication' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'general', label: 'General' },
] as const;

export type ApiCategory = (typeof API_CATEGORIES)[number]['value'];

interface Benchmark {
  avg_monthly_calls_per_consumer: number;
  avg_consumers_first_month: number;
  avg_consumer_growth_pct: number;
  avg_price_per_1000_calls: number;
  platform_fee_pct: number;
}

const BENCHMARKS: Record<ApiCategory, Benchmark> = {
  payments: { avg_monthly_calls_per_consumer: 25000, avg_consumers_first_month: 8, avg_consumer_growth_pct: 20, avg_price_per_1000_calls: 2, platform_fee_pct: 3 },
  ai: { avg_monthly_calls_per_consumer: 15000, avg_consumers_first_month: 12, avg_consumer_growth_pct: 25, avg_price_per_1000_calls: 3, platform_fee_pct: 3 },
  data: { avg_monthly_calls_per_consumer: 50000, avg_consumers_first_month: 10, avg_consumer_growth_pct: 18, avg_price_per_1000_calls: 0.5, platform_fee_pct: 3 },
  communication: { avg_monthly_calls_per_consumer: 20000, avg_consumers_first_month: 6, avg_consumer_growth_pct: 22, avg_price_per_1000_calls: 1.5, platform_fee_pct: 3 },
  infrastructure: { avg_monthly_calls_per_consumer: 100000, avg_consumers_first_month: 5, avg_consumer_growth_pct: 15, avg_price_per_1000_calls: 0.3, platform_fee_pct: 3 },
  general: { avg_monthly_calls_per_consumer: 10000, avg_consumers_first_month: 5, avg_consumer_growth_pct: 20, avg_price_per_1000_calls: 1, platform_fee_pct: 3 },
};

type ScenarioKey = 'conservative' | 'realistic' | 'aggressive';

interface ProjectionMonths {
  month1: number;
  month3: number;
  month6: number;
  month12: number;
}

function calculateProjections(
  benchmark: Benchmark
): { conservative: ProjectionMonths; realistic: ProjectionMonths; aggressive: ProjectionMonths } {
  const scenarios: Record<ScenarioKey, { multiplier: number; growthMod: number }> = {
    conservative: { multiplier: 0.5, growthMod: 0.5 },
    realistic: { multiplier: 1.0, growthMod: 1.0 },
    aggressive: { multiplier: 2.0, growthMod: 1.5 },
  };

  const out: { conservative: ProjectionMonths; realistic: ProjectionMonths; aggressive: ProjectionMonths } = {
    conservative: { month1: 0, month3: 0, month6: 0, month12: 0 },
    realistic: { month1: 0, month3: 0, month6: 0, month12: 0 },
    aggressive: { month1: 0, month3: 0, month6: 0, month12: 0 },
  };

  for (const [scenario, params] of Object.entries(scenarios)) {
    const growth = (benchmark.avg_consumer_growth_pct / 100) * params.growthMod;
    const consumers1 = Math.round(benchmark.avg_consumers_first_month * params.multiplier);
    const monthlyRevenue = (month: number) => {
      const consumers = consumers1 * Math.pow(1 + growth, month - 1);
      const calls = consumers * benchmark.avg_monthly_calls_per_consumer;
      const gross = (calls / 1000) * benchmark.avg_price_per_1000_calls;
      const net = gross * (1 - benchmark.platform_fee_pct / 100);
      return Math.round(net);
    };
    out[scenario as ScenarioKey] = {
      month1: monthlyRevenue(1),
      month3: monthlyRevenue(3),
      month6: monthlyRevenue(6),
      month12: monthlyRevenue(12),
    };
  }

  return out;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n}`;
}

export function ProviderRevenueCalculator() {
  const [category, setCategory] = useState<ApiCategory>('general');

  const projections = useMemo(() => {
    const benchmark = BENCHMARKS[category];
    return calculateProjections(benchmark);
  }, [category]);

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/30 p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <Label htmlFor="provider-calc-category" className="text-sm font-medium text-foreground">
            Your API category
          </Label>
          <select
            id="provider-calc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ApiCategory)}
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {API_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              { key: 'conservative' as const, label: 'Conservative', highlight: false },
              { key: 'realistic' as const, label: 'Realistic', highlight: true },
              { key: 'aggressive' as const, label: 'Aggressive', highlight: false },
            ] as const
          ).map(({ key, label, highlight }) => (
            <Card
              key={key}
              className={cn(
                'border-2 transition-colors',
                highlight
                  ? 'border-green-500/60 bg-green-500/5 dark:bg-green-500/10'
                  : 'border-border bg-card'
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
                  {label}
                  {highlight && (
                    <span className="text-green-600 dark:text-green-400" aria-hidden>
                      ★
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Month 1</span>
                  <span className="font-medium">{formatCurrency(projections[key].month1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Month 3</span>
                  <span className="font-medium">{formatCurrency(projections[key].month3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Month 6</span>
                  <span className="font-medium">{formatCurrency(projections[key].month6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Month 12</span>
                  <span className="font-medium">{formatCurrency(projections[key].month12)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-2">
          <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
            <Link href="/providers/onboard">Start Earning — List Your API</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
