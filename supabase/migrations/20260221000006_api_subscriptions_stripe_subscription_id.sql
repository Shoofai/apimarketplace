-- Add stripe_subscription_id to api_subscriptions for Stripe webhook sync.
-- This is used to correlate Stripe subscription lifecycle events back to internal subscriptions.

ALTER TABLE public.api_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

CREATE INDEX IF NOT EXISTS idx_api_subscriptions_stripe_sub
  ON public.api_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
