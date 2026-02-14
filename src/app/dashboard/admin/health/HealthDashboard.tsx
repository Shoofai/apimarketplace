'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Server, HardDrive, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type ServiceStatus = 'ok' | 'error' | 'disabled';

type HealthData = {
  status: string;
  timestamp: string;
  version?: string;
  services: {
    database?: { status: ServiceStatus; responseTime?: number; error?: string };
    redis?: { status: ServiceStatus; responseTime?: number; error?: string };
    kong?: { status: ServiceStatus; responseTime?: number; error?: string };
  };
};

const REFRESH_INTERVAL_MS = 30_000;

export function HealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch health');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (loading && !health) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !health) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchHealth}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = health?.status ?? 'unknown';
  const services = health?.services ?? {};

  const ServiceCard = ({
    name,
    data,
    icon: Icon,
  }: {
    name: string;
    data: { status: ServiceStatus; responseTime?: number; error?: string } | undefined;
    icon: React.ElementType;
  }) => {
    if (!data) return null;
    const isOk = data.status === 'ok';
    const isDisabled = data.status === 'disabled';
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {name}
          </CardTitle>
          {isOk && <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> OK</Badge>}
          {isDisabled && <Badge variant="secondary">Disabled</Badge>}
          {data.status === 'error' && <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Error</Badge>}
        </CardHeader>
        <CardContent>
          {data.responseTime != null && (
            <p className="text-xs text-muted-foreground">
              Response: {data.responseTime}ms
            </p>
          )}
          {data.error && (
            <p className="text-xs text-destructive mt-1">{data.error}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant={overallStatus === 'ok' ? 'default' : 'destructive'}
            className="text-sm"
          >
            {overallStatus === 'ok' ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> System OK</>
            ) : (
              <><AlertCircle className="h-3 w-3 mr-1" /> Degraded</>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}
          </span>
          {health?.version && (
            <span className="text-xs text-muted-foreground">v{health.version}</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ServiceCard name="Database" data={services.database} icon={Database} />
        <ServiceCard name="Redis" data={services.redis} icon={HardDrive} />
        <ServiceCard name="Kong Gateway" data={services.kong} icon={Server} />
      </div>

      <p className="text-xs text-muted-foreground">
        Auto-refreshes every 30 seconds.
      </p>
    </div>
  );
}
