import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

type Params = { params: Promise<{ id: string }> };

/**
 * Cancel/revoke a subscription by ID.
 * DELETE /api/subscriptions/[id]
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    const { data: sub } = await supabase
      .from('api_subscriptions')
      .select('id, status, organization_id')
      .eq('id', id)
      .eq('organization_id', context.organization_id)
      .single();

    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    if (sub.status === 'cancelled') return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });

    await supabase
      .from('api_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', id);

    await supabase.from('audit_logs').insert({
      user_id: context.user.id,
      organization_id: context.organization_id,
      action: 'subscription.cancelled',
      resource_type: 'api_subscription',
      resource_id: id,
      status: 'success',
    });

    logger.info('Subscription cancelled', { subscriptionId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error cancelling subscription', { error });
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}

/**
 * Change plan for a subscription.
 * PATCH /api/subscriptions/[id]
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const { pricing_plan_id } = await request.json();

    if (!pricing_plan_id) return NextResponse.json({ error: 'pricing_plan_id required' }, { status: 400 });

    const supabase = await createClient();

    const { data: sub } = await supabase
      .from('api_subscriptions')
      .select('id, api_id, status, pricing_plan_id')
      .eq('id', id)
      .eq('organization_id', context.organization_id)
      .single();

    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    if (sub.status !== 'active') return NextResponse.json({ error: 'Only active subscriptions can be changed' }, { status: 400 });
    if (sub.pricing_plan_id === pricing_plan_id) return NextResponse.json({ error: 'Already on this plan' }, { status: 400 });

    const { data: newPlan } = await supabase
      .from('api_pricing_plans')
      .select('id, name, price_monthly')
      .eq('id', pricing_plan_id)
      .eq('api_id', sub.api_id)
      .single();

    if (!newPlan) return NextResponse.json({ error: 'Plan not found for this API' }, { status: 404 });

    await supabase
      .from('api_subscriptions')
      .update({ pricing_plan_id })
      .eq('id', id);

    await supabase.from('audit_logs').insert({
      user_id: context.user.id,
      organization_id: context.organization_id,
      action: 'subscription.plan_changed',
      resource_type: 'api_subscription',
      resource_id: id,
      status: 'success',
      metadata: { new_plan_id: pricing_plan_id, new_plan_name: newPlan.name },
    });

    logger.info('Subscription plan changed', { subscriptionId: id, newPlanId: pricing_plan_id });
    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    logger.error('Error changing plan', { error });
    return NextResponse.json({ error: 'Failed to change plan' }, { status: 500 });
  }
}
