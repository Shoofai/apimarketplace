import { stripe } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

interface UsageData {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
}

/**
 * Calculates monthly usage for a subscription.
 * 
 * @param subscriptionId - Subscription UUID
 * @param month - Month date (YYYY-MM-01)
 * @returns Usage statistics
 */
async function getMonthlyUsage(subscriptionId: string, month: Date): Promise<UsageData> {
  const supabase = createAdminClient();

  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const { data } = await supabase
    .from('usage_records_daily')
    .select('total_calls, successful_calls, failed_calls')
    .eq('subscription_id', subscriptionId)
    .gte('day', startDate.toISOString().split('T')[0])
    .lte('day', endDate.toISOString().split('T')[0]);

  if (!data || data.length === 0) {
    return { total_calls: 0, successful_calls: 0, failed_calls: 0 };
  }

  return data.reduce<UsageData>(
    (acc, record) => ({
      total_calls: acc.total_calls + (record.total_calls ?? 0),
      successful_calls: acc.successful_calls + (record.successful_calls ?? 0),
      failed_calls: acc.failed_calls + (record.failed_calls ?? 0),
    }),
    { total_calls: 0, successful_calls: 0, failed_calls: 0 }
  );
}

/**
 * Generates monthly invoices for all active subscriptions.
 * Called by a cron job on the 1st of each month.
 * 
 * @param month - Month to generate invoices for (defaults to previous month)
 */
export async function generateMonthlyInvoices(month?: Date) {
  const supabase = createAdminClient();

  // Default to previous month
  const billingMonth = month || new Date(new Date().setMonth(new Date().getMonth() - 1));
  const startDate = new Date(billingMonth.getFullYear(), billingMonth.getMonth(), 1);
  const endDate = new Date(billingMonth.getFullYear(), billingMonth.getMonth() + 1, 0);

  logger.info('Starting monthly invoice generation', {
    period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
  });

  // Get all active subscriptions
  const { data: subscriptions, error } = await supabase
    .from('api_subscriptions')
    .select(
      `
      *,
      pricing_plan:api_pricing_plans(*),
      api:apis(name, organization_id),
      organization:organizations(name)
    `
    )
    .eq('status', 'active');

  if (error) {
    logger.error('Failed to fetch subscriptions for billing', { error });
    throw error;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const sub of subscriptions || []) {
    try {
      await generateSubscriptionInvoice(sub, startDate, endDate);
      successCount++;
    } catch (error) {
      logger.error('Failed to generate invoice for subscription', {
        error,
        subscriptionId: sub.id,
      });
      errorCount++;
    }
  }

  logger.info('Monthly invoice generation completed', {
    total: subscriptions?.length || 0,
    success: successCount,
    errors: errorCount,
  });
}

/**
 * Generates an invoice for a single subscription.
 */
async function generateSubscriptionInvoice(
  subscription: any,
  startDate: Date,
  endDate: Date
) {
  const supabase = createAdminClient();

  // Calculate usage
  const usage = await getMonthlyUsage(subscription.id, startDate);

  // Calculate costs
  const basePrice = subscription.pricing_plan.price_monthly || 0;
  const includedCalls = subscription.pricing_plan.included_calls || 0;
  const pricePerCall = subscription.pricing_plan.price_per_call || 0;

  const overageCalls = Math.max(0, usage.total_calls - includedCalls);
  const overagePrice = overageCalls * pricePerCall;

  const subtotal = basePrice + overagePrice;
  const platformFee = subtotal * 0.03; // 3% platform fee
  const total = subtotal;

  // Create invoice record
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      organization_id: subscription.organization_id,
      billing_period_start: startDate.toISOString().split('T')[0],
      billing_period_end: endDate.toISOString().split('T')[0],
      subtotal,
      platform_fee: platformFee,
      total,
      status: 'draft',
      due_date: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      metadata: {
        subscription_id: subscription.id,
        api_id: subscription.api_id,
        usage_calls: usage.total_calls,
      },
    })
    .select()
    .single();

  if (invoiceError) {
    throw invoiceError;
  }

  // Create line items
  const lineItems = [];

  // Base subscription
  if (basePrice > 0) {
    lineItems.push({
      invoice_id: invoice.id,
      subscription_id: subscription.id,
      api_id: subscription.api_id,
      description: `${subscription.pricing_plan.name} Plan - ${subscription.api.name}`,
      quantity: 1,
      unit_price: basePrice,
      amount: basePrice,
      metadata: {
        type: 'base_plan',
        included_calls: includedCalls,
      },
    });
  }

  // Overage charges
  if (overageCalls > 0 && overagePrice > 0) {
    lineItems.push({
      invoice_id: invoice.id,
      subscription_id: subscription.id,
      api_id: subscription.api_id,
      description: `Overage: ${overageCalls.toLocaleString()} additional API calls`,
      quantity: overageCalls,
      unit_price: pricePerCall,
      amount: overagePrice,
      metadata: {
        type: 'overage',
        price_per_call: pricePerCall,
      },
    });
  }

  if (lineItems.length > 0) {
    await supabase.from('invoice_line_items').insert(lineItems);
  }

  // Create Stripe invoice
  await createStripeInvoice(invoice.id);

  logger.info('Invoice generated', {
    invoiceId: invoice.id,
    subscriptionId: subscription.id,
    total,
  });

  return invoice;
}

