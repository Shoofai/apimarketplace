// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reinvokeIfNeeded } from '@/lib/utils/cron-reinvoke';

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

const BATCH_SIZE = 10;

async function runProcess() {

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: overdue, error: fetchError } = await admin
    .from('data_deletion_requests')
    .select('id, user_id, organization_id')
    .eq('status', 'grace_period')
    .lte('grace_period_ends_at', now)
    .limit(BATCH_SIZE);

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
        const deletionSteps: { table: string; column: string }[] = [
          { table: 'notifications', column: 'user_id' },
          { table: 'api_keys', column: 'user_id' },
          { table: 'organization_members', column: 'user_id' },
          { table: 'audit_logs', column: 'user_id' },
          { table: 'gdpr_consent_logs', column: 'user_id' },
          { table: 'users', column: 'id' },
          // Invoices and financial records are retained for 7 years (legal requirement); see process-retention cron
        ];

        for (const step of deletionSteps) {
          const { error: delError } = await admin
            .from(step.table)
            .delete()
            .eq(step.column, userId);
          if (delError) {
            const reason = `Failed to delete from ${step.table}: ${delError.message}`;
            console.error(`process-gdpr-deletions step failed for request ${req.id}`, reason);
            await admin
              .from('data_deletion_requests')
              .update({ status: 'error', error_reason: reason })
              .eq('id', req.id);
            continue; // skip to next deletion request
          }
        }

        // If we reach here after a step failure the status is already 'error'
        const { data: currentReq } = await admin
          .from('data_deletion_requests')
          .select('status')
          .eq('id', req.id)
          .single();
        if (currentReq?.status === 'error') {
          continue; // skip to next request in the for-loop
        }
      }

      if (orgId) {
        const { data: members } = await admin
          .from('organization_members')
          .select('id')
          .eq('organization_id', orgId);
        if (!members?.length) {
          const { error: orgDelError } = await admin.from('organizations').delete().eq('id', orgId);
          if (orgDelError) {
            const reason = `Failed to delete organization ${orgId}: ${orgDelError.message}`;
            console.error(`process-gdpr-deletions org delete failed for request ${req.id}`, reason);
            await admin
              .from('data_deletion_requests')
              .update({ status: 'error', error_reason: reason })
              .eq('id', req.id);
            continue;
          }
        }
      }

      await admin
        .from('data_deletion_requests')
        .update({ status: 'completed', completed_at: now })
        .eq('id', req.id);
      processed++;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error('process-gdpr-deletions error for request', req.id, err);
      await admin
        .from('data_deletion_requests')
        .update({ status: 'error', error_reason: reason })
        .eq('id', req.id);
    }
  }

  const hasMore = overdue.length === BATCH_SIZE;

  await reinvokeIfNeeded(hasMore, '/api/cron/process-gdpr-deletions', process.env.CRON_SECRET || '');

  return NextResponse.json({ processed, hasMore });
}
