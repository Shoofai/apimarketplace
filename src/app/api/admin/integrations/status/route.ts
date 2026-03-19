import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface IntegrationStatus {
  id: string;
  name: string;
  category: 'ai' | 'payments' | 'email' | 'gateway' | 'auth' | 'monitoring' | 'database';
  description: string;
  envVars: { name: string; configured: boolean; masked?: string }[];
  status: 'connected' | 'not_configured' | 'error' | 'partial';
  required: boolean;
  docsUrl?: string;
}

function isSet(envVar: string | undefined): boolean {
  return !!envVar && envVar.trim().length > 0;
}

function maskValue(envVar: string | undefined): string | undefined {
  if (!envVar || envVar.trim().length === 0) return undefined;
  if (envVar.length <= 8) return '••••••••';
  return envVar.slice(0, 4) + '••••' + envVar.slice(-4);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const integrations: IntegrationStatus[] = [
    {
      id: 'supabase',
      name: 'Supabase',
      category: 'database',
      description: 'PostgreSQL database, authentication, and realtime subscriptions',
      required: true,
      docsUrl: 'https://supabase.com/docs',
      envVars: [
        { name: 'NEXT_PUBLIC_SUPABASE_URL', configured: isSet(process.env.NEXT_PUBLIC_SUPABASE_URL), masked: maskValue(process.env.NEXT_PUBLIC_SUPABASE_URL) },
        { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', configured: isSet(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), masked: maskValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
        { name: 'SUPABASE_SERVICE_ROLE_KEY', configured: isSet(process.env.SUPABASE_SERVICE_ROLE_KEY), masked: maskValue(process.env.SUPABASE_SERVICE_ROLE_KEY) },
      ],
      status: 'not_configured',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      description: 'Payment processing, subscriptions, and usage-based billing via Stripe Connect',
      required: false,
      docsUrl: 'https://stripe.com/docs',
      envVars: [
        { name: 'STRIPE_SECRET_KEY', configured: isSet(process.env.STRIPE_SECRET_KEY), masked: maskValue(process.env.STRIPE_SECRET_KEY) },
        { name: 'STRIPE_WEBHOOK_SECRET', configured: isSet(process.env.STRIPE_WEBHOOK_SECRET), masked: maskValue(process.env.STRIPE_WEBHOOK_SECRET) },
        { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', configured: isSet(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY), masked: maskValue(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) },
      ],
      status: 'not_configured',
    },
    {
      id: 'anthropic',
      name: 'Claude AI (Anthropic)',
      category: 'ai',
      description: 'AI code generation, explanations, and debugging in the playground',
      required: false,
      docsUrl: 'https://docs.anthropic.com',
      envVars: [
        { name: 'ANTHROPIC_API_KEY', configured: isSet(process.env.ANTHROPIC_API_KEY), masked: maskValue(process.env.ANTHROPIC_API_KEY) },
      ],
      status: 'not_configured',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      description: 'Semantic search embeddings and AI-powered API discovery',
      required: false,
      docsUrl: 'https://platform.openai.com/docs',
      envVars: [
        { name: 'OPENAI_API_KEY', configured: isSet(process.env.OPENAI_API_KEY), masked: maskValue(process.env.OPENAI_API_KEY) },
      ],
      status: 'not_configured',
    },
    {
      id: 'kong',
      name: 'Kong API Gateway',
      category: 'gateway',
      description: 'API gateway for routing, rate limiting, and authentication',
      required: false,
      docsUrl: 'https://docs.konghq.com',
      envVars: [
        { name: 'KONG_ADMIN_URL', configured: isSet(process.env.KONG_ADMIN_URL), masked: maskValue(process.env.KONG_ADMIN_URL) },
        { name: 'KONG_PROXY_URL', configured: isSet(process.env.KONG_PROXY_URL), masked: maskValue(process.env.KONG_PROXY_URL) },
        { name: 'ENABLE_KONG', configured: isSet(process.env.ENABLE_KONG), masked: process.env.ENABLE_KONG || undefined },
      ],
      status: 'not_configured',
    },
    {
      id: 'resend',
      name: 'Resend',
      category: 'email',
      description: 'Transactional email delivery for notifications, onboarding, and alerts',
      required: false,
      docsUrl: 'https://resend.com/docs',
      envVars: [
        { name: 'RESEND_API_KEY', configured: isSet(process.env.RESEND_API_KEY), masked: maskValue(process.env.RESEND_API_KEY) },
        { name: 'RESEND_WEBHOOK_SECRET', configured: isSet(process.env.RESEND_WEBHOOK_SECRET), masked: maskValue(process.env.RESEND_WEBHOOK_SECRET) },
      ],
      status: 'not_configured',
    },
    {
      id: 'github',
      name: 'GitHub OAuth',
      category: 'auth',
      description: 'GitHub social login for developer authentication',
      required: false,
      docsUrl: 'https://docs.github.com/en/apps/oauth-apps',
      envVars: [
        { name: 'GITHUB_CLIENT_ID', configured: isSet(process.env.GITHUB_CLIENT_ID), masked: maskValue(process.env.GITHUB_CLIENT_ID) },
        { name: 'GITHUB_CLIENT_SECRET', configured: isSet(process.env.GITHUB_CLIENT_SECRET), masked: maskValue(process.env.GITHUB_CLIENT_SECRET) },
      ],
      status: 'not_configured',
    },
    {
      id: 'sentry',
      name: 'Sentry',
      category: 'monitoring',
      description: 'Error tracking, performance monitoring, and crash reporting',
      required: false,
      docsUrl: 'https://docs.sentry.io',
      envVars: [
        { name: 'SENTRY_DSN', configured: isSet(process.env.SENTRY_DSN), masked: maskValue(process.env.SENTRY_DSN) },
        { name: 'SENTRY_AUTH_TOKEN', configured: isSet(process.env.SENTRY_AUTH_TOKEN), masked: maskValue(process.env.SENTRY_AUTH_TOKEN) },
      ],
      status: 'not_configured',
    },
    {
      id: 'cron',
      name: 'Cron Jobs',
      category: 'monitoring',
      description: 'Scheduled background tasks for analytics, cleanup, and notifications',
      required: false,
      envVars: [
        { name: 'CRON_SECRET', configured: isSet(process.env.CRON_SECRET), masked: maskValue(process.env.CRON_SECRET) },
      ],
      status: 'not_configured',
    },
  ];

  // Compute status for each integration
  for (const integration of integrations) {
    const allConfigured = integration.envVars.every((v) => v.configured);
    const someConfigured = integration.envVars.some((v) => v.configured);

    if (allConfigured) {
      integration.status = 'connected';
    } else if (someConfigured) {
      integration.status = 'partial';
    } else {
      integration.status = 'not_configured';
    }
  }

  // Summary stats
  const summary = {
    total: integrations.length,
    connected: integrations.filter((i) => i.status === 'connected').length,
    partial: integrations.filter((i) => i.status === 'partial').length,
    notConfigured: integrations.filter((i) => i.status === 'not_configured').length,
    requiredMissing: integrations.filter((i) => i.required && i.status !== 'connected').length,
  };

  return NextResponse.json({ integrations, summary });
}
