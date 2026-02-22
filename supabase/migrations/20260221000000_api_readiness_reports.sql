-- Production Readiness reports per API (quick or full audit)
CREATE TABLE IF NOT EXISTS api_readiness_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id uuid NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('quick', 'full')),
  payload jsonb NOT NULL DEFAULT '{}',
  score smallint CHECK (score >= 0 AND score <= 100),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_readiness_reports_api_created ON api_readiness_reports(api_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readiness_reports_org ON api_readiness_reports(organization_id);

ALTER TABLE api_readiness_reports ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can view reports for their org
DROP POLICY IF EXISTS "Org members can view readiness reports" ON api_readiness_reports;
CREATE POLICY "Org members can view readiness reports"
  ON api_readiness_reports FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- INSERT: org members can create reports for APIs owned by their org
DROP POLICY IF EXISTS "Org members can create readiness reports" ON api_readiness_reports;
CREATE POLICY "Org members can create readiness reports"
  ON api_readiness_reports FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM apis
      WHERE apis.id = api_readiness_reports.api_id
        AND apis.organization_id = api_readiness_reports.organization_id
    )
  );
