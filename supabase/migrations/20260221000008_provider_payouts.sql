-- provider_payouts: ledger of Connect payouts credited to provider organizations.
-- Populated from Stripe payout.paid webhook events.

CREATE TABLE IF NOT EXISTS public.provider_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_payout_id text NOT NULL UNIQUE,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  arrival_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_payouts_org ON public.provider_payouts (organization_id);

ALTER TABLE public.provider_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own payouts"
  ON public.provider_payouts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages provider_payouts"
  ON public.provider_payouts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
