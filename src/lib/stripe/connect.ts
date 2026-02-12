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
 * Handles incoming Connect account updates from webhooks.
 * 
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
