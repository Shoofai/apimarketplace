'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  CreditCard,
  Mail,
  Globe,
  Shield,
  Activity,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Minus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Plug,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EnvVar {
  name: string;
  configured: boolean;
  masked?: string;
}

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  envVars: EnvVar[];
  status: 'connected' | 'not_configured' | 'error' | 'partial';
  required: boolean;
  docsUrl?: string;
}

interface Summary {
  total: number;
  connected: number;
  partial: number;
  notConfigured: number;
  requiredMissing: number;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  database: { label: 'Database & Auth', icon: Database },
  payments: { label: 'Payments & Billing', icon: CreditCard },
  ai: { label: 'AI Services', icon: Brain },
  gateway: { label: 'API Gateway', icon: Globe },
  email: { label: 'Email', icon: Mail },
  auth: { label: 'Authentication', icon: Shield },
  monitoring: { label: 'Monitoring & Ops', icon: Activity },
};

const STATUS_CONFIG = {
  connected: { label: 'Connected', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
  not_configured: { label: 'Not Configured', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Minus },
  error: { label: 'Error', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

function StatusBadge({ status }: { status: Integration['status'] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function IntegrationCard({ integration, onTest }: { integration: Integration; onTest: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    await onTest(integration.id);
    setTesting(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{integration.name}</h4>
            {integration.required && (
              <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                Required
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{integration.description}</p>
        </div>
        <StatusBadge status={integration.status} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          {integration.envVars.length} env variable{integration.envVars.length > 1 ? 's' : ''}
        </button>
        <div className="flex-1" />
        {integration.docsUrl && (
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Docs <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {integration.status === 'connected' && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            onClick={handleTest}
            disabled={testing}
          >
            <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test'}
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-1.5 rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
          {integration.envVars.map((envVar) => (
            <div key={envVar.name} className="flex items-center justify-between gap-2">
              <code className="text-xs text-gray-600 dark:text-gray-300">{envVar.name}</code>
              <div className="flex items-center gap-2">
                {envVar.configured ? (
                  <>
                    <code className="text-xs text-gray-400 dark:text-gray-500">{envVar.masked}</code>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Not set</span>
                    <XCircle className="h-3.5 w-3.5 text-gray-400" />
                  </>
                )}
              </div>
            </div>
          ))}
          <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
            Set these in your Vercel dashboard or .env.local file
          </p>
        </div>
      )}
    </div>
  );
}

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/integrations/status');
      if (!res.ok) throw new Error('Failed to fetch integration status');
      const data = await res.json();
      setIntegrations(data.integrations);
      setSummary(data.summary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleTest = async (id: string) => {
    // For now, just refresh the status
    await fetchStatus();
  };

  // Group by category
  const grouped = integrations.reduce<Record<string, Integration[]>>((acc, integration) => {
    const cat = integration.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(integration);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integration Hub</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading integration status...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integration Hub</h1>
        </div>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center gap-3 p-6">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">Failed to load integrations</p>
              <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={fetchStatus}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integration Hub</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage third-party services and monitor connection health
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStatus} className="gap-1.5">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
              <p className="text-xs text-gray-400">integrations</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800/50">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Connected</p>
              <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">{summary.connected}</p>
              <p className="text-xs text-green-500">fully configured</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-800/50">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Partial</p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">{summary.partial}</p>
              <p className="text-xs text-amber-500">missing some keys</p>
            </CardContent>
          </Card>
          <Card className={summary.requiredMissing > 0 ? 'border-red-200 dark:border-red-800/50' : ''}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Not Configured</p>
              <p className="mt-1 text-2xl font-bold text-gray-700 dark:text-gray-300">{summary.notConfigured}</p>
              {summary.requiredMissing > 0 ? (
                <p className="text-xs font-medium text-red-500">{summary.requiredMissing} required!</p>
              ) : (
                <p className="text-xs text-gray-400">optional services</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* How to configure */}
      <Card className="border-primary-200 bg-primary-50/50 dark:border-primary-800/50 dark:bg-primary-900/10">
        <CardContent className="flex items-start gap-3 p-4">
          <Settings className="mt-0.5 h-5 w-5 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-sm font-medium text-primary-900 dark:text-primary-300">
              How to configure integrations
            </p>
            <p className="mt-1 text-xs text-primary-700 dark:text-primary-400">
              API keys and secrets are managed via environment variables for security. Set them in your{' '}
              <code className="rounded bg-primary-100 px-1 py-0.5 text-[11px] dark:bg-primary-900/30">
                .env.local
              </code>{' '}
              file for development, or in your Vercel project settings for production.
              Values shown below are masked — only the first and last 4 characters are visible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Groups */}
      {Object.entries(grouped).map(([category, items]) => {
        const meta = CATEGORY_META[category] || { label: category, icon: Plug };
        const CategoryIcon = meta.icon;
        const connectedCount = items.filter((i) => i.status === 'connected').length;
        return (
          <div key={category}>
            <div className="mb-3 flex items-center gap-2">
              <CategoryIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {meta.label}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {connectedCount}/{items.length} connected
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onTest={handleTest}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
