import { NextResponse } from 'next/server';
import { withPlatformAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/admin/enterprise/invoice
 * Platform-admin only. Creates and sends a Stripe invoice to an enterprise org.
 * Body: { organization_id, amount_usd, description, due_days? }
 */
export const POST = withPlatformAdmin(async (req: Request) => {
  const { organization_id, amount_usd, description, due_days = 30 } = await req.json();

  if (!organization_id || !amount_usd || !description) {
    return NextResponse.json(
      { error: 'organization_id, amount_usd, and description are required.' },
      { status: 400 }
    );
  }

  if (typeof amount_usd !== 'number' || amount_usd <= 0) {
    return NextResponse.json({ error: 'amount_usd must be a positive number.' }, { status: 400 });
  }

  const adminSb = createAdminClient();

  // Get or create Stripe customer for the org
  const { data: billingAccount } = await adminSb
    .from('billing_accounts')
    .select('stripe_customer_id')
    .eq('organization_id', organization_id)
    .maybeSingle();

  let stripeCustomerId = billingAccount?.stripe_customer_id;

  if (!stripeCustomerId) {
    const { data: org } = await adminSb
      .from('organizations')
      .select('name')
      .eq('id', organization_id)
      .single();

    const customer = await stripe.customers.create({
      name: org?.name ?? undefined,
      metadata: { organization_id },
    });
    stripeCustomerId = customer.id;

    await adminSb.from('billing_accounts').upsert(
      {
        organization_id,
        stripe_customer_id: stripeCustomerId,
      },
      { onConflict: 'organization_id' }
    );
  }

  // Create Stripe invoice
  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    collection_method: 'send_invoice',
    days_until_due: due_days,
    metadata: {
      type: 'enterprise_custom',
      organization_id,
    },
    description,
  });

  // Add line item
  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    amount: Math.round(amount_usd * 100),
    currency: 'usd',
    description,
    invoice: invoice.id,
  });

  // Finalize and send
  await stripe.invoices.finalizeInvoice(invoice.id);
  const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

  // Record in local invoices table
  await adminSb.from('invoices').insert({
    organization_id,
    stripe_invoice_id: sentInvoice.id,
    total: amount_usd,
    status: 'open',
    due_date: due_days
      ? new Date(Date.now() + due_days * 24 * 60 * 60 * 1000).toISOString()
      : null,
    metadata: { type: 'enterprise_custom', description },
  } as any).then(() => {}).catch(() => {});

  logger.info('Enterprise invoice sent', {
    orgId: organization_id,
    invoiceId: sentInvoice.id,
    amount_usd,
  });

  return NextResponse.json({
    ok: true,
    stripe_invoice_id: sentInvoice.id,
    hosted_invoice_url: sentInvoice.hosted_invoice_url,
  });
});
