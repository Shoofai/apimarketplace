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
 * GET/POST /api/cron/notify-expiring-keys
 * Notifies users whose API keys expire within 7 days.
 * Runs daily at 09:00 UTC via Vercel Cron.
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
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: expiringKeys, error } = await admin
    .from('api_keys')
    .select('id, name, user_id, organization_id, expires_at')
    .is('revoked_at', null)
    .not('expires_at', 'is', null)
    .lte('expires_at', in7Days.toISOString())
    .gte('expires_at', now.toISOString());

  if (error) {
    logger.error('notify-expiring-keys: failed to fetch keys', { error });
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }

  if (!expiringKeys?.length) {
    return NextResponse.json({ notified: 0, message: 'No keys expiring within 7 days' });
  }

  let notified = 0;

  for (const key of expiringKeys) {
    if (!key.user_id) continue;

    try {
      const expiresAt = new Date(key.expires_at!);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const keyName = key.name ?? 'API Key';

      await dispatchNotification({
        type: 'system.feature_released',
        userId: key.user_id,
        organizationId: key.organization_id,
        title: `API Key Expiring Soon: ${keyName}`,
        body: `Your API key "${keyName}" expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'} on ${expiresAt.toLocaleDateString()}. Rotate or extend it to avoid service disruption.`,
        link: '/dashboard/settings/api-keys',
        metadata: { api_key_id: key.id, expires_at: key.expires_at, days_left: daysLeft },
      });
      notified++;
    } catch (err) {
      logger.error('notify-expiring-keys: notification failed', { keyId: key.id, error: err });
    }
  }

  logger.info('notify-expiring-keys completed', { notified, total: expiringKeys.length });
  return NextResponse.json({ notified, total: expiringKeys.length });
}
