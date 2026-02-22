import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return request.headers.get('x-cron-secret') === secret;
}

const SEVEN_YEARS_MS = 7 * 365 * 24 * 60 * 60 * 1000;

/**
 * GET/POST /api/cron/process-retention
 * Enforces data retention: deletes financial records older than 7 years.
 * Call from Vercel Cron or external scheduler with CRON_SECRET.
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
  const cutoff = new Date(Date.now() - SEVEN_YEARS_MS).toISOString();
  let deletedInvoices = 0;
  let droppedPartitions = 0;

  const { data: oldInvoices, error: fetchError } = await admin
    .from('invoices')
    .select('id')
    .lt('created_at', cutoff);

  if (!fetchError && oldInvoices?.length) {
    const { error: delError } = await admin
      .from('invoices')
      .delete()
      .lt('created_at', cutoff);
    if (!delError) deletedInvoices = oldInvoices.length;
  }

  const retentionMonths = parseInt(process.env.API_REQUESTS_LOG_RETENTION_MONTHS ?? '12', 10) || 12;
  const { data: dropped, error: rpcError } = await admin.rpc('drop_old_api_requests_log_partitions', {
    retention_months: retentionMonths,
  });
  if (!rpcError && typeof dropped === 'number') droppedPartitions = dropped;

  return NextResponse.json({
    deleted_invoices: deletedInvoices,
    dropped_partitions: droppedPartitions,
    cutoff,
    message: 'Retention run completed',
  });
}
