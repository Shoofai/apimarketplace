// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  const cronSecret = request.headers.get('x-cron-secret');
  return cronSecret === secret;
}

/**
 * GET/POST /api/cron/process-gdpr-deletions
 * Processes data_deletion_requests whose grace period has ended.
 * Call from Vercel Cron or external scheduler with CRON_SECRET (Bearer or x-cron-secret).
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

  const { data: overdue, error: fetchError } = await admin
    .from('data_deletion_requests')
    .select('id, user_id, organization_id')
    .eq('status', 'grace_period')
    .lte('grace_period_ends_at', now);

  if (fetchError) {
    console.error('process-gdpr-deletions fetch error', fetchError);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }

  if (!overdue?.length) {
    return NextResponse.json({ processed: 0, message: 'No overdue requests' });
  }

  let processed = 0;
  for (const req of overdue) {
    const userId = req.user_id;
    const orgId = req.organization_id;

    try {
      await admin.from('data_deletion_requests').update({ status: 'processing' }).eq('id', req.id);

      if (userId) {
        await admin.from('notifications').delete().eq('user_id', userId);
        await admin.from('api_keys').delete().eq('user_id', userId);
        await admin.from('organization_members').delete().eq('user_id', userId);
        await admin.from('audit_logs').delete().eq('user_id', userId);
        await admin.from('gdpr_consent_logs').delete().eq('user_id', userId);
        await admin.from('users').delete().eq('id', userId);
        // Invoices and financial records are retained for 7 years (legal requirement); see process-retention cron
      }

      if (orgId) {
        const { data: members } = await admin
          .from('organization_members')
          .select('id')
          .eq('organization_id', orgId);
        if (!members?.length) {
          await admin.from('organizations').delete().eq('id', orgId);
        }
      }

      await admin
        .from('data_deletion_requests')
        .update({ status: 'completed', completed_at: now })
        .eq('id', req.id);
      processed++;
    } catch (err) {
      console.error('process-gdpr-deletions error for request', req.id, err);
      await admin
        .from('data_deletion_requests')
        .update({ status: 'grace_period' })
        .eq('id', req.id);
    }
  }

  return NextResponse.json({ processed, total: overdue.length });
}
