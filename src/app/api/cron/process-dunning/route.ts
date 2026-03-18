import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { dispatchNotification } from '@/lib/notifications/dispatcher';
import { logger } from '@/lib/utils/logger';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return request.headers.get('x-cron-secret') === secret;
}

/**
 * GET/POST /api/cron/process-dunning
 * Escalates past-due subscriptions through a dunning sequence:
 *   Day 1  – First failed-payment notification (fired by Stripe webhook)
 *   Day 3  – Reminder email (this cron)
 *   Day 7  – Final warning email (this cron)
 *   Day 14 – Cancel subscription + revoke API key (this cron, grace-period end)
 *
 * Runs daily at 08:00 UTC via Vercel Cron.
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

  const { data: pastDueSubs, error } = await admin
    .from('api_subscriptions')
    .select(`
      id,
      organization_id,
      api_id,
      user_id,
      status,
      api:apis(name)
    `)
    .eq('status', 'past_due') as unknown as {
      data: Array<{
        id: string;
        organization_id: string;
        api_id: string;
        user_id: string | null;
        status: string;
        past_due_since: string | null;
        api: { name?: string } | null;
      }> | null;
      error: unknown;
    };

  if (error) {
    logger.error('process-dunning: failed to fetch past_due subscriptions', { error });
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }

  if (!pastDueSubs?.length) {
    return NextResponse.json({ processed: 0, message: 'No past-due subscriptions' });
  }

  let reminded3d = 0;
  let warned7d = 0;
  let cancelled = 0;

  for (const sub of pastDueSubs) {
    const pastDueSince = sub.past_due_since ? new Date(sub.past_due_since) : null;
    if (!pastDueSince || !sub.user_id) continue;

    const daysPastDue = Math.floor((now.getTime() - pastDueSince.getTime()) / (1000 * 60 * 60 * 24));
    const apiName = (sub.api as { name?: string } | null)?.name ?? 'your API';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apimarketplace.pro';

    try {
      if (daysPastDue >= 14) {
        // Grace period expired — cancel subscription and revoke API key
        await admin
          .from('api_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', sub.id);

        // Revoke API key: set revoked_at on associated api_keys
        await admin
          .from('api_keys')
          .update({ revoked_at: now.toISOString() })
          .eq('organization_id', sub.organization_id)
          .is('revoked_at', null);

        await dispatchNotification({
          type: 'billing.payment_failed',
          userId: sub.user_id,
          organizationId: sub.organization_id,
          title: 'Subscription Cancelled – Payment Overdue',
          body: `Your subscription to ${apiName} has been cancelled after 14 days without payment. Please update your payment method and resubscribe to restore access.`,
          link: '/dashboard/settings/billing',
          metadata: { subscription_id: sub.id, days_past_due: daysPastDue, action: 'cancelled' },
        });

        logger.warn('process-dunning: subscription cancelled after grace period', {
          subscriptionId: sub.id,
          daysPastDue,
        });
        cancelled++;
      } else if (daysPastDue >= 7) {
        // Final warning
        await dispatchNotification({
          type: 'billing.payment_failed',
          userId: sub.user_id,
          organizationId: sub.organization_id,
          title: 'Final Warning: Subscription Will Be Cancelled',
          body: `Your subscription to ${apiName} is still unpaid. If payment is not received within 7 days, your subscription will be cancelled and API access revoked. Update your payment method now.`,
          link: '/dashboard/settings/billing',
          metadata: { subscription_id: sub.id, days_past_due: daysPastDue, action: 'final_warning' },
        });
        warned7d++;
      } else if (daysPastDue >= 3) {
        // Second reminder
        await dispatchNotification({
          type: 'billing.payment_failed',
          userId: sub.user_id,
          organizationId: sub.organization_id,
          title: 'Payment Reminder: Action Required',
          body: `Your subscription to ${apiName} has an outstanding payment. Please update your billing details to avoid service interruption.`,
          link: '/dashboard/settings/billing',
          metadata: { subscription_id: sub.id, days_past_due: daysPastDue, action: 'reminder' },
        });
        reminded3d++;
      }
    } catch (err) {
      logger.error('process-dunning: error processing subscription', { subscriptionId: sub.id, error: err });
    }
  }

  logger.info('process-dunning completed', { reminded3d, warned7d, cancelled, total: pastDueSubs.length });
  return NextResponse.json({ reminded3d, warned7d, cancelled, total: pastDueSubs.length });
}
