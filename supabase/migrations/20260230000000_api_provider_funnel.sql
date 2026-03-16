-- API Provider Funnel: provider_profiles, provider_onboarding_events, revenue_projections

DO $$ BEGIN
  CREATE TYPE public.provider_stage AS ENUM (
    'discovered',
    'value_seen',
    'onboarding_started',
    'api_configured',
    'testing_complete',
    'pricing_set',
    'review_pending',
    'live',
    'earning',
    'churned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.api_import_method AS ENUM (
    'openapi_url',
    'openapi_upload',
    'postman_collection',
    'manual_config',
    'github_repo',
    'auto_detect'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id uuid NOT NULL UNIQUE REFERENCES public.stakeholders(id) ON DELETE CASCADE,

  company_name text,
  api_name text,
  api_description text,
  api_category text[],
  website_url text,
  docs_url text,

  provider_stage public.provider_stage NOT NULL DEFAULT 'discovered',
  stage_entered_at timestamptz DEFAULT now(),
  stage_history jsonb DEFAULT '[]'::jsonb,

  onboarding_progress integer DEFAULT 0,
  onboarding_steps_completed jsonb DEFAULT '{
    "account_created": false,
    "api_spec_uploaded": false,
    "endpoints_configured": false,
    "testing_passed": false,
    "pricing_set": false,
    "stripe_connected": false,
    "documentation_complete": false,
    "published": false
  }'::jsonb,

  import_method public.api_import_method,
  openapi_spec jsonb,
  total_endpoints integer DEFAULT 0,
  api_base_url text,

  stripe_account_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  stripe_payout_enabled boolean DEFAULT false,

  estimated_monthly_calls bigint DEFAULT 0,
  estimated_monthly_revenue numeric(12,2) DEFAULT 0,
  actual_monthly_revenue numeric(12,2) DEFAULT 0,
  total_revenue_earned numeric(12,2) DEFAULT 0,

  total_api_calls_received bigint DEFAULT 0,
  total_unique_consumers integer DEFAULT 0,
  avg_response_time_ms integer DEFAULT 0,
  uptime_pct numeric(5,2) DEFAULT 100.00,

  ai_generated_docs boolean DEFAULT false,
  ai_enhanced_description text,
  ai_suggested_pricing jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_prov_stakeholder ON public.provider_profiles(stakeholder_id);
CREATE INDEX idx_prov_stage ON public.provider_profiles(provider_stage);
CREATE INDEX idx_prov_stripe ON public.provider_profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.provider_onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,

  step_name text NOT NULL,
  step_status text NOT NULL,
  step_data jsonb DEFAULT '{}'::jsonb,
  error_message text,

  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_poe_provider ON public.provider_onboarding_events(provider_id);

CREATE TABLE IF NOT EXISTS public.revenue_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  api_category text NOT NULL,

  avg_monthly_calls_per_consumer bigint DEFAULT 10000,
  avg_consumers_first_month integer DEFAULT 5,
  avg_consumer_growth_pct numeric(5,2) DEFAULT 20.00,
  avg_price_per_1000_calls numeric(8,4) DEFAULT 1.00,
  platform_fee_pct numeric(5,2) DEFAULT 3.00,

  top_quartile_monthly_revenue numeric(12,2) DEFAULT 5000,
  median_monthly_revenue numeric(12,2) DEFAULT 1000,

  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_projections_category ON public.revenue_projections(api_category);

-- Stage transition: update stage_entered_at, stage_history, and stakeholders.funnel_stage
CREATE OR REPLACE FUNCTION public.track_provider_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.provider_stage IS DISTINCT FROM NEW.provider_stage THEN
    NEW.stage_entered_at = now();
    NEW.stage_history = OLD.stage_history || jsonb_build_array(
      jsonb_build_object(
        'from_stage', OLD.provider_stage,
        'to_stage', NEW.provider_stage,
        'transitioned_at', now()
      )
    );

    UPDATE public.stakeholders
    SET
      funnel_stage = CASE NEW.provider_stage
        WHEN 'value_seen' THEN 'engaged'::public.funnel_stage
        WHEN 'onboarding_started' THEN 'activated'::public.funnel_stage
        WHEN 'api_configured' THEN 'activated'::public.funnel_stage
        WHEN 'testing_complete' THEN 'converting'::public.funnel_stage
        WHEN 'live' THEN 'converted'::public.funnel_stage
        WHEN 'earning' THEN 'converted'::public.funnel_stage
        WHEN 'churned' THEN 'churned'::public.funnel_stage
        ELSE funnel_stage
      END,
      last_stage_change_at = now()
    WHERE id = NEW.stakeholder_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS provider_stage_change ON public.provider_profiles;
CREATE TRIGGER provider_stage_change
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.track_provider_stage_transition();

-- Auto-calculate onboarding progress from onboarding_steps_completed
CREATE OR REPLACE FUNCTION public.calculate_onboarding_progress()
RETURNS TRIGGER AS $$
DECLARE
  key text;
  total integer := 0;
  completed integer := 0;
BEGIN
  IF NEW.onboarding_steps_completed IS NOT NULL THEN
    FOR key IN SELECT jsonb_object_keys(NEW.onboarding_steps_completed)
    LOOP
      total := total + 1;
      IF (NEW.onboarding_steps_completed ->> key)::boolean THEN
        completed := completed + 1;
      END IF;
    END LOOP;
    NEW.onboarding_progress := CASE WHEN total > 0 THEN (completed * 100 / total) ELSE 0 END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_onboarding_progress ON public.provider_profiles;
CREATE TRIGGER auto_onboarding_progress
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.calculate_onboarding_progress();

-- updated_at trigger
DROP TRIGGER IF EXISTS set_provider_profiles_updated_at ON public.provider_profiles;
CREATE TRIGGER set_provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_stakeholder_updated_at();

-- RLS
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own provider profile"
  ON public.provider_profiles FOR SELECT
  USING (
    stakeholder_id IN (SELECT id FROM public.stakeholders WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role manages provider profiles"
  ON public.provider_profiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages onboarding events"
  ON public.provider_onboarding_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public can read revenue projections"
  ON public.revenue_projections FOR SELECT
  USING (true);

CREATE POLICY "Service role manages revenue projections"
  ON public.revenue_projections FOR ALL
  USING (auth.role() = 'service_role');

-- Seed revenue_projections by category
INSERT INTO public.revenue_projections (
  api_category,
  avg_monthly_calls_per_consumer,
  avg_consumers_first_month,
  avg_consumer_growth_pct,
  avg_price_per_1000_calls,
  platform_fee_pct,
  top_quartile_monthly_revenue,
  median_monthly_revenue
) VALUES
  ('payments', 25000, 8, 20.00, 2.00, 3.00, 8000, 2000),
  ('ai', 15000, 12, 25.00, 3.00, 3.00, 10000, 3000),
  ('data', 50000, 10, 18.00, 0.50, 3.00, 5000, 1500),
  ('communication', 20000, 6, 22.00, 1.50, 3.00, 6000, 1800),
  ('infrastructure', 100000, 5, 15.00, 0.30, 3.00, 4000, 1200),
  ('general', 10000, 5, 20.00, 1.00, 3.00, 5000, 1000)
ON CONFLICT (api_category) DO NOTHING;
