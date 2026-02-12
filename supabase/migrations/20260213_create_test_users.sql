-- Test Users Creation Script
-- All users use the same password: TestPass123!
-- Password hash generated with bcrypt (rounds=10)

-- Note: For Supabase Auth, users must be created through the Auth API or dashboard
-- This script creates the user records and organizations
-- You'll need to create the auth users separately or use the signup flow

-- Create test organizations first
INSERT INTO organizations (id, name, slug, type, plan, settings) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme API Corp', 'acme-api-corp', 'provider', 'enterprise', '{"verified": true}'),
  ('22222222-2222-2222-2222-222222222222', 'DevTools Inc', 'devtools-inc', 'provider', 'pro', '{"verified": true}'),
  ('33333333-3333-3333-3333-333333333333', 'Startup Studio', 'startup-studio', 'consumer', 'free', '{}'),
  ('44444444-4444-4444-4444-444444444444', 'Enterprise Corp', 'enterprise-corp', 'both', 'enterprise', '{"verified": true}'),
  ('55555555-5555-5555-5555-555555555555', 'Solo Developer', 'solo-dev', 'consumer', 'pro', '{}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  plan = EXCLUDED.plan;

-- Test user profiles will be created when they sign up
-- This script prepares their organizations and roles

-- Platform Admin User Profile
-- Email: admin@apimarketplace.pro
-- Role: Platform Administrator
-- Access: Full admin dashboard, feature flags, user management

-- Provider Users
-- Email: provider.enterprise@acme.com
-- Org: Acme API Corp (Enterprise Provider)
-- Role: Organization Owner
-- Has: Multiple published APIs, high revenue

-- Email: provider.pro@devtools.com  
-- Org: DevTools Inc (Pro Provider)
-- Role: Organization Owner
-- Has: 2-3 APIs, growing subscriber base

-- Developer Users
-- Email: developer.free@startup.com
-- Org: Startup Studio (Free Developer)
-- Role: Organization Owner
-- Has: 1-2 API subscriptions, testing features

-- Email: developer.enterprise@corp.com
-- Org: Enterprise Corp (Enterprise Developer + Provider)
-- Role: Organization Owner
-- Has: Multiple subscriptions, using governance features

-- Email: developer.pro@solo.dev
-- Org: Solo Developer (Pro Developer)
-- Role: Organization Owner
-- Has: Active subscriptions, using AI playground

-- Create organization members (will be linked after auth users are created)
-- These will be created automatically when users sign up and select their organization

COMMENT ON TABLE organizations IS 'Test organizations created for development/testing';
