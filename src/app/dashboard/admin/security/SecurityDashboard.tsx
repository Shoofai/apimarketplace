'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, FileCheck, AlertTriangle, Lock } from 'lucide-react';
import type { SecurityMetrics } from '@/lib/monitoring/security';

const REFRESH_INTERVAL_MS = 30_000;

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/security/metrics', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMetrics(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch security metrics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const { audit, securityEvents, rateLimitViolations } = metrics;

  const formatAction = (action: string) =>
    action.split('.').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Auto-refreshes every 30 seconds.
        </span>
        <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              Audit events (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{audit.last24h.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {audit.last24h.failed} failed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Security events (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{securityEvents.last24h}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityEvents.last7d} in last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Rate limit violations (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rateLimitViolations.last24h}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rateLimitViolations.last7d} in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit log (7d / 30d)</CardTitle>
            <CardDescription>Total and failed events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-semibold">{audit.last7d.total}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
                <p className="text-xs text-destructive">{audit.last7d.failed} failed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{audit.last30d.total}</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
                <p className="text-xs text-destructive">{audit.last30d.failed} failed</p>
              </div>
            </div>
            {Object.keys(audit.last24h.byAction).length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">By action (24h)</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(audit.last24h.byAction).map(([action, count]) => (
                    <Badge key={action} variant="secondary">
                      {formatAction(action)}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security events</CardTitle>
            <CardDescription>By type and severity (24h)</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(securityEvents.byType).length > 0 || Object.keys(securityEvents.bySeverity).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(securityEvents.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span>{type}</span>
                    <span>{count}</span>
                  </div>
                ))}
                {Object.entries(securityEvents.bySeverity).map(([sev, count]) => (
                  <div key={sev} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{sev}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No security events in the last 24h.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recent audit activity
          </CardTitle>
          <CardDescription>Latest 20 audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {audit.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent audit entries.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Action</th>
                    <th className="text-left py-2 font-medium">Resource</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.recent.map((r) => (
                    <tr key={r.id} className="border-b border-muted/50">
                      <td className="py-2">{formatAction(r.action)}</td>
                      <td className="py-2 text-muted-foreground">{r.resource_type}</td>
                      <td className="py-2">
                        <Badge variant={r.status === 'success' ? 'default' : 'destructive'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {(securityEvents.recent.length > 0 || rateLimitViolations.recent.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {securityEvents.recent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent security events</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {securityEvents.recent.slice(0, 10).map((e) => (
                    <li key={e.id} className="flex justify-between">
                      <span>{e.event_type}</span>
                      <Badge variant="outline">{e.severity}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {rateLimitViolations.recent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent rate limit violations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {rateLimitViolations.recent.slice(0, 10).map((r) => (
                    <li key={r.id} className="flex justify-between gap-2">
                      <span className="truncate">{r.endpoint}</span>
                      <span className="text-muted-foreground shrink-0">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
