import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { generateApiKey, hashApiKey } from '@/lib/utils/api-key';
import { logger } from '@/lib/utils/logger';

/**
 * Creates a new API subscription for the current user's organization.
 * 
 * POST /api/subscriptions
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { api_id, pricing_plan_id } = await request.json();

    const supabase = await createClient();

    // Verify API exists and is published
    const { data: api } = await supabase
      .from('apis')
      .select('id, name, status')
      .eq('id', api_id)
      .single();

    if (!api || api.status !== 'published') {
      return NextResponse.json({ error: 'API not available' }, { status: 404 });
    }

    // Verify pricing plan exists and belongs to API
    const { data: plan } = await supabase
      .from('api_pricing_plans')
      .select('*')
      .eq('id', pricing_plan_id)
      .eq('api_id', api_id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 });
    }

    // Check if already subscribed
    const { data: existingSubscription } = await supabase
      .from('api_subscriptions')
      .select('id')
      .eq('api_id', api_id)
      .eq('organization_id', context.organization_id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Already subscribed to this API' },
        { status: 400 }
      );
    }

    // Generate API key for this subscription
    const { key, prefix, hash } = generateApiKey();

    // Create subscription
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: subscription, error: subscriptionError } = await supabase
      .from('api_subscriptions')
      .insert({
        api_id,
        pricing_plan_id,
        organization_id: context.organization_id,
        user_id: context.user.id,
        api_key: hash,
        api_key_prefix: prefix,
        status: 'active',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        current_period_usage: 0,
      })
      .select()
      .single();

    if (subscriptionError) {
      logger.error('Failed to create subscription', { error: subscriptionError });
      throw subscriptionError;
    }

    // Log the subscription creation
    await supabase.from('audit_logs').insert({
      user_id: context.user.id,
      organization_id: context.organization_id,
      action: 'subscription.created',
      resource_type: 'api_subscription',
      resource_id: subscription.id,
      status: 'success',
      metadata: {
        api_id,
        api_name: api.name,
        plan_name: plan.name,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        api_key: undefined, // Don't return hash
      },
      api_key: key, // Return plain key only once
      message: 'Successfully subscribed to API. Save your API key - it will not be shown again.',
    });
  } catch (error) {
    logger.error('Error creating subscription', { error });
    return NextResponse.json(
      { error: 'An error occurred while creating the subscription' },
      { status: 500 }
    );
  }
}

/**
 * Lists subscriptions for the current organization.
 * 
 * GET /api/subscriptions
 */
export async function GET(request: Request) {
  try {
    const context = await requireAuth();
    const supabase = await createClient();

    const { data: subscriptions, error } = await supabase
      .from('api_subscriptions')
      .select(
        `
        *,
        api:apis(id, name, slug, logo_url),
        pricing_plan:api_pricing_plans(name, price_monthly, included_calls)
      `
      )
      .eq('organization_id', context.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscriptions });
  } catch (error) {
    logger.error('Error fetching subscriptions', { error });
    return NextResponse.json(
      { error: 'An error occurred while fetching subscriptions' },
      { status: 500 }
    );
  }
}
