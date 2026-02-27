import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError, ForbiddenError } from '@/lib/utils/errors';

/**
 * GET /api/apis/[id]/contracts — list contracts for an API (provider only).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { id: apiId } = await context.params;
    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();
    if (!api || (api as { organization_id: string }).organization_id !== ctx.organization_id) {
      throw new ForbiddenError('Not authorized to list contracts for this API');
    }

    const { data: contracts, error } = await supabase
      .from('api_contracts')
      .select('id, api_id, endpoint_id, expected_status_codes, max_latency_ms, is_active, created_at, updated_at')
      .eq('api_id', apiId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contracts: contracts ?? [] });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}

/**
 * POST /api/apis/[id]/contracts — create a contract (provider only).
 * Body: { endpoint_id, expected_status_codes, expected_response_schema?, max_latency_ms? }
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { id: apiId } = await context.params;
    const supabase = await createClient();

    const { data: api } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();
    if (!api || (api as { organization_id: string }).organization_id !== ctx.organization_id) {
      throw new ForbiddenError('Not authorized to create contracts for this API');
    }

    const body = await request.json().catch(() => ({}));
    const {
      endpoint_id,
      expected_status_codes,
      expected_response_schema,
      max_latency_ms,
    } = body as {
      endpoint_id?: string;
      expected_status_codes?: number[];
      expected_response_schema?: unknown;
      max_latency_ms?: number;
    };

    if (!endpoint_id || !Array.isArray(expected_status_codes)) {
      return NextResponse.json(
        { error: 'endpoint_id and expected_status_codes are required' },
        { status: 400 }
      );
    }

    const { data: contract, error } = await supabase
      .from('api_contracts')
      .insert({
        api_id: apiId,
        endpoint_id,
        expected_status_codes,
        expected_response_schema: expected_response_schema ?? null,
        max_latency_ms: typeof max_latency_ms === 'number' ? max_latency_ms : null,
        is_active: true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contract });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
