import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';
import { getSiteUrl } from '@/lib/utils/env';

/**
 * Creates a Stripe Checkout session for a paid API subscription plan.
 * Returns a checkout URL that redirects back to /dashboard/discover/subscriptions on success.
 *
 * POST /api/subscriptions/checkout
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { api_id, pricing_plan_id } = await request.json();

    const supabase = await createClient();
    const adminSb = createAdminClient();

    // Verify API and plan
    const { data: api } = await supabase
      .from('apis')
      .select('id, name, status')
      .eq('id', api_id)
      .single();

    if (!api || api.status !== 'published') {
      return NextResponse.json({ error: 'API not available' }, { status: 404 });
    }

    const { data: plan } = await supabase
      .from('api_pricing_plans')
      .select('*')
      .eq('id', pricing_plan_id)
      .eq('api_id', api_id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 });
    }

    if (!plan.price_monthly || plan.price_monthly <= 0) {
      return NextResponse.json(
        { error: 'Use the free subscription endpoint for free plans.' },
        { status: 400 }
      );
    }

    // Check for existing active subscription
    const { data: existing } = await supabase
      .from('api_subscriptions')
      .select('id')
      .eq('api_id', api_id)
      .eq('organization_id', context.organization_id)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already subscribed to this API' }, { status: 400 });
    }

    // Get or create Stripe customer for the organization
    const { data: billingAccount } = await adminSb
      .from('billing_accounts')
      .select('stripe_customer_id')
      .eq('organization_id', context.organization_id)
      .maybeSingle();

    let stripeCustomerId = billingAccount?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Get org email from the user
      const { data: userData } = await adminSb
        .from('users')
        .select('email')
        .eq('id', context.user.id)
        .single();

      const customer = await stripe.customers.create({
        email: userData?.email ?? undefined,
        metadata: { organization_id: context.organization_id },
      });
      stripeCustomerId = customer.id;

      await adminSb.from('billing_accounts').upsert({
        organization_id: context.organization_id,
        stripe_customer_id: stripeCustomerId,
        billing_email: userData?.email,
      }, { onConflict: 'organization_id' });
    }

    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${api.name} — ${plan.name} Plan`,
              description: plan.description ?? undefined,
              metadata: { api_id, pricing_plan_id },
            },
            unit_amount: Math.round(plan.price_monthly * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'api_subscription',
        api_id,
        pricing_plan_id,
        organization_id: context.organization_id,
        user_id: context.user.id,
      },
      success_url: `${siteUrl}/dashboard/discover/subscriptions?checkout=success&api=${api_id}`,
      cancel_url: `${siteUrl}/marketplace/${api_id}?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    logger.info('Checkout session created for API subscription', {
      sessionId: session.id,
      apiId: api_id,
      planId: pricing_plan_id,
      orgId: context.organization_id,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    logger.error('Error creating checkout session', { error });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
