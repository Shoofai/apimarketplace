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

const TIMEOUT_MS = 10_000;
const DEGRADED_THRESHOLD_MS = 3_000;

/**
 * GET/POST /api/cron/check-api-health
 * Pings the base URL of each published API and records uptime.
 * Dispatches notifications when an API becomes unreachable or degrades.
 * Runs every 5 minutes via Vercel Cron.
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
  const now = new Date().toISOString();

  const { data: apis, error } = await admin
    .from('apis')
    .select('id, name, base_url, organization_id')
    .eq('status', 'published')
    .not('base_url', 'is', null);

  if (error) {
    logger.error('check-api-health: failed to fetch APIs', { error });
    return NextResponse.json({ error: 'Failed to fetch APIs' }, { status: 500 });
  }

  if (!apis?.length) {
    return NextResponse.json({ checked: 0, message: 'No published APIs with base_url' });
  }

  let healthy = 0;
  let degraded = 0;
  let down = 0;

  for (const api of apis) {
    if (!api.base_url) continue;

    const start = Date.now();
    let status: 'healthy' | 'degraded' | 'down' = 'down';
    let statusCode: number | null = null;
    let responseMs: number | null = null;
    let errorMessage: string | null = null;

    try {
      const response = await fetch(api.base_url, {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'User-Agent': 'APIMarketplace-HealthCheck/1.0' },
      });

      responseMs = Date.now() - start;
      statusCode = response.status;

      if (response.ok || response.status < 500) {
        status = responseMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'healthy';
      } else {
        status = 'down';
        errorMessage = `HTTP ${response.status}`;
      }
    } catch (err: any) {
      responseMs = Date.now() - start;
      status = 'down';
      errorMessage = err?.message ?? 'Request failed';
    }

    // Record in api_health_checks table
    void admin
      .from('api_health_checks')
      .insert({
        api_id: api.id,
        is_healthy: status === 'healthy',
        status_code: statusCode,
        response_time_ms: responseMs,
        error_message: errorMessage,
        checked_at: now,
      });

    // Notify provider organization on degradation or outage
    if (status !== 'healthy') {
      try {
        const { data: orgMembers } = await admin
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', api.organization_id)
          .in('role', ['owner', 'admin']);

        for (const member of orgMembers ?? []) {
          await dispatchNotification({
            type: 'api.status_changed',
            userId: member.user_id,
            organizationId: api.organization_id,
            title: status === 'down' ? `${api.name} is unreachable` : `${api.name} is responding slowly`,
            body:
              status === 'down'
                ? `Health check failed for ${api.name} (${api.base_url}). Error: ${errorMessage ?? 'timeout'}.`
                : `${api.name} responded in ${responseMs}ms, which exceeds the ${DEGRADED_THRESHOLD_MS}ms threshold.`,
            link: `/dashboard/provider/apis`,
            metadata: { api_id: api.id, status, response_ms: responseMs, error: errorMessage },
          }).catch(() => {}); // Non-fatal
        }
      } catch (notifyErr) {
        logger.warn('check-api-health: notification failed', { apiId: api.id, error: notifyErr });
      }
    }

    if (status === 'healthy') healthy++;
    else if (status === 'degraded') degraded++;
    else down++;
  }

  logger.info('check-api-health completed', { healthy, degraded, down, total: apis.length });
  return NextResponse.json({ healthy, degraded, down, total: apis.length });
}
