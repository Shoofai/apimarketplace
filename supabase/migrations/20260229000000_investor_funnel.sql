-- Investor Funnel: investor_profiles, data room, traction_metrics, meeting_slots

-- Investor-specific profile extension
CREATE TABLE public.investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id uuid NOT NULL UNIQUE REFERENCES public.stakeholders(id) ON DELETE CASCADE,

  firm_name text,
  firm_type text,
  check_size_min numeric,
  check_size_max numeric,
  investment_stage text,
  sectors_of_interest text[],
  portfolio_companies text[],

  traction_dashboard_views integer DEFAULT 0,
  last_traction_view timestamptz,
  data_room_accessed boolean DEFAULT false,
  data_room_first_access timestamptz,
  data_room_documents_viewed text[] DEFAULT '{}',
  pitch_deck_viewed boolean DEFAULT false,
  pitch_deck_view_duration integer,

  meeting_requested boolean DEFAULT false,
  meeting_scheduled_at timestamptz,
  meeting_type text,
  meeting_notes text,

  verbal_commitment boolean DEFAULT false,
  commitment_amount numeric,
  safe_sent boolean DEFAULT false,
  safe_signed boolean DEFAULT false,
  wire_received boolean DEFAULT false,

  warmth_score integer DEFAULT 0,

  ai_summary text,
  ai_next_action text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_investor_profiles_stakeholder ON public.investor_profiles(stakeholder_id);
CREATE INDEX idx_investor_profiles_warmth ON public.investor_profiles(warmth_score DESC);

-- Data room documents
CREATE TABLE public.data_room_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  title text NOT NULL,
  description text,
  category text NOT NULL,
  file_url text NOT NULL,
  file_type text,

  access_level text NOT NULL DEFAULT 'nda_required',
  is_active boolean DEFAULT true,

  total_views integer DEFAULT 0,
  avg_view_duration integer DEFAULT 0,

  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data room access log (inserts via API with service role only)
CREATE TABLE public.data_room_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id uuid NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.data_room_documents(id) ON DELETE CASCADE,

  action text NOT NULL,
  view_duration integer,
  page_views jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_data_room_access_stakeholder ON public.data_room_access_log(stakeholder_id);
CREATE INDEX idx_data_room_access_document ON public.data_room_access_log(document_id);

-- Traction metrics
CREATE TABLE public.traction_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  metric_date date NOT NULL DEFAULT CURRENT_DATE,

  total_signups integer DEFAULT 0,
  weekly_active_users integer DEFAULT 0,
  monthly_active_users integer DEFAULT 0,

  total_apis_listed integer DEFAULT 0,
  total_api_calls bigint DEFAULT 0,
  api_calls_growth_pct numeric(5,2),

  mrr numeric(12,2) DEFAULT 0,
  arr numeric(12,2) DEFAULT 0,
  revenue_growth_pct numeric(5,2),

  total_providers integer DEFAULT 0,
  provider_growth_pct numeric(5,2),

  avg_session_duration integer,
  api_tests_per_user numeric(5,2),

  total_investor_leads integer DEFAULT 0,
  meetings_scheduled integer DEFAULT 0,
  commitments_received integer DEFAULT 0,
  capital_committed numeric(12,2) DEFAULT 0,

  created_at timestamptz DEFAULT now(),

  CONSTRAINT traction_metrics_metric_date_key UNIQUE (metric_date)
);

CREATE INDEX idx_traction_metrics_date ON public.traction_metrics(metric_date DESC);

-- Meeting slots
CREATE TABLE public.meeting_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  slot_date date NOT NULL,
  slot_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  timezone text NOT NULL DEFAULT 'America/New_York',

  is_available boolean DEFAULT true,
  booked_by uuid REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  meeting_type text,

  calendar_event_id text,
  video_link text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_meeting_slots_date ON public.meeting_slots(slot_date, slot_time);
CREATE INDEX idx_meeting_slots_available ON public.meeting_slots(is_available) WHERE is_available = true;

-- Trigger for investor_profiles updated_at
DROP TRIGGER IF EXISTS set_investor_profiles_updated_at ON public.investor_profiles;
CREATE TRIGGER set_investor_profiles_updated_at
  BEFORE UPDATE ON public.investor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_stakeholder_updated_at();

-- RLS
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traction_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors can view own profile"
  ON public.investor_profiles FOR SELECT
  USING (stakeholder_id IN (SELECT id FROM public.stakeholders WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages investor profiles"
  ON public.investor_profiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Active public documents visible"
  ON public.data_room_documents FOR SELECT
  USING (is_active = true AND access_level = 'public');

CREATE POLICY "Service role manages data room"
  ON public.data_room_documents FOR ALL
  USING (auth.role() = 'service_role');

-- data_room_access_log: no INSERT policy; API uses service role to log

CREATE POLICY "Service role manages data room access log"
  ON public.data_room_access_log FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Traction metrics publicly readable"
  ON public.traction_metrics FOR SELECT
  USING (true);

CREATE POLICY "Service role manages traction metrics"
  ON public.traction_metrics FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Available slots visible"
  ON public.meeting_slots FOR SELECT
  USING (is_available = true);

CREATE POLICY "Service role manages meeting slots"
  ON public.meeting_slots FOR ALL
  USING (auth.role() = 'service_role');
