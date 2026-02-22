-- Seed default platform display name (used across the app; editable in Admin > Platform settings)
INSERT INTO app_settings (key, value, updated_at)
VALUES ('platform_name', '{"name": "Apinergy"}'::jsonb, now())
ON CONFLICT (key) DO NOTHING;
