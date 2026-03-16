import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/platform/manage
 * Creates a Stripe Customer Portal session so users can manage or cancel their Pro subscription.
 */
export async function POST() {
  try {
    const context = await requireAuth();
    const adminSb = createAdminClient();

    const { data: billingAccount } = await adminSb
      .from('billing_accounts')
      .select('stripe_customer_id')
      .eq('organization_id', context.organization_id)
      .maybeSingle();

    if (!billingAccount?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Upgrade to Pro first.' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: billingAccount.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/settings/billing`,
    });

    logger.info('Customer portal session created', {
      orgId: context.organization_id,
      sessionId: portalSession.id,
    });

    return NextResponse.json({ portalUrl: portalSession.url });
  } catch (error) {
    logger.error('Error creating portal session', { error });
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
