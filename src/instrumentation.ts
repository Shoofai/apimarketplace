import * as Sentry from '@sentry/nextjs';

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
