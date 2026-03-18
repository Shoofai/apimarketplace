-- api_key_reveals: stores plaintext API keys for 24h after checkout so the dashboard
-- can reveal them once to the user before they are discarded.

CREATE TABLE IF NOT EXISTS public.api_key_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.api_subscriptions(id) ON DELETE CASCADE,
  plaintext_key text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_key_reveals_subscription ON public.api_key_reveals (subscription_id);
CREATE INDEX IF NOT EXISTS idx_api_key_reveals_expires ON public.api_key_reveals (expires_at);

ALTER TABLE public.api_key_reveals ENABLE ROW LEVEL SECURITY;

-- Only the org member who owns the subscription can read (once); service role manages writes
CREATE POLICY "Org members can read own key reveals"
  ON public.api_key_reveals FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM public.api_subscriptions
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages api_key_reveals"
  ON public.api_key_reveals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
