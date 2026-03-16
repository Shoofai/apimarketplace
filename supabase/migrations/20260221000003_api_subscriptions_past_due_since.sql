-- Add past_due_since to api_subscriptions for dunning tracking
ALTER TABLE api_subscriptions
  ADD COLUMN IF NOT EXISTS past_due_since TIMESTAMPTZ;
