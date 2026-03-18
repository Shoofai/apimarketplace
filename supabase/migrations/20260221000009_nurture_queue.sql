-- nurture_queue: scheduled outbound email/notification drip jobs.
-- Rows are created by nurture automation and processed by the process-nurture cron.

CREATE TABLE IF NOT EXISTS public.nurture_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  sequence text NOT NULL,
  step integer NOT NULL DEFAULT 1,
  template text NOT NULL,
  send_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error text,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  last_error text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nurture_queue_status_send ON public.nurture_queue (status, send_at)
  WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_nurture_queue_user ON public.nurture_queue (user_id);

ALTER TABLE public.nurture_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages nurture_queue"
  ON public.nurture_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
