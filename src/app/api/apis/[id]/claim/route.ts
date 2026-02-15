import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

/**
 * POST /api/apis/[id]/claim
 * Request to claim an unclaimed API. Requires api.create permission and provider org.
 * Sets status to claim_pending; admin must approve to transfer ownership.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requirePermission('api.create');
    const { id } = await params;
    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, name, status, claimed_by_organization_id')
      .eq('id', id)
      .single();

    if (apiError || !api) {
      throw new NotFoundError('API not found');
    }

    if (api.status !== 'unclaimed') {
      return NextResponse.json(
        { error: 'API is not available to claim' },
        { status: 400 }
      );
    }

    if (api.claimed_by_organization_id) {
      return NextResponse.json(
        { error: 'A claim is already pending for this API' },
        { status: 400 }
      );
    }

    // Ensure org is provider or both
    const { data: org } = await supabase
      .from('organizations')
      .select('type')
      .eq('id', context.organization_id)
      .single();

    if (!org || !['provider', 'both'].includes(org.type)) {
      throw new ForbiddenError('Only provider organizations can claim APIs');
    }

    const { error: updateError } = await supabase
      .from('apis')
      .update({
        claimed_by_organization_id: context.organization_id,
        claim_requested_at: new Date().toISOString(),
        status: 'claim_pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to submit claim' },
        { status: 500 }
      );
    }

    await supabase.from('audit_logs').insert({
      user_id: context.user.id,
      organization_id: context.organization_id,
      action: 'api.claim_requested',
      resource_type: 'api',
      resource_id: id,
      status: 'success',
      metadata: { api_name: api.name },
    });

    return NextResponse.json({
      success: true,
      message: 'Claim submitted. An admin will review your request.',
    });
  } catch (e: unknown) {
    const { AuthError } = await import('@/lib/utils/errors');
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    if (e instanceof NotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
