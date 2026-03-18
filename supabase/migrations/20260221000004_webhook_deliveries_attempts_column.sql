-- Rename attempt_number → attempts and add delivered_at to webhook_deliveries.
-- The retry-webhooks cron route uses `attempts` and `delivered_at`.

ALTER TABLE public.webhook_deliveries
  RENAME COLUMN attempt_number TO attempts;

ALTER TABLE public.webhook_deliveries
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
