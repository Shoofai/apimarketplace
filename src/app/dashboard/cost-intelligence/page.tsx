'use client';

import { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Target,
} from 'lucide-react';
import type { CostIntelligence as CostIntelligenceType } from '@/lib/analytics/cost-intelligence';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CostIntelligencePage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<CostIntelligenceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ range });
      const res = await fetch(`/api/analytics/cost-intelligence?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cost intelligence');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const spendChartData = {
    labels: data?.spendTimeSeries?.labels ?? [],
    datasets: [
      {
        label: 'Spend ($)',
        data: data?.spendTimeSeries?.values ?? [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const changePercent = data?.periodOverPeriodChangePercent ?? 0;
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="h-6 w-6" />
            Cost Intelligence
          </h1>
          <p className="text-muted-foreground">
            Anomaly detection, savings opportunities, and spend forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {loading && !data && (
        <p className="text-muted-foreground text-sm">Loading cost intelligence…</p>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current period spend</p>
                  <p className="text-xl font-bold">
                    ${data.totalSpendCurrentPeriod.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-2 text-sm ${
                      isUp ? 'text-destructive' : isDown ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                    }`}
                  >
                    {isUp && <TrendingUp className="w-4 h-4" />}
                    {isDown && <TrendingDown className="w-4 h-4" />}
                    <span>
                      {isUp || isDown
                        ? `${Math.abs(changePercent)}% vs previous period`
                        : 'Stable vs previous period'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Previous period</p>
                  <p className="text-xl font-bold">
                    ${data.totalSpendPreviousPeriod.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Anomalies detected</p>
                  <p className="text-xl font-bold">{data.anomalies.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.anomalies.filter((a) => a.severity === 'critical').length} critical
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next month forecast</p>
                  <p className="text-xl font-bold">
                    ${data.forecast.nextMonthAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    Trend: {data.forecast.trend} · {Math.round(data.forecast.confidence * 100)}% confidence
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Spend over time */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-3">Spend over time</h3>
            <div className="h-80">
              <Line
                data={spendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Anomalies */}
            <Card className="p-6">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Anomalies
              </h3>
              {data.anomalies.length === 0 ? (
                <p className="text-muted-foreground text-sm">No anomalies detected in this period.</p>
              ) : (
                <ul className="space-y-3">
                  {data.anomalies.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground"
                    >
                      <Badge
                        variant={a.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="shrink-0"
                      >
                        {a.severity}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{a.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {a.period}: ${a.amount.toFixed(2)} ({a.deviationPercent > 0 ? '+' : ''}
                          {a.deviationPercent}%)
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Savings opportunities */}
            <Card className="p-6">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Savings opportunities
              </h3>
              {data.savingsOpportunities.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No savings opportunities identified. Keep usage efficient.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.savingsOpportunities.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground"
                    >
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {s.type.replace('_', ' ')}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-500 mt-2">
                          Est. ${s.estimatedMonthlySavings}/mo savings
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
