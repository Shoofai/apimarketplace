-- Prelaunch allowlist: admin-added emails that bypass the prelaunch gate when signed in
CREATE TABLE IF NOT EXISTS prelaunch_allowlist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL UNIQUE,
  note       text,
  added_at   timestamptz NOT NULL DEFAULT now(),
  added_by   uuid        REFERENCES auth.users(id)
);

-- Prelaunch invite codes: shareable codes that grant early access without signing in
CREATE TABLE IF NOT EXISTS prelaunch_invite_codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text        NOT NULL UNIQUE,
  label       text,
  max_uses    int         NOT NULL DEFAULT 1,
  uses_count  int         NOT NULL DEFAULT 0,
  expires_at  timestamptz,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid        REFERENCES auth.users(id)
);

-- RLS: service-role (admin client) bypasses, everyone else denied
ALTER TABLE prelaunch_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE prelaunch_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_allowlist"
  ON prelaunch_allowlist USING (false);

CREATE POLICY "service_role_only_invite_codes"
  ON prelaunch_invite_codes USING (false);

-- Seed default site_mode in app_settings (mode = 'live', no message)
INSERT INTO app_settings (key, value, updated_at)
VALUES ('site_mode', '{"mode":"live","message":null}'::jsonb, now())
ON CONFLICT (key) DO NOTHING;
