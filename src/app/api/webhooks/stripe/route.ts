// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { markInvoicePaid, handlePaymentFailed } from '@/lib/stripe/billing';
import { handleConnectAccountUpdate } from '@/lib/stripe/connect';
import { logger } from '@/lib/utils/logger';
import { createAdminClient } from '@/lib/supabase/admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe webhook handler.
 * Processes events from Stripe including payments, account updates, and payouts.
 * 
 * POST /api/webhooks/stripe
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    logger.error('Webhook signature verification failed', { error: error.message });
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  logger.info('Stripe webhook received', {
    type: event.type,
    id: event.id,
  });

  try {
    switch (event.type) {
      // Checkout session completed (e.g. credit purchase one-time payment)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata ?? {};

        if (meta.type === 'credit_purchase' && meta.organization_id) {
          const adminSb = createAdminClient();
          const orgId = meta.organization_id;
          const totalCredits = (parseInt(meta.credits ?? '0') || 0) + (parseInt(meta.bonus_credits ?? '0') || 0);

          // Get current balance
          const { data: existing } = await adminSb
            .from('credit_balances')
            .select('balance')
            .eq('organization_id', orgId)
            .maybeSingle();

          const currentBalance = existing?.balance ?? 0;
          const newBalance = currentBalance + totalCredits;

          // Upsert credit balance
          await adminSb.from('credit_balances').upsert({
            organization_id: orgId,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'organization_id' });

          // Insert ledger row
          await adminSb.from('credit_ledger').insert({
            organization_id: orgId,
            amount: totalCredits,
            type: 'purchase',
            description: `Credit package purchase (${totalCredits} credits) — Checkout ${session.id}`,
            balance_after: newBalance,
          } as any);

          logger.info('Credit purchase completed', { orgId, totalCredits, newBalance });
        }
        break;
      }

      // Invoice payment succeeded
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await markInvoicePaid(invoice.id);
        break;
      }

      // Invoice payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice.id);
        break;
      }

      // Connect account updated
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleConnectAccountUpdate(account.id);
        break;
      }

      // Payment intent succeeded (for one-time payments)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info('Payment intent succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
        break;
      }

      // Payment intent failed
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.warn('Payment intent failed', {
          paymentIntentId: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error,
        });
        break;
      }

      // Customer created
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        logger.info('Customer created', { customerId: customer.id });
        break;
      }

      // Customer deleted
      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer;
        logger.info('Customer deleted', { customerId: customer.id });
        break;
      }

      // Payout paid (Connect account)
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        logger.info('Payout completed', {
          payoutId: payout.id,
          amount: payout.amount,
          destination: payout.destination,
        });
        break;
      }

      // Payout failed
      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        logger.error('Payout failed', {
          payoutId: payout.id,
          failureCode: payout.failure_code,
          failureMessage: payout.failure_message,
        });
        break;
      }

      // Payment method attached
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        logger.info('Payment method attached', {
          paymentMethodId: paymentMethod.id,
          customerId: paymentMethod.customer,
        });
        break;
      }

      // Payment method detached
      case 'payment_method.detached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        logger.info('Payment method detached', {
          paymentMethodId: paymentMethod.id,
        });
        break;
      }

      // Subscription created (if using Stripe subscriptions)
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Stripe subscription created', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });
        break;
      }

      // Subscription updated
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Stripe subscription updated', {
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }

      // Subscription deleted/cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Stripe subscription deleted', {
          subscriptionId: subscription.id,
        });
        break;
      }

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook', {
      error,
      eventType: event.type,
      eventId: event.id,
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
