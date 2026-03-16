import { stripe } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

/**
 * Creates a Stripe Connect Express account for an API provider.
 * 
 * @param organizationId - Organization UUID
 * @param email - Provider email address
 * @param country - Two-letter country code (default: US)
 * @returns Account ID and onboarding URL
 */
export async function createConnectAccount(
  organizationId: string,
  email: string,
  country: string = 'US'
) {
  try {
    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company',
      metadata: {
        organization_id: organizationId,
      },
    });

    // Generate account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/settings/stripe-refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/settings/stripe-callback`,
      type: 'account_onboarding',
    });

    // Save to database
    const supabase = createAdminClient();
    await supabase
      .from('billing_accounts')
      .upsert({
        organization_id: organizationId,
        stripe_connect_account_id: account.id,
        connect_status: 'pending',
        billing_email: email,
      });

    logger.info('Stripe Connect account created', {
      organizationId,
      accountId: account.id,
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    logger.error('Failed to create Stripe Connect account', { error, organizationId });
    throw error;
  }
}

/**
 * Retrieves the status of a Connect account.
 * 
 * @param accountId - Stripe Account ID
 * @returns Account details including capabilities and requirements
 */
export async function getConnectAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
    };
  } catch (error) {
    logger.error('Failed to retrieve Connect account', { error, accountId });
    throw error;
  }
}

/**
 * Generates a new onboarding link for incomplete Connect accounts.
 * 
 * @param accountId - Stripe Account ID
 * @returns New onboarding URL
 */
export async function refreshConnectOnboarding(accountId: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/settings/stripe-refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/settings/stripe-callback`,
      type: 'account_onboarding',
    });

    return { onboardingUrl: accountLink.url };
  } catch (error) {
    logger.error('Failed to refresh Connect onboarding', { error, accountId });
    throw error;
  }
}

/**
 * Generates a login link to the Stripe Express dashboard.
 * 
 * @param accountId - Stripe Account ID
 * @returns Dashboard login URL
 */
export async function createDashboardLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return { dashboardUrl: loginLink.url };
  } catch (error) {
    logger.error('Failed to create dashboard link', { error, accountId });
    throw error;
  }
}

/**
 * Transfers revenue to a provider's Stripe Connect account after deducting platform fee.
 * Called after an invoice is marked as paid.
 *
 * @param organizationId - Provider organization UUID
 * @param grossAmountCents - Gross amount in cents to split
 * @param platformFeePct - Platform fee percentage (default 0.03 = 3%)
 * @param description - Transfer description
 */
export async function transferToProvider(
  organizationId: string,
  grossAmountCents: number,
  platformFeePct: number = 0.03,
  description?: string
) {
  const supabase = createAdminClient();

  const { data: billingAccount } = await supabase
    .from('billing_accounts')
    .select('stripe_connect_account_id, connect_status')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (!billingAccount?.stripe_connect_account_id) {
    logger.warn('No Connect account for provider — skipping transfer', { organizationId });
    return null;
  }

  if (billingAccount.connect_status !== 'active') {
    logger.warn('Connect account not active — skipping transfer', {
      organizationId,
      connectStatus: billingAccount.connect_status,
    });
    return null;
  }

  const providerAmountCents = Math.floor(grossAmountCents * (1 - platformFeePct));

  if (providerAmountCents <= 0) {
    logger.warn('Transfer amount is zero — skipping', { grossAmountCents, platformFeePct });
    return null;
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: providerAmountCents,
      currency: 'usd',
      destination: billingAccount.stripe_connect_account_id,
      description: description ?? `Provider revenue share — ${organizationId}`,
      metadata: {
        organization_id: organizationId,
        gross_amount_cents: grossAmountCents,
        platform_fee_pct: String(platformFeePct),
      },
    });

    logger.info('Provider transfer completed', {
      organizationId,
      transferId: transfer.id,
      providerAmountCents,
    });

    return transfer;
  } catch (error) {
    logger.error('Failed to transfer to provider', { error, organizationId, grossAmountCents });
    throw error;
  }
}

/**
 * @param accountId - Stripe Account ID
 */
export async function handleConnectAccountUpdate(accountId: string) {
  try {
    const supabase = createAdminClient();

    // Get account status
    const status = await getConnectAccountStatus(accountId);

    // Determine status
    let connectStatus: string;
    if (status.chargesEnabled && status.payoutsEnabled) {
      connectStatus = 'active';
    } else if (status.requirements?.disabled_reason) {
      connectStatus = 'disabled';
    } else if (status.requirements?.currently_due && status.requirements.currently_due.length > 0) {
      connectStatus = 'restricted';
    } else {
      connectStatus = 'pending';
    }

    // Update database
    await supabase
      .from('billing_accounts')
      .update({
        connect_status: connectStatus,
      })
      .eq('stripe_connect_account_id', accountId);

    logger.info('Connect account updated', { accountId, connectStatus });
  } catch (error) {
    logger.error('Failed to handle Connect account update', { error, accountId });
    throw error;
  }
}
