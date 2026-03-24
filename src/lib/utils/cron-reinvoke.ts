import { logger } from '@/lib/utils/logger';

/**
 * If a cron job returns hasMore: true, schedule a follow-up invocation.
 * Uses fetch to call the same endpoint again after a short delay.
 *
 * This is a simple self-invocation pattern for Vercel cron jobs
 * that need to process more records than fit in one function timeout.
 */
export async function reinvokeIfNeeded(
  hasMore: boolean,
  endpoint: string,
  cronSecret: string,
  delayMs: number = 1000
): Promise<void> {
  if (!hasMore) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    logger.warn('Cannot reinvoke cron: NEXT_PUBLIC_SITE_URL not set');
    return;
  }

  // Fire-and-forget with logging (not silent)
  setTimeout(async () => {
    try {
      const res = await fetch(`${siteUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      });
      logger.info('Cron re-invocation sent', { endpoint, status: res.status });
    } catch (err) {
      logger.error('Cron re-invocation failed', {
        endpoint,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }, delayMs);
}
