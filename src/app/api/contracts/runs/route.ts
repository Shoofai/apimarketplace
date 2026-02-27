import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError, ForbiddenError } from '@/lib/utils/errors';

export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const { searchParams } = new URL(request.url);
    const apiId = searchParams.get('api_id');
    if (!apiId) {
      return NextResponse.json({ error: 'api_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: api } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();
    if (!api || (api as { organization_id: string }).organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to list runs for this API');
    }

    const { data: runs, error } = await supabase
      .from('contract_test_runs')
      .select('id, api_id, started_at, completed_at, status, total_tests, passed_tests, failed_tests')
      .eq('api_id', apiId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ runs: runs ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
