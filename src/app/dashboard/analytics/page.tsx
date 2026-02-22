'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { UsageDashboard } from '@/components/features/usage/UsageDashboard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import type { DeveloperAnalytics } from '@/lib/analytics/developer';

export default function DeveloperAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [subscriptionId, setSubscriptionId] = useState('all');
  const [data, setData] = useState<DeveloperAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ range: timeRange, subscription_id: subscriptionId });
      const res = await fetch(`/api/analytics/developer?${params}`);
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
  }, [timeRange, subscriptionId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Developer Analytics"
        description="Monitor your API usage, performance, and costs"
        icon={BarChart3}
        actions={
          <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subscriptionId} onValueChange={setSubscriptionId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subscriptions</SelectItem>
              {(data?.subscriptions ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.api_name}
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
            Export
          </Button>
          </div>
        }
      />

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      {loading && !data && (
        <p className="text-muted-foreground text-sm">Loading analytics…</p>
      )}
      <UsageDashboard data={data ?? undefined} />
    </div>
  );
}
