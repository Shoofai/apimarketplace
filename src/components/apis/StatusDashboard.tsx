'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

interface StatusData {
  api_id: string;
  status: 'operational' | 'degraded' | 'down';
  uptime_7d: number;
  uptime_30d: number;
  avg_latency_ms_7d: number | null;
  incidents: Array<{
    id: string;
    severity: string;
    title: string;
    description: string | null;
    status: string;
    started_at: string;
    resolved_at: string | null;
  }>;
}

interface StatusDashboardProps {
  apiId: string;
  apiName: string;
}

export function StatusDashboard({ apiId, apiName }: StatusDashboardProps) {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/apis/${apiId}/status`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [apiId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading status…
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Status data unavailable.
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    operational: { label: 'Operational', icon: CheckCircle2, className: 'text-green-600' },
    degraded: { label: 'Degraded', icon: AlertCircle, className: 'text-amber-600' },
    down: { label: 'Outage', icon: XCircle, className: 'text-red-600' },
  };
  const config = statusConfig[data.status] ?? statusConfig.operational;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.className}`} />
            Current status: {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Uptime (7d)</div>
              <div className="text-2xl font-bold">{data.uptime_7d}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Uptime (30d)</div>
              <div className="text-2xl font-bold">{data.uptime_30d}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg latency (7d)</div>
              <div className="text-2xl font-bold">
                {data.avg_latency_ms_7d != null ? `${data.avg_latency_ms_7d} ms` : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident history (last 90 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.incidents.length === 0 ? (
            <p className="text-muted-foreground">No incidents reported.</p>
          ) : (
            <ul className="space-y-4">
              {data.incidents.map((inc) => (
                <li key={inc.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{inc.title}</div>
                      {inc.description && (
                        <p className="text-sm text-muted-foreground mt-1">{inc.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{inc.severity}</Badge>
                        <Badge variant={inc.status === 'resolved' ? 'secondary' : 'default'}>
                          {inc.status}
                        </Badge>
                        <span>
                          <Clock className="inline h-3 w-3 mr-0.5" />
                          {new Date(inc.started_at).toLocaleString()}
                          {inc.resolved_at && ` – Resolved ${new Date(inc.resolved_at).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
