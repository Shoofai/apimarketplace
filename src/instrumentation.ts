import * as Sentry from '@sentry/nextjs';

/**
 * Ensure the 'branding' storage bucket exists in Supabase.
 * Silently ignores "already exists" errors; logs warnings for other failures.
 */
async function ensureBrandingBucket() {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { error } = await admin.storage.createBucket('branding', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
    });

    if (error && !error.message.includes('already exists')) {
      console.warn('[storage] Failed to create branding bucket:', error.message);
    }
  } catch (err) {
    console.warn(
      '[storage] Could not ensure branding bucket:',
      err instanceof Error ? err.message : String(err)
    );
  }
}

export async function register() {
  const dsn = process.env.SENTRY_DSN;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.request?.data) {
          const data = event.request.data as Record<string, unknown>;
          ['password', 'key', 'secret', 'token', 'api_key'].forEach((field) => {
            if (data[field]) data[field] = '[Redacted]';
          });
        }
        return event;
      },
    });

    // Validate environment variables on startup (Node.js runtime only)
    if (process.env.NODE_ENV === 'production') {
      const { validateRequiredEnvVars } = await import('@/lib/utils/env');
      const { missing, warnings } = validateRequiredEnvVars();

      if (warnings.length > 0) {
        console.warn(
          `[env] Missing optional env vars:\n${warnings.map((w) => `  - ${w}`).join('\n')}`
        );
      }

      if (missing.length > 0) {
        const msg = `[env] Missing required env vars:\n${missing.map((m) => `  - ${m}`).join('\n')}`;
        console.error(msg);
        Sentry.captureMessage(msg, 'error');
      }
    }

    // Ensure required storage buckets exist (Node.js runtime only)
    await ensureBrandingBucket();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 0.1,
    });
  }
}

export async function onRequestError(...args: Parameters<typeof Sentry.captureRequestError>) {
  await Sentry.captureRequestError(...args);
}
