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
 * GET/POST /api/cron/refresh-mvs
 * Refreshes materialized views platform_kpis and api_rankings_mv.
 * Call from Vercel Cron or external scheduler with CRON_SECRET (Bearer or x-cron-secret).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runRefresh();
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runRefresh();
}

async function runRefresh() {
  const admin = createAdminClient();
  const refreshed: string[] = [];

  const { error: kpisError } = await admin.rpc('refresh_platform_kpis');
  if (kpisError) {
    console.error('refresh-mvs refresh_platform_kpis error', kpisError);
    return NextResponse.json(
      { error: 'Failed to refresh platform_kpis', details: kpisError.message },
      { status: 500 }
    );
  }
  refreshed.push('platform_kpis');

  const { error: rankingsError } = await admin.rpc('refresh_api_rankings');
  if (rankingsError) {
    console.error('refresh-mvs refresh_api_rankings error', rankingsError);
    return NextResponse.json(
      { error: 'Failed to refresh api_rankings', details: rankingsError.message },
      { status: 500 }
    );
  }
  refreshed.push('api_rankings');

  return NextResponse.json({ ok: true, refreshed });
}
