/**
 * Returns the site URL, throwing in production if NEXT_PUBLIC_SITE_URL is not set.
 * Prevents localhost fallbacks from leaking into Stripe redirects, emails, etc.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is required in production. Set it in your Vercel environment variables.'
    );
  }

  // Local dev fallback
  return 'http://localhost:3020';
}

/**
 * Returns the Kong Admin URL, throwing if KONG_ADMIN_URL is not set when Kong is enabled.
 */
export function getKongAdminUrl(): string {
  const url = process.env.KONG_ADMIN_URL;
  if (url) return url;

  if (process.env.ENABLE_KONG === 'true') {
    throw new Error(
      'KONG_ADMIN_URL is required when ENABLE_KONG is true. Set it in your environment variables.'
    );
  }

  // Dev fallback (Kong disabled)
  return 'http://localhost:8001';
}

/**
 * Returns the Kong Proxy URL, throwing if KONG_PROXY_URL is not set when Kong is enabled.
 */
export function getKongProxyUrl(): string {
  const url = process.env.KONG_PROXY_URL;
  if (url) return url;

  if (process.env.ENABLE_KONG === 'true') {
    throw new Error(
      'KONG_PROXY_URL is required when ENABLE_KONG is true. Set it in your environment variables.'
    );
  }

  // Dev fallback (Kong disabled)
  return 'http://localhost:8000';
}

/**
 * Validates that all required environment variables are set.
 * Call during server startup (instrumentation.ts) for fail-fast behavior.
 */
export function validateRequiredEnvVars(): { missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Always required in production
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];

  // Required for billing
  const billing = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  // Required for cron jobs
  const cron = ['CRON_SECRET'];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of billing) {
    if (!process.env[key]) warnings.push(`${key} (billing will not work)`);
  }

  for (const key of cron) {
    if (!process.env[key]) warnings.push(`${key} (cron jobs unprotected)`);
  }

  if (process.env.ENABLE_KONG === 'true') {
    if (!process.env.KONG_ADMIN_URL) missing.push('KONG_ADMIN_URL (ENABLE_KONG is true)');
    if (!process.env.KONG_PROXY_URL) missing.push('KONG_PROXY_URL (ENABLE_KONG is true)');
  }

  if (!process.env.SENTRY_DSN) warnings.push('SENTRY_DSN (error monitoring disabled)');
  if (!process.env.RESEND_API_KEY) warnings.push('RESEND_API_KEY (emails will not send)');

  return { missing, warnings };
}
