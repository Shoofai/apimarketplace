'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign, Users, TrendingUp, Activity, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { ProviderAnalytics } from '@/lib/analytics/provider';

const CHART_COLORS = [
  'rgba(156, 163, 175, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(99, 102, 241, 0.8)',
  'rgba(168, 85, 247, 0.8)',
];

export default function ProviderAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [apiId, setApiId] = useState('all');
  const [data, setData] = useState<ProviderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ range: timeRange, api_id: apiId });
      const res = await fetch(`/api/analytics/provider?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange, apiId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const revenueData = {
    labels: data?.revenueTimeSeries?.labels ?? [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: data?.revenueTimeSeries?.values ?? [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const subscribersData = {
    labels: data?.subscribersTimeSeries?.labels ?? [],
    datasets: [
      {
        label: 'Active Subscribers',
        data: data?.subscribersTimeSeries?.values ?? [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const planDistribution = {
    labels: data?.planDistribution?.map((p) => p.plan) ?? [],
    datasets: [
      {
        data: data?.planDistribution?.map((p) => p.count) ?? [],
        backgroundColor: CHART_COLORS,
      },
    ],
  };

  const endpointPerformance = {
    labels: data?.topApisByRevenue?.map((a) => a.name) ?? [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: data?.topApisByRevenue?.map((a) => a.revenue) ?? [],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
      },
      {
        label: 'Subscribers',
        data: data?.topApisByRevenue?.map((a) => a.subscribers) ?? [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const cohortData = {
    labels: data?.cohortByMonth?.map((c) => c.month) ?? [],
    datasets: [
      {
        label: 'New subscribers',
        data: data?.cohortByMonth?.map((c) => c.count) ?? [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Provider Analytics
          </h1>
          <p className="text-muted-foreground">Monitor your API performance and revenue</p>
        </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={apiId} onValueChange={setApiId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All APIs</SelectItem>
                {(data?.apis ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
        {loading && !data && <p className="text-muted-foreground text-sm">Loading analytics…</p>}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue (period)</p>
                <p className="text-3xl font-bold">${(data?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span>From invoices</span>
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
                <p className="text-sm text-muted-foreground mb-1">Payout (est.)</p>
                <p className="text-3xl font-bold">${(data?.totalPayout ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <span>After platform fee</span>
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
                <p className="text-sm text-muted-foreground mb-1">Active Subscribers</p>
                <p className="text-3xl font-bold">{(data?.totalSubscribers ?? 0).toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active subscriptions</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">APIs</p>
                <p className="text-3xl font-bold">{(data?.apis?.length ?? 0)}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Published</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top APIs</p>
                <p className="text-3xl font-bold">{(data?.topApisByRevenue?.length ?? 0)}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>By revenue</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscriber Growth */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>
            <div className="h-64">
              <Bar data={subscribersData} options={chartOptions} />
            </div>
          </Card>

          {/* Plan Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
            <div className="h-64">
              <Doughnut data={planDistribution} options={chartOptions} />
            </div>
          </Card>
        </div>

        {/* Top APIs by Revenue */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top APIs by Revenue</h3>
          <div className="h-80">
            <Bar data={endpointPerformance} options={chartOptions} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscriber cohort by month */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Subscriber cohort (by signup month)</h3>
            {cohortData.labels.length === 0 ? (
              <p className="text-muted-foreground text-sm">No cohort data in this period.</p>
            ) : (
              <div className="h-64">
                <Bar data={cohortData} options={chartOptions} />
              </div>
            )}
          </Card>

          {/* Top endpoints */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top endpoints by requests</h3>
            {(data?.topEndpoints?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground text-sm">No request data in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-3">Path</th>
                      <th className="pb-3">API</th>
                      <th className="pb-3">Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data?.topEndpoints ?? []).map((e, i) => (
                      <tr key={i} className="text-sm">
                        <td className="py-3 font-mono">{e.path}</td>
                        <td className="py-3">{e.apiName ?? e.apiId}</td>
                        <td className="py-3 font-medium">{e.requests.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Subscriber cohort (by signup month)</h3>
            {cohortData.labels.length === 0 ? (
              <p className="text-muted-foreground text-sm">No cohort data in this period.</p>
            ) : (
              <div className="h-64">
                <Bar data={cohortData} options={chartOptions} />
              </div>
            )}
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top endpoints by requests</h3>
            {(data?.topEndpoints?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground text-sm">No request data in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-3">Path</th>
                      <th className="pb-3">API</th>
                      <th className="pb-3">Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(data?.topEndpoints ?? []).map((e, i) => (
                      <tr key={i} className="text-sm">
                        <td className="py-3 font-mono">{e.path}</td>
                        <td className="py-3">{e.apiName ?? e.apiId}</td>
                        <td className="py-3 font-medium">{e.requests.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Top Subscribers (placeholder – requires backend) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Subscribers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">API Calls (30d)</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { org: 'Acme Corp', plan: 'Enterprise', calls: 245000, revenue: 2499, status: 'active', since: 'Jan 2026' },
                  { org: 'TechStart Inc', plan: 'Pro', calls: 98000, revenue: 499, status: 'active', since: 'Feb 2026' },
                  { org: 'DevTeam LLC', plan: 'Pro', calls: 87000, revenue: 499, status: 'active', since: 'Dec 2025' },
                  { org: 'Cloud Systems', plan: 'Starter', calls: 45000, revenue: 99, status: 'active', since: 'Mar 2026' },
                  { org: 'Data Solutions', plan: 'Enterprise', calls: 198000, revenue: 2499, status: 'active', since: 'Nov 2025' },
                ].map((row, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-3 font-medium">{row.org}</td>
                    <td className="py-3">
                      <Badge variant={row.plan === 'Enterprise' ? 'default' : 'secondary'}>
                        {row.plan}
                      </Badge>
                    </td>
                    <td className="py-3">{row.calls.toLocaleString()}</td>
                    <td className="py-3 font-semibold">${row.revenue}</td>
                    <td className="py-3">
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{row.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
    </div>
  );
}
