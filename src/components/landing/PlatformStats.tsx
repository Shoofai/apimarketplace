import { createClient } from '@/lib/supabase/server';
import { Activity, Building2, Code2, Users } from 'lucide-react';

async function fetchStats() {
  const supabase = await createClient();
  const [apisResult, orgsResult, requestsResult, usersResult] = await Promise.all([
    supabase.from('apis').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('api_requests_log').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ]);
  return {
    apis: apisResult.count ?? 0,
    orgs: orgsResult.count ?? 0,
    requests: requestsResult.count ?? 0,
    users: usersResult.count ?? 0,
  };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return n > 0 ? `${n}+` : '—';
}

export default async function PlatformStats() {
  const stats = await fetchStats();

  const items = [
    { icon: Code2, label: 'Published APIs', value: formatCount(stats.apis), color: 'text-primary-600 dark:text-primary-400' },
    { icon: Building2, label: 'Organizations', value: formatCount(stats.orgs), color: 'text-violet-600 dark:text-violet-400' },
    { icon: Activity, label: 'API Calls Logged', value: formatCount(stats.requests), color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Users, label: 'Developers', value: formatCount(stats.users), color: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <section className="bg-white py-20 dark:bg-gray-950 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-heading mb-4 text-gray-900 dark:text-white">
            Built for how teams ship today
          </h2>
          <p className="section-subheading mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            One platform for API discovery, integration, and monetization — for indie APIs and scaling teams.
          </p>
        </div>

        {/* Live platform metrics */}
        <div className="mb-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-8 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <Icon className={`mb-3 h-7 w-7 ${color}`} />
              <div className={`text-4xl font-black ${color}`}>{value}</div>
              <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Capability pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Stripe Connect', 'OpenAPI → Docs', 'Usage-based billing', 'AI Code Generation', 'Built to scale'].map((label) => (
            <span
              key={label}
              className="rounded-full border border-primary-200 bg-primary-50 px-5 py-2 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
