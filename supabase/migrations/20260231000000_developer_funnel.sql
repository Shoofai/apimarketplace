-- Developer Funnel: developer_profiles, code_generations, api_test_sessions
-- Applied via MCP on 2026-02-22. This file is for source control tracking.

DO $$ BEGIN
  CREATE TYPE public.developer_stage AS ENUM (
    'landed',
    'api_explored',
    'code_generated',
    'signed_up',
    'api_key_created',
    'first_call_made',
    'active_user',
    'power_user',
    'churned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.developer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id uuid NOT NULL UNIQUE REFERENCES public.stakeholders(id) ON DELETE CASCADE,

  github_username text,
  primary_language text,
  experience_level text,
  use_case text,
  tech_stack text[],

  developer_stage public.developer_stage NOT NULL DEFAULT 'landed',
  stage_entered_at timestamptz DEFAULT now(),
  stage_history jsonb DEFAULT '[]'::jsonb,

  apis_explored integer DEFAULT 0,
  code_generations integer DEFAULT 0,
  api_keys_created integer DEFAULT 0,
  total_api_calls bigint DEFAULT 0,
  unique_apis_used integer DEFAULT 0,
  favorite_apis uuid[] DEFAULT '{}',

  first_code_gen_at timestamptz,
  first_code_gen_language text,
  first_api_call_at timestamptz,
  time_to_first_code_gen_seconds integer,
  time_to_first_api_call_seconds integer,

  preferred_language text DEFAULT 'javascript',
  preferred_framework text,
  dark_mode boolean DEFAULT true,

  referral_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by text,
  referrals_made integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_stakeholder ON public.developer_profiles(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_dev_stage ON public.developer_profiles(developer_stage);
CREATE INDEX IF NOT EXISTS idx_dev_referral ON public.developer_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_dev_github ON public.developer_profiles(github_username);

CREATE TABLE IF NOT EXISTS public.code_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES public.developer_profiles(id) ON DELETE SET NULL,
  session_id uuid,
  api_id uuid,
  api_name text NOT NULL,
  language text NOT NULL,
  framework text,
  generated_code text NOT NULL,
  code_quality_score numeric(3,2),
  was_copied boolean DEFAULT false,
  was_tested boolean DEFAULT false,
  test_result text,
  led_to_signup boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_codegen_developer ON public.code_generations(developer_id);
CREATE INDEX IF NOT EXISTS idx_codegen_session ON public.code_generations(session_id);
CREATE INDEX IF NOT EXISTS idx_codegen_api ON public.code_generations(api_id);

CREATE TABLE IF NOT EXISTS public.api_test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES public.developer_profiles(id) ON DELETE SET NULL,
  session_id uuid,
  api_id uuid,
  api_name text NOT NULL,
  endpoint_path text NOT NULL,
  http_method text NOT NULL,
  request_headers jsonb DEFAULT '{}'::jsonb,
  request_body jsonb,
  request_params jsonb,
  response_status integer,
  response_time_ms integer,
  response_body jsonb,
  response_headers jsonb,
  test_passed boolean,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_developer ON public.api_test_sessions(developer_id);
CREATE INDEX IF NOT EXISTS idx_test_session ON public.api_test_sessions(session_id);
