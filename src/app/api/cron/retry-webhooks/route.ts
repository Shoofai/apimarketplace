import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return request.headers.get('x-cron-secret') === secret;
}

const MAX_ATTEMPTS = 5;

/**
 * GET/POST /api/cron/retry-webhooks
 * Retries failed webhook deliveries with exponential backoff.
 * Runs every 10 minutes via Vercel Cron.
 *
 * Backoff schedule (based on attempts so far):
 *   1 attempt  → retry after  2 min
 *   2 attempts → retry after  8 min
 *   3 attempts → retry after 32 min
 *   4 attempts → retry after  2 hr
 *   5+ attempts → permanently_failed
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runProcess();
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runProcess();
}

async function runProcess() {
  const admin = createAdminClient();
  const now = new Date();

  const { data: deliveries, error } = await admin
    .from('webhook_deliveries')
    .select(`
      id,
      webhook_endpoint_id,
      event_type,
      payload,
      attempts,
      next_retry_at,
      webhook_endpoint:webhook_endpoints(url, secret_hash, is_active)
    `)
    .eq('status', 'failed')
    .lt('attempts', MAX_ATTEMPTS)
    .or(`next_retry_at.is.null,next_retry_at.lte.${now.toISOString()}`) as unknown as {
      data: Array<{
        id: string;
        webhook_endpoint_id: string;
        event_type: string;
        payload: unknown;
        attempts: number | null;
        next_retry_at: string | null;
        webhook_endpoint: { url?: string; secret_hash?: string; is_active?: boolean } | null;
      }> | null;
      error: unknown;
    };

  if (error) {
    logger.error('retry-webhooks: failed to fetch deliveries', { error });
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }

  if (!deliveries?.length) {
    return NextResponse.json({ retried: 0, message: 'No deliveries due for retry' });
  }

  let retried = 0;
  let permanentlyFailed = 0;

  for (const delivery of deliveries) {
    const endpoint = delivery.webhook_endpoint as { url?: string; is_active?: boolean } | null;

    if (!endpoint?.url || endpoint.is_active === false) {
      await admin
        .from('webhook_deliveries')
        .update({ status: 'permanently_failed' })
        .eq('id', delivery.id);
      permanentlyFailed++;
      continue;
    }

    const attemptNum = (delivery.attempts ?? 0) + 1;

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': delivery.event_type,
          'X-Webhook-Delivery': delivery.id,
        },
        body: JSON.stringify(delivery.payload),
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        await admin
          .from('webhook_deliveries')
          .update({
            status: 'delivered',
            attempts: attemptNum,
            delivered_at: now.toISOString(),
          })
          .eq('id', delivery.id);
        retried++;
      } else {
        await scheduleRetry(admin, delivery.id, attemptNum);
      }
    } catch (err) {
      logger.warn('retry-webhooks: delivery attempt failed', { deliveryId: delivery.id, error: err });
      await scheduleRetry(admin, delivery.id, attemptNum);
    }
  }

  logger.info('retry-webhooks completed', { retried, permanentlyFailed, total: deliveries.length });
  return NextResponse.json({ retried, permanentlyFailed, total: deliveries.length });
}

async function scheduleRetry(
  admin: ReturnType<typeof createAdminClient>,
  deliveryId: string,
  attemptNum: number
) {
  if (attemptNum >= MAX_ATTEMPTS) {
    await admin
      .from('webhook_deliveries')
      .update({ status: 'permanently_failed', attempts: attemptNum })
      .eq('id', deliveryId);
    return;
  }

  // Exponential backoff: 2^(attempts) minutes, capped at 2 hours
  const backoffMinutes = Math.min(Math.pow(2, attemptNum + 1), 120);
  const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);

  await admin
    .from('webhook_deliveries')
    .update({
      status: 'failed',
      attempts: attemptNum,
      next_retry_at: nextRetry.toISOString(),
    })
    .eq('id', deliveryId);
}
