import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { getProviderAnalytics } from '@/lib/analytics/provider';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/analytics/provider?range=7d|30d|90d|1y&api_id=all|uuid
 */
export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const api_id = searchParams.get('api_id') || 'all';

    const data = await getProviderAnalytics(
      supabase,
      context.organization_id,
      range,
      api_id === 'all' ? null : api_id
    );
    return NextResponse.json(data);
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
}
