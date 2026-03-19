import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';
import { logger } from '@/lib/utils/logger';
import { getSiteUrl } from '@/lib/utils/env';

const PLATFORM_PLANS = {
  pro: {
    name: 'Pro Plan',
    description: 'Unlimited AI code generation, full readiness audits, workflows, SSO, and priority support.',
    unit_amount: 9900, // $99.00 in cents
  },
} as const;

/**
 * POST /api/platform/checkout
 * Creates a Stripe Checkout session to upgrade organization to Pro.
 * Body: { plan: 'pro' }
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { plan = 'pro' } = await request.json().catch(() => ({}));

    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Only the pro plan is available for self-serve checkout.' },
        { status: 400 }
      );
    }

    const adminSb = createAdminClient();

    // Check if already on pro or higher
    const { data: org } = await adminSb
      .from('organizations')
      .select('id, name, plan')
      .eq('id', context.organization_id)
      .single();

    if (org?.plan === 'pro' || org?.plan === 'enterprise') {
      return NextResponse.json(
        { error: `Already on the ${org.plan} plan.` },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const { data: billingAccount } = await adminSb
      .from('billing_accounts')
      .select('stripe_customer_id')
      .eq('organization_id', context.organization_id)
      .maybeSingle();

    let stripeCustomerId = billingAccount?.stripe_customer_id;

    if (!stripeCustomerId) {
      const { data: userData } = await adminSb
        .from('users')
        .select('email')
        .eq('id', context.user.id)
        .single();

      const customer = await stripe.customers.create({
        email: userData?.email ?? undefined,
        name: org?.name ?? undefined,
        metadata: { organization_id: context.organization_id },
      });
      stripeCustomerId = customer.id;

      await adminSb.from('billing_accounts').upsert(
        {
          organization_id: context.organization_id,
          stripe_customer_id: stripeCustomerId,
          billing_email: userData?.email,
        },
        { onConflict: 'organization_id' }
      );
    }

    const siteUrl = getSiteUrl();
    const planConfig = PLATFORM_PLANS[plan as keyof typeof PLATFORM_PLANS];

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
              metadata: { platform_plan: plan },
            },
            unit_amount: planConfig.unit_amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'platform_subscription',
        organization_id: context.organization_id,
        user_id: context.user.id,
        plan,
      },
      success_url: `${siteUrl}/dashboard/settings/billing?platform_checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    logger.info('Platform checkout session created', {
      sessionId: session.id,
      orgId: context.organization_id,
      plan,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    logger.error('Error creating platform checkout session', { error });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
