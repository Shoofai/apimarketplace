import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { dispatchNotification } from '@/lib/notifications/dispatcher';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return request.headers.get('x-cron-secret') === secret;
}

/**
 * GET/POST /api/cron/compute-sla
 * Runs every 15 minutes. For each active SLA definition:
 *  1. Aggregates api_requests_log for the measurement window
 *  2. Writes a sla_measurements row
 *  3. Detects breaches and inserts sla_violations
 *  4. Notifies the API owner on new violations
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runSLACompute();
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runSLACompute();
}

async function runSLACompute() {
  const admin = createAdminClient();
  const windowEnd = new Date();
  let processed = 0;
  let violations = 0;

  const { data: definitions, error: defErr } = await admin
    .from('sla_definitions')
    .select('*, apis(id, name, organization_id)')
    .eq('is_active', true);

  if (defErr) {
    logger.error('compute-sla: failed to fetch definitions', { defErr });
    return NextResponse.json({ error: defErr.message }, { status: 500 });
  }

  for (const def of definitions ?? []) {
    try {
      const windowMinutes = def.measurement_window === '1h' ? 60
        : def.measurement_window === '6h' ? 360
        : def.measurement_window === '24h' ? 1440
        : 60; // default 1h

      const windowStart = new Date(windowEnd.getTime() - windowMinutes * 60 * 1000);

      // Aggregate requests in this window
      const { data: reqs } = await admin
        .from('api_requests_log')
        .select('status_code, latency_ms')
        .eq('api_id', def.api_id)
        .gte('created_at', windowStart.toISOString())
        .lt('created_at', windowEnd.toISOString())
        .limit(50000);

      const rows = reqs ?? [];
      const total = rows.length;
      const failed = rows.filter((r) => r.status_code != null && r.status_code >= 500).length;
      const successful = total - failed;
      const errorRate = total > 0 ? failed / total : 0;
      const uptimePct = total > 0 ? (successful / total) * 100 : 100;

      const latencies = rows
        .map((r) => r.latency_ms)
        .filter((v): v is number => typeof v === 'number')
        .sort((a, b) => a - b);

      const p50 = latencies.length > 0
        ? latencies[Math.floor(latencies.length * 0.5)] ?? null
        : null;
      const p95 = latencies.length > 0
        ? latencies[Math.floor(latencies.length * 0.95)] ?? null
        : null;

      // Check if within SLA
      const uptimeOk = def.uptime_target == null || uptimePct >= def.uptime_target;
      const errorOk = def.error_rate_target == null || errorRate <= def.error_rate_target;
      const p50Ok = def.latency_p50_target_ms == null || p50 == null || p50 <= def.latency_p50_target_ms;
      const p95Ok = def.latency_p95_target_ms == null || p95 == null || p95 <= def.latency_p95_target_ms;
      const isWithinSla = uptimeOk && errorOk && p50Ok && p95Ok;

      // Write measurement
      const { data: measurement } = await admin
        .from('sla_measurements')
        .insert({
          api_id: def.api_id,
          sla_id: def.id,
          window_start: windowStart.toISOString(),
          window_end: windowEnd.toISOString(),
          total_requests: total,
          failed_requests: failed,
          uptime_percentage: Math.round(uptimePct * 100) / 100,
          error_rate: Math.round(errorRate * 10000) / 10000,
          latency_p50_ms: p50,
          latency_p95_ms: p95,
          is_within_sla: isWithinSla,
        })
        .select('id')
        .single();

      processed++;

      // Write violations for each breached dimension
      if (!isWithinSla) {
        const breaches: { type: string; actual: number; target: number; severity: string }[] = [];

        if (!uptimeOk && def.uptime_target != null) {
          breaches.push({ type: 'uptime', actual: uptimePct, target: def.uptime_target, severity: uptimePct < def.uptime_target * 0.95 ? 'critical' : 'warning' });
        }
        if (!errorOk && def.error_rate_target != null) {
          breaches.push({ type: 'error_rate', actual: errorRate, target: def.error_rate_target, severity: errorRate > def.error_rate_target * 2 ? 'critical' : 'warning' });
        }
        if (!p50Ok && p50 != null && def.latency_p50_target_ms != null) {
          breaches.push({ type: 'latency_p50', actual: p50, target: def.latency_p50_target_ms, severity: 'warning' });
        }
        if (!p95Ok && p95 != null && def.latency_p95_target_ms != null) {
          breaches.push({ type: 'latency_p95', actual: p95, target: def.latency_p95_target_ms, severity: p95 > def.latency_p95_target_ms * 1.5 ? 'critical' : 'warning' });
        }

        for (const breach of breaches) {
          await admin.from('sla_violations').insert({
            api_id: def.api_id,
            sla_id: def.id,
            measurement_id: measurement?.id ?? null,
            violation_type: breach.type,
            severity: breach.severity,
            actual_value: breach.actual,
            target_value: breach.target,
            acknowledged: false,
          });
          violations++;
        }

        // Notify API owner
        const api = Array.isArray(def.apis) ? def.apis[0] : def.apis;
        if (api?.organization_id) {
          const { data: owner } = await admin
            .from('organization_members')
            .select('user_id')
            .eq('organization_id', api.organization_id)
            .eq('role', 'owner')
            .single();

          if (owner) {
            await dispatchNotification({
              type: 'api.sla_violation',
              userId: owner.user_id,
              organizationId: api.organization_id,
              title: 'SLA Violation Detected',
              body: `"${api.name}" breached its SLA: ${breaches.map((b) => b.type).join(', ')}`,
              link: `/dashboard/provider/apis/${def.api_id}`,
              metadata: { api_id: def.api_id, sla_id: def.id, breaches },
            });
          }
        }
      }
    } catch (err) {
      logger.error('compute-sla: error processing definition', { slaId: def.id, err });
    }
  }

  return NextResponse.json({ processed, violations, ran_at: windowEnd.toISOString() });
}
