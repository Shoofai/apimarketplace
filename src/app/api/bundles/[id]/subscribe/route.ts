import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/bundles/[id]/subscribe
 * Subscribe to a bundle: creates a bundle_subscriptions row and
 * a per-API api_subscriptions row for each item in the bundle
 * using the cheapest available plan for that API.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Fetch bundle + items + pricing
    const { data: bundle, error } = await supabase
      .from('api_bundles')
      .select(`
        *,
        api_bundle_items (
          api_id,
          api:apis(
            id,
            pricing_plans:api_pricing_plans(id, price_monthly, is_active)
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Check for existing active bundle subscription
    const { data: existingSub } = await supabase
      .from('bundle_subscriptions')
      .select('id')
      .eq('bundle_id', id)
      .eq('organization_id', context.organization_id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json({ error: 'Already subscribed to this bundle' }, { status: 409 });
    }

    // Create bundle subscription (monthly period)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: bundleSub, error: subErr } = await supabase
      .from('bundle_subscriptions')
      .insert({
        bundle_id: id,
        organization_id: context.organization_id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      } as any)
      .select()
      .single();

    if (subErr) {
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }

    // For each API in the bundle, subscribe using the cheapest active plan
    const apiSubscriptions = [];
    for (const item of bundle.api_bundle_items ?? []) {
      const api = (item as any).api;
      if (!api) continue;

      // Check if already subscribed
      const { data: existing } = await supabase
        .from('api_subscriptions')
        .select('id')
        .eq('api_id', item.api_id)
        .eq('organization_id', context.organization_id)
        .eq('status', 'active')
        .maybeSingle();

      if (existing) continue; // Already subscribed, skip

      // Find cheapest plan
      const plans = ((api.pricing_plans ?? []) as { id: string; price_monthly: number; is_active: boolean }[])
        .filter((p) => p.is_active)
        .sort((a, b) => a.price_monthly - b.price_monthly);

      if (plans.length === 0) continue;
      const plan = plans[0];

      const { data: apiSub } = await supabase
        .from('api_subscriptions')
        .insert({
          api_id: item.api_id,
          plan_id: plan.id,
          organization_id: context.organization_id,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        } as any)
        .select()
        .single();

      if (apiSub) apiSubscriptions.push(apiSub);
    }

    return NextResponse.json({
      bundle_subscription: bundleSub,
      api_subscriptions: apiSubscriptions,
      message: `Subscribed to bundle and ${apiSubscriptions.length} API(s)`,
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Authentication')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
