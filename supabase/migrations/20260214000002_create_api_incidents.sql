-- API incidents for status page
CREATE TABLE IF NOT EXISTS api_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id uuid REFERENCES apis(id) ON DELETE CASCADE,
  severity text CHECK (severity IN ('minor', 'major', 'critical')),
  title text NOT NULL,
  description text,
  status text DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  started_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_api_incidents_api ON api_incidents(api_id);
CREATE INDEX IF NOT EXISTS idx_api_incidents_started ON api_incidents(started_at);

ALTER TABLE api_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read incidents for published APIs" ON api_incidents;
CREATE POLICY "Anyone can read incidents for published APIs"
  ON api_incidents FOR SELECT
  USING (
    api_id IN (SELECT id FROM apis WHERE status = 'published')
  );

DROP POLICY IF EXISTS "Providers can manage incidents for their APIs" ON api_incidents;
CREATE POLICY "Providers can manage incidents for their APIs"
  ON api_incidents FOR ALL
  USING (
    api_id IN (SELECT id FROM apis WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
  )
  WITH CHECK (
    api_id IN (SELECT id FROM apis WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
  );
