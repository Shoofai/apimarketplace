-- platform_subscriptions: tracks Stripe subscriptions backing organizations.plan (pro tier)
CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  stripe_customer_id text NOT NULL,
  plan text NOT NULL DEFAULT 'pro',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (organization_id),
  UNIQUE (stripe_subscription_id)
);

ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

-- Members can read their org's platform subscription
CREATE POLICY "org members can read platform subscription"
  ON platform_subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert/update/delete
CREATE POLICY "service role manages platform subscriptions"
  ON platform_subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ai_allotments: daily free-tier AI generation counters per org (separate from credit_balances)
CREATE TABLE IF NOT EXISTS ai_allotments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  used integer NOT NULL DEFAULT 0,
  tier_limit integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, period_start)
);

ALTER TABLE ai_allotments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read ai allotments"
  ON ai_allotments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service role manages ai allotments"
  ON ai_allotments FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ai_allotments_org_period ON ai_allotments (organization_id, period_start);
