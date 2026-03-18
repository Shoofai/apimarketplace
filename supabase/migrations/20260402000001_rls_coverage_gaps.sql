-- RLS coverage gaps: enable RLS and add policies for tables that were missing them.
-- Identified via audit of pg_class.relrowsecurity and pg_policies.

-- ============================================================
-- 1. webhook_deliveries
--    Org members can read deliveries for their own endpoints.
--    Service role manages all rows.
-- ============================================================
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (
    webhook_endpoint_id IN (
      SELECT id FROM public.webhook_endpoints
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages webhook_deliveries"
  ON public.webhook_deliveries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 2. alert_deliveries
--    Scoped via alert_rules.organization_id.
-- ============================================================
ALTER TABLE public.alert_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own alert deliveries"
  ON public.alert_deliveries FOR SELECT
  USING (
    alert_rule_id IN (
      SELECT id FROM public.alert_rules
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages alert_deliveries"
  ON public.alert_deliveries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 3. alert_rules (RLS enabled, 0 policies → blocks all)
--    Org members manage their own alert rules.
-- ============================================================
CREATE POLICY "Org members can manage own alert rules"
  ON public.alert_rules FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages alert_rules"
  ON public.alert_rules FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 4. content_reports
--    Users see their own reports; admins (service role) see all.
-- ============================================================
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own content reports"
  ON public.content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own content reports"
  ON public.content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Service role manages content_reports"
  ON public.content_reports FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 5. api_versions
--    Publicly readable for published APIs; org members can manage.
-- ============================================================
ALTER TABLE public.api_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read api_versions for published APIs"
  ON public.api_versions FOR SELECT
  USING (
    api_id IN (
      SELECT id FROM public.apis WHERE status IN ('published', 'unclaimed') AND visibility = 'public'
    )
  );

CREATE POLICY "Org members can manage own api_versions"
  ON public.api_versions FOR ALL
  USING (
    api_id IN (
      SELECT id FROM public.apis WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    api_id IN (
      SELECT id FROM public.apis WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages api_versions"
  ON public.api_versions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 6. api_health_checks
--    Readable by api owners and subscribers; service role writes.
-- ============================================================
ALTER TABLE public.api_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read health checks for their APIs"
  ON public.api_health_checks FOR SELECT
  USING (
    api_id IN (
      SELECT id FROM public.apis WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages api_health_checks"
  ON public.api_health_checks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 7. sla_measurements
--    Readable by api org members; service role manages.
-- ============================================================
ALTER TABLE public.sla_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read sla_measurements for their APIs"
  ON public.sla_measurements FOR SELECT
  USING (
    api_id IN (
      SELECT id FROM public.apis WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages sla_measurements"
  ON public.sla_measurements FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 8. sla_violations
--    Readable by api org members; service role manages.
-- ============================================================
ALTER TABLE public.sla_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read sla_violations for their APIs"
  ON public.sla_violations FOR SELECT
  USING (
    api_id IN (
      SELECT id FROM public.apis WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages sla_violations"
  ON public.sla_violations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 9. usage_records_daily
--    Org-scoped reads; service role manages.
-- ============================================================
ALTER TABLE public.usage_records_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own usage_records_daily"
  ON public.usage_records_daily FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages usage_records_daily"
  ON public.usage_records_daily FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 10. usage_records_hourly
--     Org-scoped reads; service role manages.
-- ============================================================
ALTER TABLE public.usage_records_hourly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own usage_records_hourly"
  ON public.usage_records_hourly FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages usage_records_hourly"
  ON public.usage_records_hourly FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 11. contract_test_runs
--     Org members can read test runs for their APIs.
-- ============================================================
ALTER TABLE public.contract_test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own contract_test_runs"
  ON public.contract_test_runs FOR SELECT
  USING (
    api_id IN (
      SELECT id FROM public.apis WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages contract_test_runs"
  ON public.contract_test_runs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 12. contract_test_results
--     Scoped via test run → api → org.
-- ============================================================
ALTER TABLE public.contract_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own contract_test_results"
  ON public.contract_test_results FOR SELECT
  USING (
    test_run_id IN (
      SELECT id FROM public.contract_test_runs
      WHERE api_id IN (
        SELECT id FROM public.apis WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Service role manages contract_test_results"
  ON public.contract_test_results FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 13. migration_configs (migration_traffic_splits equiv)
--     Org-scoped reads; service role manages.
-- ============================================================
ALTER TABLE public.migration_traffic_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own migration_traffic_splits"
  ON public.migration_traffic_splits FOR SELECT
  USING (
    migration_id IN (
      SELECT id FROM public.migration_configs WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages migration_traffic_splits"
  ON public.migration_traffic_splits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.migration_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own migration_results"
  ON public.migration_results FOR SELECT
  USING (
    migration_id IN (
      SELECT id FROM public.migration_configs WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages migration_results"
  ON public.migration_results FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 14. market_trends / marketplace_metrics_daily
--     Read-only public/authenticated data; no user-specific data.
--     Allow authenticated reads; service role manages.
-- ============================================================
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read market_trends"
  ON public.market_trends FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages market_trends"
  ON public.market_trends FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.marketplace_metrics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read marketplace_metrics_daily"
  ON public.marketplace_metrics_daily FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages marketplace_metrics_daily"
  ON public.marketplace_metrics_daily FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 15. cache_invalidation_events
--     Internal/service only. Service role manages.
-- ============================================================
ALTER TABLE public.cache_invalidation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages cache_invalidation_events"
  ON public.cache_invalidation_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 16. api_compatibility_map
--     Publicly readable reference data; service role manages.
-- ============================================================
ALTER TABLE public.api_compatibility_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read api_compatibility_map"
  ON public.api_compatibility_map FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages api_compatibility_map"
  ON public.api_compatibility_map FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 17. Tables with RLS enabled but 0 policies (blocks all)
-- ============================================================

-- processed_stripe_events: service role only
CREATE POLICY "Service role manages processed_stripe_events"
  ON public.processed_stripe_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- provider_onboarding_events: org member can read events for their provider profile
CREATE POLICY "Users can read own provider_onboarding_events"
  ON public.provider_onboarding_events FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.provider_profiles WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages provider_onboarding_events"
  ON public.provider_onboarding_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- revenue_projections: read-only for authenticated (no user-specific data)
CREATE POLICY "Authenticated users can read revenue_projections"
  ON public.revenue_projections FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages revenue_projections"
  ON public.revenue_projections FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- workflow_step_results: org can read their own workflow executions' results
CREATE POLICY "Users can read own workflow_step_results"
  ON public.workflow_step_results FOR SELECT
  USING (
    execution_id IN (
      SELECT id FROM public.workflow_executions WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role manages workflow_step_results"
  ON public.workflow_step_results FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
