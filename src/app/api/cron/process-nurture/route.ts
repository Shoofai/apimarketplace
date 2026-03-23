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

const BATCH_SIZE = 25;

/**
 * GET/POST /api/cron/process-nurture
 * Processes the nurture_queue table and triggers the developer-nurture Supabase Edge Function
 * for each due item. Runs every hour via Vercel Cron.
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

  const { data: dueItems, error } = await admin
    .from('nurture_queue')
    .select('id, user_id, organization_id, sequence, step, template, send_at, metadata')
    .eq('status', 'pending')
    .lte('send_at', now)
    .order('send_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    logger.error('process-nurture: failed to fetch queue', { error });
    return NextResponse.json({ error: 'Failed to fetch nurture queue' }, { status: 500 });
  }

  if (!dueItems?.length) {
    return NextResponse.json({ processed: 0, message: 'No nurture items due' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let processed = 0;
  let failed = 0;

  for (const item of dueItems) {
    try {
      // Mark as processing to prevent duplicate sends
      await admin
        .from('nurture_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      if (supabaseUrl && serviceKey) {
        const fnUrl = `${supabaseUrl}/functions/v1/developer-nurture`;
        const res = await fetch(fnUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            user_id: item.user_id,
            organization_id: item.organization_id,
            sequence: item.sequence,
            step: item.step,
            template: item.template,
            metadata: item.metadata ?? {},
          }),
          signal: AbortSignal.timeout(15_000),
        });

        if (!res.ok) {
          throw new Error(`Edge function returned ${res.status}`);
        }
      }

      await admin
        .from('nurture_queue')
        .update({ status: 'sent', sent_at: now })
        .eq('id', item.id);

      processed++;
    } catch (err) {
      logger.error('process-nurture: item failed', { itemId: item.id, error: err });
      await admin
        .from('nurture_queue')
        .update({ status: 'failed', error: String(err) })
        .eq('id', item.id);
      failed++;
    }
  }

  const hasMore = dueItems.length === BATCH_SIZE;
  logger.info('process-nurture completed', { processed, failed, total: dueItems.length, hasMore });
  return NextResponse.json({ processed, failed, hasMore });
}
