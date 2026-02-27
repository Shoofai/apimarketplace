import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
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
    const { api_id, pricing_plan_id, payment_method } = await request.json();

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

    // Governance: check approved_apis policy
    const { data: govPolicy } = await supabase
      .from('org_governance_policies')
      .select('config, is_active')
      .eq('organization_id', context.organization_id)
      .eq('policy_type', 'approved_apis')
      .maybeSingle();

    if (govPolicy?.is_active) {
      const approvedList: string[] = (govPolicy.config as any)?.api_ids ?? [];
      if (approvedList.length > 0 && !approvedList.includes(api_id)) {
        return NextResponse.json(
          { error: 'This API is not on your organization\'s approved APIs list. Contact your org admin.' },
          { status: 403 }
        );
      }
    }

    // Credits payment: deduct balance if payment_method === 'credits'
    if (payment_method === 'credits') {
      const priceInCredits = (plan as any).price_in_credits;
      if (!priceInCredits || priceInCredits <= 0) {
        return NextResponse.json(
          { error: 'This plan is not available for credit payment.' },
          { status: 400 }
        );
      }
      // Check balance
      const { data: balanceRow } = await supabase
        .from('credit_balances')
        .select('balance')
        .eq('organization_id', context.organization_id)
        .maybeSingle();

      const currentBalance = balanceRow?.balance ?? 0;
      if (currentBalance < priceInCredits) {
        return NextResponse.json(
          { error: `Insufficient credits. You need ${priceInCredits} credits but have ${currentBalance}.` },
          { status: 402 }
        );
      }

      const newBalance = currentBalance - priceInCredits;

      // Deduct balance
      await supabase.from('credit_balances').upsert({
        organization_id: context.organization_id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'organization_id' });

      // Ledger entry
      await supabase.from('credit_ledger').insert({
        organization_id: context.organization_id,
        amount: -priceInCredits,
        type: 'usage',
        description: `Subscribed to ${api.name} (${plan.name})`,
        balance_after: newBalance,
      } as any);
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

    // Affiliate commission tracking: check `aff` cookie
    try {
      const cookieStore = await cookies();
      const affCode = cookieStore.get('aff')?.value;
      if (affCode) {
        const { data: affLink } = await supabase
          .from('affiliate_links')
          .select('id, organization_id, commission_percent, api_id, is_active')
          .eq('code', affCode)
          .eq('is_active', true)
          .maybeSingle();

        if (affLink) {
          // Verify the affiliate link covers this API (null = all APIs for the org)
          const apiOrg = (api as any).organization_id;
          const coversApi = affLink.api_id == null
            ? affLink.organization_id === apiOrg
            : affLink.api_id === api_id;

          if (coversApi) {
            const commissionAmount = ((plan.price_monthly ?? 0) * (Number(affLink.commission_percent) / 100));
            await supabase.from('provider_affiliate_commissions' as any).insert({
              affiliate_link_id: affLink.id,
              subscription_id: subscription.id,
              api_id,
              subscriber_organization_id: context.organization_id,
              commission_amount: commissionAmount,
              commission_percent: affLink.commission_percent,
              status: 'pending',
            });
            // Increment conversion count
            await supabase
              .from('affiliate_links')
              .update({ conversion_count: (affLink as any).conversion_count + 1 } as any)
              .eq('id', affLink.id);
          }
        }
      }
    } catch (affErr) {
      logger.warn('Affiliate commission tracking failed', { error: affErr });
    }

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
      .order('created_at', { ascending: false })
      .limit(DEFAULT_LIST_LIMIT);

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
