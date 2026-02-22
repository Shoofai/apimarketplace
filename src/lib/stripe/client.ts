import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

/**
 * Stripe client instance configured with the latest API version.
 * 
 * @see https://stripe.com/docs/api
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: {
    name: 'Apinergy',
    version: '1.0.0',
  },
});