/**
 * Creates a Stripe invoice from a database invoice.
 * 
 * @param invoiceId - Internal invoice UUID
 */
export async function createStripeInvoice(invoiceId: string) {
  const supabase = createAdminClient();

  // Fetch invoice with line items
  const { data: invoice } = await supabase
    .from('invoices')
    .select(
      `
      *,
      line_items:invoice_line_items(*),
      organization:organizations(name)
    `
    )
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Get billing account
  const { data: billingAccount } = await supabase
    .from('billing_accounts')
    .select('stripe_customer_id')
    .eq('organization_id', invoice.organization_id)
    .single();

  if (!billingAccount?.stripe_customer_id) {
    logger.warn('No Stripe customer for organization', {
      organizationId: invoice.organization_id,
    });
    return;
  }

  try {
    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: billingAccount.stripe_customer_id,
      auto_advance: true,
      collection_method: 'charge_automatically',
      description: `API Marketplace Usage: ${invoice.billing_period_start} to ${invoice.billing_period_end}`,
      metadata: {
        invoice_id: invoiceId,
        organization_id: invoice.organization_id,
      },
    });

    // Add line items
    const lineItems = (invoice.line_items || []) as unknown as Array<{ description?: string | null; quantity?: number | null; unit_price?: number | null }>;
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: billingAccount.stripe_customer_id!,
        invoice: stripeInvoice.id,
        description: item.description ?? undefined,
        quantity: item.quantity ?? 1,
        unit_amount_decimal: String(Math.round((item.unit_price ?? 0) * 100)),
        currency: 'usd',
      } as Parameters<typeof stripe.invoiceItems.create>[0]);
    }

    // Finalize the invoice
    await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Update database record
    await supabase
      .from('invoices')
      .update({
        stripe_invoice_id: stripeInvoice.id,
        status: 'open',
      })
      .eq('id', invoiceId);

    logger.info('Stripe invoice created', {
      invoiceId,
      stripeInvoiceId: stripeInvoice.id,
    });
  } catch (error) {
    logger.error('Failed to create Stripe invoice', { error, invoiceId });
    throw error;
  }
}

/**
 * Marks an invoice as paid.
 * Called from Stripe webhook when payment succeeds.
 * 
 * @param stripeInvoiceId - Stripe Invoice ID
 */
export async function markInvoicePaid(stripeInvoiceId: string) {
  const supabase = createAdminClient();

  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', stripeInvoiceId);

  logger.info('Invoice marked as paid', { stripeInvoiceId });
}

/**
 * Handles failed invoice payments.
 * 
 * @param stripeInvoiceId - Stripe Invoice ID
 */
export async function handlePaymentFailed(stripeInvoiceId: string) {
  const supabase = createAdminClient();

  await supabase
    .from('invoices')
    .update({
      status: 'uncollectible',
    })
    .eq('stripe_invoice_id', stripeInvoiceId);

  logger.warn('Invoice payment failed', { stripeInvoiceId });

  // TODO: Send notification to customer
  // TODO: Consider suspending subscription after multiple failures
}
