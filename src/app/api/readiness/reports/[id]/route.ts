// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';

/**
 * GET /api/readiness/reports/[id]
 * Return a single readiness report. User must be org member (RLS enforces).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Report id required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: report, error } = await supabase
      .from('api_readiness_reports')
      .select('id, api_id, organization_id, scope, payload, score, created_at')
      .eq('id', id)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }
}
