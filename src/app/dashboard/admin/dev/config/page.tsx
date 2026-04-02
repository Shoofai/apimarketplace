import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileCode2 } from 'lucide-react';
import { EnvCopyCard } from './EnvCopyCard';

// Helper: read an env var value (public only shown to client; secrets blanked)
function pub(key: string) {
  return { key, value: process.env[key] ?? '', secret: false };
}
function secret(key: string) {
  return { key, value: '', secret: true };
}

export default async function AdminEnvConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) redirect('/dashboard');

  const sections = [
    {
      comment: '# Supabase',
      vars: [
        pub('NEXT_PUBLIC_SUPABASE_URL'),
        pub('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        secret('SUPABASE_SERVICE_ROLE_KEY'),
        pub('NEXT_PUBLIC_SITE_URL'),
        secret('SUPABASE_URL'),
      ],
    },
    {
      comment: '# Kong (API Gateway)',
      vars: [
        secret('KONG_ADMIN_URL'),
        secret('KONG_PROXY_URL'),
        pub('ENABLE_KONG'),
      ],
    },
    {
      comment: '# Stripe',
      vars: [
        secret('STRIPE_SECRET_KEY'),
        secret('STRIPE_PUBLISHABLE_KEY'),
        pub('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
        secret('STRIPE_WEBHOOK_SECRET'),
        pub('ENABLE_BILLING'),
      ],
    },
    {
      comment: '# AI / Anthropic',
      vars: [
        secret('ANTHROPIC_API_KEY'),
        pub('ENABLE_AI_PLAYGROUND'),
        pub('ENABLE_WORKFLOWS'),
      ],
    },
    {
      comment: '# Redis / Caching',
      vars: [
        secret('REDIS_URL'),
        pub('ENABLE_CACHING'),
      ],
    },
    {
      comment: '# GitHub OAuth',
      vars: [
        secret('GITHUB_CLIENT_ID'),
        secret('GITHUB_CLIENT_SECRET'),
      ],
    },
    {
      comment: '# Email (Resend)',
      vars: [
        secret('RESEND_API_KEY'),
        secret('EMAIL_FROM'),
      ],
    },
    {
      comment: '# Sentry',
      vars: [
        secret('SENTRY_DSN'),
        secret('SENTRY_ORG'),
        secret('SENTRY_PROJECT'),
        secret('SENTRY_AUTH_TOKEN'),
      ],
    },
    {
      comment: '# Platform / UI',
      vars: [
        pub('NEXT_PUBLIC_LANDING_GRADIENT_BANDS'),
        secret('APIMP_KEY'),
        secret('CRON_SECRET'),
        secret('API_REQUESTS_LOG_RETENTION_MONTHS'),
        secret('VALIDATION_CONTEXT_PATH'),
      ],
    },
    {
      comment: '# Build / CI',
      vars: [
        pub('NODE_ENV'),
        pub('ANALYZE'),
        pub('CI'),
        pub('BASE_URL'),
      ],
    },
    {
      comment: '# Testing',
      vars: [
        secret('TEST_USER_EMAIL'),
        secret('TEST_USER_PASSWORD'),
        secret('TEST_ADMIN_EMAIL'),
        secret('TEST_ADMIN_PASSWORD'),
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileCode2 className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Environment Config</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Copy or download a <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.env</code> template.
            Public values are pre-filled; secrets are left blank for security.
          </p>
        </div>
      </div>

      <EnvCopyCard sections={sections} />
    </div>
  );
}
