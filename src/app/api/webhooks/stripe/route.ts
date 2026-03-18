// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { markInvoicePaid, handlePaymentFailed } from '@/lib/stripe/billing';
import { handleConnectAccountUpdate } from '@/lib/stripe/connect';
import { dispatchNotification } from '@/lib/notifications/dispatcher';
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

  // Idempotency: skip already-processed events (Stripe may retry)
  const adminSbIdempotent = createAdminClient();
  const { data: existing } = await adminSbIdempotent
    .from('processed_stripe_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();

  if (existing) {
    logger.info('Stripe webhook: duplicate event skipped', { id: event.id, type: event.type });
    return NextResponse.json({ received: true, skipped: true });
  }

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
          });

          logger.info('Credit purchase completed', { orgId, totalCredits, newBalance });
        }

        // Platform subscription checkout (Pro upgrade)
        if (meta.type === 'platform_subscription' && meta.organization_id && meta.plan) {
          const adminSb = createAdminClient();
          const stripeSubscriptionId = (session as any).subscription as string | undefined;

          if (stripeSubscriptionId) {
            await adminSb.from('platform_subscriptions').upsert(
              {
                organization_id: meta.organization_id,
                stripe_subscription_id: stripeSubscriptionId,
                stripe_customer_id: session.customer as string,
                plan: meta.plan,
                status: 'active',
              },
              { onConflict: 'organization_id' }
            );
          }

          await adminSb
            .from('organizations')
            .update({ plan: meta.plan, updated_at: new Date().toISOString() })
            .eq('id', meta.organization_id);

          logger.info('Platform subscription activated', {
            orgId: meta.organization_id,
            plan: meta.plan,
            stripeSubscriptionId,
          });
        }

        // API subscription checkout completed
        if (
          meta.type === 'api_subscription' &&
          meta.api_id &&
          meta.pricing_plan_id &&
          meta.organization_id &&
          meta.user_id
        ) {
          const adminSb = createAdminClient();
          const { generateApiKey, hashApiKey } = await import('@/lib/utils/api-key');
          const { key, prefix, hash } = generateApiKey();

          const periodStart = new Date();
          const periodEnd = new Date(periodStart);
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          const { data: subscription } = await adminSb
            .from('api_subscriptions')
            .insert({
              api_id: meta.api_id,
              pricing_plan_id: meta.pricing_plan_id,
              organization_id: meta.organization_id,
              user_id: meta.user_id,
              api_key: hash,
              api_key_prefix: prefix,
              status: 'active',
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
              calls_this_month: 0,
              stripe_subscription_id: (session as any).subscription ?? null,
            })
            .select()
            .single();

          if (subscription) {
            // Store the plaintext key temporarily (24h TTL) so the dashboard can reveal it once
            void adminSb.from('api_key_reveals').insert({
              subscription_id: subscription.id,
              plaintext_key: key,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });

            logger.info('API subscription created from checkout', {
              subscriptionId: subscription.id,
              apiId: meta.api_id,
              orgId: meta.organization_id,
            });
          }
        }
        break;
      }

      // Invoice payment succeeded
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await markInvoicePaid(invoice.id);

        // If this is an enterprise custom invoice, upgrade org plan
        const invoiceMeta = (invoice.metadata ?? {}) as Record<string, string>;
        if (invoiceMeta.type === 'enterprise_custom' && invoiceMeta.organization_id) {
          const adminSb = createAdminClient();
          await adminSb
            .from('organizations')
            .update({ plan: 'enterprise', updated_at: new Date().toISOString() })
            .eq('id', invoiceMeta.organization_id);
          logger.info('Enterprise invoice paid — org upgraded to enterprise', {
            orgId: invoiceMeta.organization_id,
            invoiceId: invoice.id,
          });
        }
        break;
      }

      // Invoice payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice.id);

        // Fire initial dunning notification to subscription owner
        try {
          const adminSb = createAdminClient();
          const invoiceMeta = (invoice.metadata ?? {}) as Record<string, string>;
          const subId = invoiceMeta.subscription_id;
          if (subId) {
            const { data: sub } = await adminSb
              .from('api_subscriptions')
              .select('user_id, organization_id, api:apis(name)')
              .eq('id', subId)
              .maybeSingle();
            if (sub?.user_id) {
              const apiName = (sub.api as { name?: string } | null)?.name ?? 'your API';
              await dispatchNotification({
                type: 'billing.payment_failed',
                userId: sub.user_id,
                organizationId: sub.organization_id,
                title: 'Payment Failed – Action Required',
                body: `We were unable to charge your payment method for your ${apiName} subscription. Please update your billing details to avoid service interruption.`,
                link: '/dashboard/settings/billing',
                metadata: { subscription_id: subId, stripe_invoice_id: invoice.id },
              });
            }
          }
        } catch (notifyErr) {
          logger.error('Failed to send payment-failed notification', { error: notifyErr });
        }
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
        const adminSb = createAdminClient();
        // Look up the billing account by connect account (passed in account header for Connect events)
        const connectAccountId = (event as any).account as string | undefined;
        if (connectAccountId) {
          const { data: billingAccount } = await adminSb
            .from('billing_accounts')
            .select('organization_id')
            .eq('stripe_connect_account_id', connectAccountId)
            .maybeSingle();
          if (billingAccount?.organization_id) {
            // Record payout in provider earnings ledger if table exists
            void adminSb.from('provider_payouts').insert({
              organization_id: billingAccount.organization_id,
              stripe_payout_id: payout.id,
              amount: payout.amount / 100,
              currency: payout.currency,
              arrival_date: new Date((payout.arrival_date ?? Date.now() / 1000) * 1000).toISOString(),
              status: 'paid',
            });
          }
        }
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

      // Subscription created
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const adminSb = createAdminClient();
        // Find the internal subscription by stripe_subscription_id metadata
        const subId = subscription.metadata?.internal_subscription_id;
        if (subId) {
          await adminSb
            .from('api_subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'inactive',
              stripe_subscription_id: subscription.id,
            })
            .eq('id', subId);
        } else {
          // Fall back to looking up by stripe customer
          await adminSb
            .from('api_subscriptions')
            .update({ stripe_subscription_id: subscription.id })
            .eq('stripe_subscription_id', subscription.id);
        }
        logger.info('Stripe subscription created — synced', { subscriptionId: subscription.id });
        break;
      }

      // Subscription updated (plan change, status change, renewal)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const adminSb = createAdminClient();
        const newStatus =
          subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'cancelled'
          : 'inactive';

        // Check if this is a platform subscription
        const { data: platformSub } = await adminSb
          .from('platform_subscriptions')
          .select('organization_id, plan')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (platformSub) {
          const orgPlan = (newStatus === 'active') ? platformSub.plan : 'free';
          await adminSb
            .from('platform_subscriptions')
            .update({
              status: newStatus,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
          await adminSb
            .from('organizations')
            .update({ plan: orgPlan, updated_at: new Date().toISOString() })
            .eq('id', platformSub.organization_id);
          logger.info('Platform subscription updated', { subscriptionId: subscription.id, newStatus, orgPlan });
          break;
        }

        // Update by stripe_subscription_id
        const { data: updated } = await adminSb
          .from('api_subscriptions')
          .update({ status: newStatus })
          .eq('stripe_subscription_id', subscription.id)
          .select('id');
        if (!updated?.length) {
          // Try metadata fallback
          const subId = subscription.metadata?.internal_subscription_id;
          if (subId) {
            await adminSb
              .from('api_subscriptions')
              .update({ status: newStatus, stripe_subscription_id: subscription.id })
              .eq('id', subId);
          }
        }
        logger.info('Stripe subscription updated — synced', { subscriptionId: subscription.id, newStatus });
        break;
      }

      // Subscription deleted/cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const adminSb = createAdminClient();

        // Check if this is a platform subscription
        const { data: platformSub } = await adminSb
          .from('platform_subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (platformSub) {
          await adminSb
            .from('platform_subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id);
          await adminSb
            .from('organizations')
            .update({ plan: 'free', updated_at: new Date().toISOString() })
            .eq('id', platformSub.organization_id);
          logger.info('Platform subscription cancelled — org downgraded to free', { subscriptionId: subscription.id });
          break;
        }

        await adminSb
          .from('api_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);
        // Also try metadata-based lookup
        const subId = subscription.metadata?.internal_subscription_id;
        if (subId) {
          await adminSb
            .from('api_subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', subId);
        }
        logger.info('Stripe subscription deleted — subscription cancelled', { subscriptionId: subscription.id });
        break;
      }

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    // Mark event as processed for idempotency
    void adminSbIdempotent
      .from('processed_stripe_events')
      .insert({ id: event.id, event_type: event.type });

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
