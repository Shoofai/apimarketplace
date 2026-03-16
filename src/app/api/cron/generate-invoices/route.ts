import { NextRequest, NextResponse } from 'next/server';
import { generateMonthlyInvoices } from '@/lib/stripe/billing';
import { logger } from '@/lib/utils/logger';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  const cronSecret = request.headers.get('x-cron-secret');
  return cronSecret === secret;
}

/**
 * GET/POST /api/cron/generate-invoices
 * Generates monthly invoices for all active subscriptions.
 * Runs on the 1st of each month at 06:00 UTC.
 * Secured by CRON_SECRET (Bearer or x-cron-secret header).
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
  const started = Date.now();
  logger.info('generate-invoices cron started');

  try {
    await generateMonthlyInvoices();
    const elapsed = Date.now() - started;
    logger.info('generate-invoices cron completed', { elapsedMs: elapsed });
    return NextResponse.json({ ok: true, elapsedMs: elapsed });
  } catch (error) {
    logger.error('generate-invoices cron failed', { error });
    return NextResponse.json({ error: 'Invoice generation failed' }, { status: 500 });
  }
}
