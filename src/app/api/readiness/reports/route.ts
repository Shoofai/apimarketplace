import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/readiness/reports?api_id=...
 * List readiness reports for an API. User must have access to the API's org (RLS).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const api_id = searchParams.get('api_id');
    if (!api_id) {
      return NextResponse.json({ error: 'api_id query required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: reports, error } = await supabase
      .from('api_readiness_reports')
      .select('id, api_id, scope, score, created_at')
      .eq('api_id', api_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: reports ?? [] });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}
