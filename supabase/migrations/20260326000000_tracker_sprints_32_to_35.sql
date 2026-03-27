-- Sprint 32: Enterprise Features & Design Overhaul
-- Sprint 33: Branding & Typography
-- Sprint 34: Production Readiness Audit & Fixes
-- Sprint 35: Blog Import System
-- March 2026 implementation sprint tracking

DO $$
DECLARE
  v_sprint32_id uuid;
  v_sprint33_id uuid;
  v_sprint34_id uuid;
  v_sprint35_id uuid;
BEGIN
  -- ============================================================
  -- Sprint 32: Enterprise Features & Design Overhaul
  -- ============================================================
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    32,
    'Enterprise Features & Design Overhaul',
    'Phase 7: Enterprise hardening',
    'completed',
    1,
    'MFA/2FA, circuit breakers, GraphQL proxy, mock server, IP allowlisting, 11-language SDK, CSP nonces, homepage overhaul, Integration Hub, admin branding, FAB, PlatformLogo.',
    '2026-03-20'::timestamptz
  )
  RETURNING id INTO v_sprint32_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  (v_sprint32_id, 1, 'MFA/2FA enrollment with QR code and TOTP verification on login', 'security', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 2, 'Circuit breakers for Kong, Stripe, Resend with health endpoint reporting', 'backend', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 3, 'GraphQL proxy with schema introspection', 'backend', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 4, 'Mock server with configurable endpoints and CRUD config', 'backend', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 5, 'IP allowlisting with CIDR matching and org governance', 'security', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 6, 'SDK code generation expanded to 11 languages', 'backend', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 7, 'CSP nonces and security header hardening', 'security', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 8, 'Homepage overhaul: removed redundant sections, enhanced ProblemStatement, EnterpriseTrust section', 'frontend', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 9, 'TechShowcase updated to 11 languages with scrollable tabs', 'frontend', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 10, 'Hero badge with live stats and pulsing green dot', 'frontend', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 11, 'Admin Integration Hub — 9 services with status monitoring', 'admin', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 12, 'Admin branding page with Supabase Storage upload', 'admin', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 13, 'Floating Quick Actions FAB — context-aware per page', 'frontend', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 14, 'Keep me logged in toggle on login page', 'frontend', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 15, 'Footer locked links gate through middleware redirect', 'frontend', true, '2026-03-20'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint32_id, 'MFA/2FA enrollment and login verification', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 'Circuit breakers for 3 external services', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 'GraphQL proxy + mock server + IP allowlisting', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, '11-language SDK generation', true, '2026-03-19'::timestamptz),
  (v_sprint32_id, 'Homepage redesign with enterprise trust signals', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 'Admin Integration Hub and branding upload', true, '2026-03-20'::timestamptz),
  (v_sprint32_id, 'Floating Quick Actions FAB', true, '2026-03-20'::timestamptz);

  -- ============================================================
  -- Sprint 33: Branding & Typography
  -- ============================================================
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    33,
    'Branding & Typography',
    'Phase 7: Enterprise hardening',
    'completed',
    1,
    'SVG logo system, full rebrand (64 refs Apinergy/KineticAPI → LukeAPI), Inter heading font, typography optimization, package metadata updates.',
    '2026-03-21'::timestamptz
  )
  RETURNING id INTO v_sprint33_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  (v_sprint33_id, 1, 'SVG logo system replacing emoji across all brand touchpoints', 'frontend', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 2, 'PlatformLogo component with dark/light mode variants', 'frontend', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 3, 'Full rebrand: 64 references Apinergy/KineticAPI → LukeAPI (30 files)', 'all', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 4, 'Font swap: Bricolage Grotesque → Inter for headings', 'frontend', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 5, 'Typography optimization: weights, letter-spacing, hero scaling', 'frontend', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 6, 'Package metadata updated (CLI, VS Code extension, GitHub Action)', 'devops', true, '2026-03-21'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint33_id, 'Complete rebrand with zero remaining old name references', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 'SVG logo with Supabase Storage upload system', true, '2026-03-21'::timestamptz),
  (v_sprint33_id, 'Inter font with optimized typography scale', true, '2026-03-21'::timestamptz);

  -- ============================================================
  -- Sprint 34: Production Readiness Audit & Fixes
  -- ============================================================
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    34,
    'Production Readiness Audit & Fixes',
    'Phase 7: Enterprise hardening',
    'completed',
    1,
    'Full architecture audit (594 files, 157 routes), P0 blockers fixed (Vercel FS, credit race, idempotency), P1 fixes (JWT middleware, cron pagination, E2E fixtures), P2/P3 (proxy sanitization, GDPR atomicity, preflight), 215+ tests.',
    '2026-03-23'::timestamptz
  )
  RETURNING id INTO v_sprint34_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  -- P0 fixes
  (v_sprint34_id, 1, 'P0: Replace writeFile() in branding upload with Supabase Storage (Vercel blocker)', 'security', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, 2, 'P0: Atomic credit deduction via optimistic locking (race condition fix)', 'backend', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, 3, 'P0: Subscription idempotency with idempotency-key header', 'backend', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, 4, 'P0: Error logging on fire-and-forget operations (no silent failures)', 'backend', true, '2026-03-22'::timestamptz),
  -- P1 fixes
  (v_sprint34_id, 5, 'P1: Middleware JWT payload validation (exp + sub claims)', 'security', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, 6, 'P1: Cron job pagination for Vercel timeout compliance (4 routes)', 'backend', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, 7, 'P1: E2E test fixture with seeded user fallbacks (4 tests unblocked)', 'testing', true, '2026-03-22'::timestamptz),
  -- P2/P3 fixes
  (v_sprint34_id, 8, 'P2: Proxy header sanitization (whitelist-only forwarding)', 'security', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 9, 'P2: GDPR deletion atomicity with step-by-step error tracking', 'backend', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 10, 'P2: Kong rollback verification with critical logging', 'backend', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 11, 'P3: Vercel preflight script (npm run preflight)', 'devops', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 12, 'P3: Supabase Storage bucket auto-creation on startup', 'devops', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 13, 'P3: Cron re-invocation utility for hasMore pagination', 'backend', true, '2026-03-23'::timestamptz),
  -- Test suite
  (v_sprint34_id, 14, 'Auth middleware tests (30 test cases)', 'testing', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 15, 'Billing/subscription tests (18 test cases)', 'testing', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 16, 'Utility + validation tests (30 test cases)', 'testing', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 17, 'RLS verification tests (12 test cases)', 'testing', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 18, 'Stripe integration tests (12 test cases)', 'testing', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 19, 'Component tests for critical forms (10 test cases)', 'testing', true, '2026-03-23'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint34_id, '4 P0 critical blockers resolved (Vercel-safe)', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, '3 P1 high-priority fixes (auth, cron, tests)', true, '2026-03-22'::timestamptz),
  (v_sprint34_id, '6 P2/P3 improvements (proxy, GDPR, preflight)', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, '136 new unit tests (79 → 215+ total)', true, '2026-03-23'::timestamptz),
  (v_sprint34_id, 'Deployment confidence: 65% → 100%', true, '2026-03-23'::timestamptz);

  -- ============================================================
  -- Sprint 35: Blog Import System
  -- ============================================================
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    35,
    'Blog Import System',
    'Phase 7: Enterprise hardening',
    'completed',
    1,
    'Config-driven blog import from Google Sheets/Drive, CLI + admin UI, public blog pages at /blog with MDX rendering.',
    '2026-03-26'::timestamptz
  )
  RETURNING id INTO v_sprint35_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  (v_sprint35_id, 1, 'Blog import config system with Zod validation', 'backend', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 2, 'Google OAuth2 auth flow with token persistence', 'backend', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 3, 'Import engine: Sheet manifest → Drive articles → MDX generation', 'backend', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 4, 'CLI: blog:auth, blog:import, blog:import:dry scripts', 'devops', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 5, 'Blog listing page at /blog with grid layout', 'frontend', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 6, 'Blog post page at /blog/[slug] with prose typography', 'frontend', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 7, 'Admin blog import UI with manifest preview and selective import', 'admin', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 8, 'API routes for manifest fetch and import execution', 'backend', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 9, 'Blog link added to public nav and footer', 'frontend', true, '2026-03-26'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint35_id, 'Blog import system (CLI + admin UI)', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 'Public blog pages (/blog, /blog/[slug])', true, '2026-03-26'::timestamptz),
  (v_sprint35_id, 'Google Drive integration for content sourcing', true, '2026-03-26'::timestamptz);

END $$;
