-- Stakeholder Capture & Auto-Segmentation System
-- Enums
DO $$ BEGIN
  CREATE TYPE public.stakeholder_type AS ENUM (
    'investor',
    'api_provider',
    'developer',
    'enterprise_buyer',
    'unknown'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.capture_source AS ENUM (
    'landing_page',
    'product_hunt',
    'linkedin',
    'twitter',
    'referral',
    'blog',
    'api_docs',
    'google_ads',
    'cold_outreach',
    'event',
    'organic_search',
    'direct',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.funnel_stage AS ENUM (
    'captured',
    'segmented',
    'activated',
    'engaged',
    'qualified',
    'converting',
    'converted',
    'churned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Master stakeholder table
CREATE TABLE IF NOT EXISTS public.stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  company_name text,
  job_title text,
  linkedin_url text,
  avatar_url text,
  stakeholder_type public.stakeholder_type NOT NULL DEFAULT 'unknown',
  segmentation_confidence numeric(3,2) CHECK (segmentation_confidence BETWEEN 0 AND 1),
  segmentation_signals jsonb DEFAULT '[]'::jsonb,
  manually_overridden boolean DEFAULT false,
  funnel_stage public.funnel_stage NOT NULL DEFAULT 'captured',
  funnel_entered_at timestamptz DEFAULT now(),
  last_stage_change_at timestamptz DEFAULT now(),
  capture_source public.capture_source NOT NULL DEFAULT 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer_url text,
  landing_page_url text,
  engagement_score integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  total_interactions integer DEFAULT 0,
  ip_address inet,
  user_agent text,
  geo_country text,
  geo_city text,
  timezone text,
  preferred_language text DEFAULT 'en',
  marketing_consent boolean DEFAULT false,
  privacy_accepted boolean DEFAULT false,
  consent_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stakeholders_type ON public.stakeholders(stakeholder_type);
CREATE INDEX IF NOT EXISTS idx_stakeholders_stage ON public.stakeholders(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_stakeholders_email ON public.stakeholders(email);
CREATE INDEX IF NOT EXISTS idx_stakeholders_engagement ON public.stakeholders(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_stakeholders_source ON public.stakeholders(capture_source);
CREATE INDEX IF NOT EXISTS idx_stakeholders_last_activity ON public.stakeholders(last_activity_at DESC);

-- Interaction tracking table
CREATE TABLE IF NOT EXISTS public.stakeholder_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id uuid NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  interaction_data jsonb DEFAULT '{}'::jsonb,
  page_url text,
  session_id text,
  score_delta integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_stakeholder ON public.stakeholder_interactions(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.stakeholder_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON public.stakeholder_interactions(created_at DESC);

-- Segmentation rules table
CREATE TABLE IF NOT EXISTS public.segmentation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_type public.stakeholder_type NOT NULL,
  rule_name text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  conditions jsonb NOT NULL,
  confidence_boost numeric(3,2) DEFAULT 0.2,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_segmentation_rules_type_name ON public.segmentation_rules(stakeholder_type, rule_name);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_stakeholder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_stakeholders_updated_at ON public.stakeholders;
CREATE TRIGGER set_stakeholders_updated_at
  BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW EXECUTE FUNCTION public.handle_stakeholder_updated_at();

DROP TRIGGER IF EXISTS set_segmentation_rules_updated_at ON public.segmentation_rules;
CREATE TRIGGER set_segmentation_rules_updated_at
  BEFORE UPDATE ON public.segmentation_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_stakeholder_updated_at();

-- RPC for atomic engagement score increment
CREATE OR REPLACE FUNCTION public.increment_engagement(
  p_stakeholder_id uuid,
  p_score_delta integer
)
RETURNS void AS $$
BEGIN
  UPDATE public.stakeholders
  SET
    engagement_score = engagement_score + p_score_delta,
    total_interactions = total_interactions + 1,
    last_activity_at = now(),
    updated_at = now()
  WHERE id = p_stakeholder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segmentation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stakeholder record" ON public.stakeholders;
CREATE POLICY "Users can view own stakeholder record"
  ON public.stakeholders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access to stakeholders" ON public.stakeholders;
CREATE POLICY "Service role has full access to stakeholders"
  ON public.stakeholders FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view own interactions" ON public.stakeholder_interactions;
CREATE POLICY "Users can view own interactions"
  ON public.stakeholder_interactions FOR SELECT
  USING (
    stakeholder_id IN (
      SELECT id FROM public.stakeholders WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role has full access to interactions" ON public.stakeholder_interactions;
CREATE POLICY "Service role has full access to interactions"
  ON public.stakeholder_interactions FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated users can read segmentation rules" ON public.segmentation_rules;
CREATE POLICY "Authenticated users can read segmentation rules"
  ON public.segmentation_rules FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role can manage segmentation rules" ON public.segmentation_rules;
CREATE POLICY "Service role can manage segmentation rules"
  ON public.segmentation_rules FOR ALL
  USING (auth.role() = 'service_role');

-- Seed default segmentation rules
INSERT INTO public.segmentation_rules (stakeholder_type, rule_name, priority, conditions, confidence_boost) VALUES
  ('investor', 'VC job title', 100, '{"job_title_keywords": ["investor", "partner", "vc", "venture", "angel", "managing director", "principal", "associate", "fund manager", "portfolio"]}', 0.4),
  ('investor', 'Investment firm domain', 90, '{"company_keywords": ["capital", "ventures", "fund", "partners", "investment", "holdings"]}', 0.3),
  ('investor', 'Investor UTM', 95, '{"utm_campaign_keywords": ["investor", "fundraise", "seed", "pitch"]}', 0.5),
  ('api_provider', 'API/Platform job title', 100, '{"job_title_keywords": ["api", "platform", "developer relations", "devrel", "product manager", "integration", "partnership"]}', 0.35),
  ('api_provider', 'Provider UTM', 95, '{"utm_campaign_keywords": ["provider", "publish", "monetize", "distribute"]}', 0.5),
  ('api_provider', 'Provider landing page', 85, '{"landing_page_contains": ["/providers", "/publish", "/monetize", "/list-your-api"]}', 0.4),
  ('developer', 'Developer job title', 100, '{"job_title_keywords": ["developer", "engineer", "programmer", "coder", "devops", "sre", "architect", "tech lead", "full stack", "backend", "frontend"]}', 0.4),
  ('developer', 'Developer email domain', 70, '{"email_domain_keywords": ["gmail.com", "outlook.com", "protonmail.com"]}', 0.1),
  ('developer', 'Developer UTM', 95, '{"utm_campaign_keywords": ["developer", "dev", "api-docs", "integration", "sdk"]}', 0.5),
  ('developer', 'Docs landing page', 85, '{"landing_page_contains": ["/docs", "/api", "/playground", "/explore"]}', 0.4),
  ('enterprise_buyer', 'Enterprise job title', 100, '{"job_title_keywords": ["cto", "cio", "vp engineering", "director", "head of", "chief", "enterprise", "procurement", "it manager", "security"]}', 0.4),
  ('enterprise_buyer', 'Enterprise company size', 80, '{"company_keywords": ["inc", "corp", "ltd", "group", "enterprise", "global"]}', 0.15),
  ('enterprise_buyer', 'Enterprise UTM', 95, '{"utm_campaign_keywords": ["enterprise", "governance", "compliance", "security", "sso"]}', 0.5),
  ('enterprise_buyer', 'Enterprise landing page', 85, '{"landing_page_contains": ["/enterprise", "/governance", "/security", "/compliance"]}', 0.4)
ON CONFLICT (stakeholder_type, rule_name) DO NOTHING;
