-- Add feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL UNIQUE,
  flag_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert launch page flag
INSERT INTO feature_flags (flag_key, flag_name, description, is_enabled)
VALUES 
  ('launch_page_enabled', 'Launch Page', 'Show marketing launch page instead of app home', false),
  ('maintenance_mode', 'Maintenance Mode', 'Put the site in maintenance mode', false),
  ('new_signups_enabled', 'New Signups', 'Allow new user registrations', true),
  ('ai_playground_enabled', 'AI Playground', 'Enable AI code playground features', true)
ON CONFLICT (flag_key) DO NOTHING;

-- Add index
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow platform admins to manage feature flags
CREATE POLICY "Platform admins can manage feature flags"
  ON feature_flags FOR ALL
  USING ((SELECT is_platform_admin FROM users WHERE id = auth.uid()) = true);

-- Allow everyone to read feature flags
CREATE POLICY "Everyone can read feature flags"
  ON feature_flags FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE feature_flags IS 'Global feature flags for platform configuration';
