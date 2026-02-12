import { stripe } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

/**
 * Creates a Stripe customer for an organization.
 * 
 * @param email - Customer email
 * @param organizationId - Organization UUID
 * @param organizationName - Organization name
 * @returns Stripe Customer object
 */
export async function createCustomer(
  email: string,
  organizationId: string,
  organizationName: string
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name: organizationName,
      metadata: {
        organization_id: organizationId,
      },
    });

    // Save to database
    const supabase = createAdminClient();
    await supabase
      .from('billing_accounts')
      .upsert({
        organization_id: organizationId,
        stripe_customer_id: customer.id,
        billing_email: email,
      });

    logger.info('Stripe customer created', {
      organizationId,
      customerId: customer.id,
    });

    return customer;
  } catch (error) {
    logger.error('Failed to create Stripe customer', { error, organizationId });
    throw error;
  }
}

/**
 * Attaches a payment method to a customer.
 * 
 * @param customerId - Stripe Customer ID
 * @param paymentMethodId - Stripe Payment Method ID
 * @returns Updated Payment Method
 */
export async function addPaymentMethod(customerId: string, paymentMethodId: string) {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update database
    const supabase = createAdminClient();
    await supabase
      .from('billing_accounts')
      .update({
        default_payment_method_id: paymentMethodId,
      })
      .eq('stripe_customer_id', customerId);

    logger.info('Payment method added', { customerId, paymentMethodId });

    return paymentMethod;
  } catch (error) {
    logger.error('Failed to add payment method', { error, customerId });
    throw error;
  }
}

/**
 * Lists all payment methods for a customer.
 * 
 * @param customerId - Stripe Customer ID
 * @returns Array of Payment Methods
 */
export async function listPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    logger.error('Failed to list payment methods', { error, customerId });
    throw error;
  }
}

/**
 * Detaches a payment method from a customer.
 * 
 * @param paymentMethodId - Stripe Payment Method ID
 */
export async function removePaymentMethod(paymentMethodId: string) {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    logger.info('Payment method removed', { paymentMethodId });
  } catch (error) {
    logger.error('Failed to remove payment method', { error, paymentMethodId });
    throw error;
  }
}

/**
 * Retrieves a customer by ID.
 * 
 * @param customerId - Stripe Customer ID
 * @returns Customer object
 */
export async function getCustomer(customerId: string) {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    logger.error('Failed to retrieve customer', { error, customerId });
    throw error;
  }
}

/**
 * Updates customer information.
 * 
 * @param customerId - Stripe Customer ID
 * @param updates - Fields to update
 * @returns Updated Customer object
 */
export async function updateCustomer(
  customerId: string,
  updates: {
    email?: string;
    name?: string;
    address?: Stripe.AddressParam;
  }
) {
  try {
    const customer = await stripe.customers.update(customerId, updates);

    // Sync to database
    const supabase = createAdminClient();
    if (updates.email) {
      await supabase
        .from('billing_accounts')
        .update({ billing_email: updates.email })
        .eq('stripe_customer_id', customerId);
    }

    logger.info('Customer updated', { customerId });

    return customer;
  } catch (error) {
    logger.error('Failed to update customer', { error, customerId });
    throw error;
  }
}
