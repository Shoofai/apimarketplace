-- Add processed_stripe_events table for webhook idempotency
-- Prevents duplicate processing if Stripe retries an event

CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id          TEXT PRIMARY KEY,            -- Stripe event ID (e.g. evt_...)
  event_type  TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-expire records after 30 days to keep the table small
CREATE INDEX IF NOT EXISTS processed_stripe_events_processed_at_idx
  ON processed_stripe_events (processed_at);

-- RLS: service role only (no user access needed)
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;
