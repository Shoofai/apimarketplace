'use client';

import { useState, useEffect, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { ProviderAnalytics } from '@/lib/analytics/provider';

const CHART_COLORS = [
  'rgba(156, 163, 175, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(99, 102, 241, 0.8)',
  'rgba(168, 85, 247, 0.8)',
];

interface ProviderApiAnalyticsTabProps {
  apiId: string;
}

export function ProviderApiAnalyticsTab({ apiId }: ProviderApiAnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState('30d');
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
    },
  };

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading analytics…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardDescription>Revenue and subscriber metrics for this API</CardDescription>
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
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <Bar data={subscribersData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {planDistribution.labels.length === 0 ? (
              <p className="text-muted-foreground text-sm">No plan data in this period.</p>
            ) : (
              <div className="h-56">
                <Doughnut data={planDistribution} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data?.topEndpoints && data.topEndpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints by Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-3">Path</th>
                    <th className="pb-3">Requests</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.topEndpoints.map((e, i) => (
                    <tr key={i}>
                      <td className="py-3 font-mono">{e.path}</td>
                      <td className="py-3 font-medium">{e.requests.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
