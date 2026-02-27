import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';

/**
 * GET /api/contracts/runs/[runId]/results — list results for a test run (provider only).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ runId: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { runId } = await context.params;
    const supabase = await createClient();

    const { data: run } = await supabase
      .from('contract_test_runs')
      .select('id, api_id')
      .eq('id', runId)
      .single();
    if (!run) throw new NotFoundError('Run not found');

    const { data: api } = await supabase
      .from('apis')
      .select('organization_id')
      .eq('id', (run as { api_id: string }).api_id)
      .single();
    if (!api || (api as { organization_id: string }).organization_id !== ctx.organization_id) {
      throw new ForbiddenError('Not authorized to view this run');
    }

    const { data: results, error } = await supabase
      .from('contract_test_results')
      .select('id, contract_id, endpoint_id, status, actual_status_code, actual_latency_ms, failure_reason, actual_response_sample')
      .eq('test_run_id', runId)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ results: results ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
