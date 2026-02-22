-- Split openapi_spec / openapi_raw off apis into api_specs for smaller apis rows.

CREATE TABLE api_specs (
  api_id uuid PRIMARY KEY REFERENCES apis(id) ON DELETE CASCADE,
  openapi_raw text,
  openapi_spec jsonb,
  openapi_spec_format text DEFAULT 'json',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_specs ENABLE ROW LEVEL SECURITY;

-- Read: org members can view specs for APIs in their orgs
CREATE POLICY "Org members can read api_specs"
  ON api_specs FOR SELECT
  USING (
    api_id IN (
      SELECT a.id FROM apis a
      WHERE a.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Insert/Update/Delete: org members can manage specs for APIs in their orgs
CREATE POLICY "Org members can insert api_specs"
  ON api_specs FOR INSERT
  WITH CHECK (
    api_id IN (
      SELECT a.id FROM apis a
      WHERE a.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Org members can update api_specs"
  ON api_specs FOR UPDATE
  USING (
    api_id IN (
      SELECT a.id FROM apis a
      WHERE a.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Org members can delete api_specs"
  ON api_specs FOR DELETE
  USING (
    api_id IN (
      SELECT a.id FROM apis a
      WHERE a.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Backfill from apis (apis may not have openapi_spec_format; default 'json')
INSERT INTO api_specs (api_id, openapi_raw, openapi_spec, openapi_spec_format)
SELECT id, openapi_raw, openapi_spec, 'json'
FROM apis
WHERE openapi_raw IS NOT NULL OR openapi_spec IS NOT NULL
ON CONFLICT (api_id) DO UPDATE SET
  openapi_raw = EXCLUDED.openapi_raw,
  openapi_spec = EXCLUDED.openapi_spec,
  openapi_spec_format = COALESCE(api_specs.openapi_spec_format, EXCLUDED.openapi_spec_format),
  updated_at = now();
