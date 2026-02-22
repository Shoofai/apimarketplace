-- Track lead source (e.g. readiness_audit, contact, pricing)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text;
