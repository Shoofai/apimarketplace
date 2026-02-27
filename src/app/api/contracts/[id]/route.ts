import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';

async function assertContractOwner(supabase: Awaited<ReturnType<typeof createClient>>, contractId: string, organizationId: string) {
  const { data: contract } = await supabase
    .from('api_contracts')
    .select('id, api_id')
    .eq('id', contractId)
    .single();
  if (!contract) throw new NotFoundError('Contract not found');
  const { data: api } = await supabase
    .from('apis')
    .select('organization_id')
    .eq('id', (contract as { api_id: string }).api_id)
    .single();
  if (!api || (api as { organization_id: string }).organization_id !== organizationId) {
    throw new ForbiddenError('Not authorized to modify this contract');
  }
  return contract as { id: string; api_id: string };
}

/**
 * PATCH /api/contracts/[id] — update a contract (provider only).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();
    await assertContractOwner(supabase, id, context.organization_id);

    const body = await request.json().catch(() => ({}));
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.endpoint_id !== undefined) update.endpoint_id = body.endpoint_id;
    if (body.expected_status_codes !== undefined) update.expected_status_codes = body.expected_status_codes;
    if (body.expected_response_schema !== undefined) update.expected_response_schema = body.expected_response_schema;
    if (body.max_latency_ms !== undefined) update.max_latency_ms = body.max_latency_ms;

    const { data: contract, error } = await supabase
      .from('api_contracts')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contract });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}

/**
 * DELETE /api/contracts/[id] — deactivate a contract (provider only).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();
    await assertContractOwner(supabase, id, context.organization_id);

    const { data: contract, error } = await supabase
      .from('api_contracts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contract });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
