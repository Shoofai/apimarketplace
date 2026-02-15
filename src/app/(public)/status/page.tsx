import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `API Status | ${name}`,
    description: `Current status and health of ${name} platform services.`,
  };
}

async function getHealth() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/health`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data;
  } catch {
    return { status: 'error', services: {}, timestamp: new Date().toISOString() };
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        Operational
      </span>
    );
  }
  if (status === 'disabled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <AlertCircle className="h-4 w-4" />
        Disabled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="h-4 w-4" />
      {status === 'error' ? 'Error' : 'Degraded'}
    </span>
  );
}

export default async function StatusPage() {
  const platformName = await getPlatformName();
  const health = await getHealth();
  const services = health.services || {};
  const overallStatus = health.status || 'unknown';

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="API Status"
        subtitle={`Current status of ${platformName} platform services. This page updates automatically.`}
      />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="not-prose my-8">
            <div className={`rounded-xl border-2 p-6 ${
              overallStatus === 'ok'
                ? 'border-green-500/30 bg-green-500/5 dark:bg-green-500/10'
                : overallStatus === 'error'
                ? 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10'
                : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={overallStatus} />
                <span className="text-sm text-muted-foreground">
                  Last updated: {health.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}
                </span>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Core platform</h2>
            <ul className="space-y-3">
              <li className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <span className="font-medium text-foreground">Database</span>
                <StatusBadge status={services.database?.status || 'unknown'} />
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <span className="font-medium text-foreground">Cache (Redis)</span>
                <StatusBadge status={services.redis?.status || 'unknown'} />
              </li>
            </ul>
            {services.kong !== undefined && (
              <>
                <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Gateway</h2>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                    <span className="font-medium text-foreground">API Gateway</span>
                    <StatusBadge status={services.kong?.status || 'unknown'} />
                  </li>
                </ul>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            If you experience issues not reflected here, please{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
