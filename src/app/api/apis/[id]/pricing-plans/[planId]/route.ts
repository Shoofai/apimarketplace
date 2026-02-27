import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/utils/errors';
import { NotFoundError, ForbiddenError } from '@/lib/utils/errors';

/**
 * PATCH /api/apis/[id]/pricing-plans/[planId] — update a pricing plan (provider only).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const context = await requireAuth();
    const { id: apiId, planId } = await params;
    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();

    if (apiError || !api) throw new NotFoundError('API not found');
    if (api.organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to manage this API');
    }

    const { data: plan, error: planError } = await supabase
      .from('api_pricing_plans')
      .select('id, api_id')
      .eq('id', planId)
      .eq('api_id', apiId)
      .single();

    if (planError || !plan) throw new NotFoundError('Pricing plan not found');

    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.included_calls === 'number') updates.included_calls = body.included_calls;
    if (typeof body.rate_limit_per_second === 'number') updates.rate_limit_per_second = body.rate_limit_per_second;
    if (typeof body.rate_limit_per_day === 'number') updates.rate_limit_per_day = body.rate_limit_per_day;
    if (typeof body.rate_limit_per_month === 'number') updates.rate_limit_per_month = body.rate_limit_per_month;

    const { data: updated, error } = await supabase
      .from('api_pricing_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan: updated });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}

/**
 * DELETE /api/apis/[id]/pricing-plans/[planId] — deactivate a pricing plan (provider only).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const context = await requireAuth();
    const { id: apiId, planId } = await params;
    const supabase = await createClient();

    const { data: api, error: apiError } = await supabase
      .from('apis')
      .select('id, organization_id')
      .eq('id', apiId)
      .single();

    if (apiError || !api) throw new NotFoundError('API not found');
    if (api.organization_id !== context.organization_id) {
      throw new ForbiddenError('Not authorized to manage this API');
    }

    const { error } = await supabase
      .from('api_pricing_plans')
      .update({ is_active: false })
      .eq('id', planId)
      .eq('api_id', apiId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
