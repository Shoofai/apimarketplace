-- Sprint 30: Production automation & self-sustainability
-- Sprint 31: Access gate, auth hardening & link audit
-- Implemented per plan; recorded in tracker and changelog.

DO $$
DECLARE
  v_sprint30_id uuid;
  v_sprint31_id uuid;
BEGIN
  -- Sprint 30: Production automation & self-sustainability
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    30,
    'Production automation & self-sustainability',
    'Phase 6: Post-launch changelog',
    'completed',
    1,
    'Cron routes (invoices, dunning, webhooks retry, nurture, API health, expiring keys); Sentry; rate limiting; Stripe idempotency; feature flags (ai_playground, workflows, new_signups).',
    '2026-02-21'::timestamptz
  )
  RETURNING id INTO v_sprint30_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  (v_sprint30_id, 1, 'Cron: generate-invoices, process-dunning, retry-webhooks, process-nurture, check-api-health, notify-expiring-keys', 'backend', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 2, 'Sentry integration (instrumentation, error boundary, onRequestError)', 'devops', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 3, 'Rate limiting enforcement in middleware for /api/*', 'backend', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 4, 'Stripe webhook idempotency (processed_stripe_events); dunning (past_due_since, notifications)', 'backend', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 5, 'Feature flags: ai_playground, workflows, new_signups gating', 'backend', true, '2026-02-21'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint30_id, 'Cron jobs for invoices, dunning, webhook retry, nurture, API health, expiring keys', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 'Sentry error monitoring and request error capture', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 'API rate limiting (authenticated vs unauthenticated)', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 'Stripe idempotency and dunning flow with notifications', true, '2026-02-21'::timestamptz),
  (v_sprint30_id, 'Feature-flag gating for Playground, Workflows, Signup', true, '2026-02-21'::timestamptz);

  -- Sprint 31: Access gate, auth hardening & link audit
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    31,
    'Access gate, auth hardening & link audit',
    'Phase 6: Post-launch changelog',
    'completed',
    1,
    'FeatureGate & AccessDenied components; secure PATCH feature-flags; is_platform_admin on admin pages; redirect URL preservation; broken links fixed.',
    '2026-02-21'::timestamptz
  )
  RETURNING id INTO v_sprint31_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  (v_sprint31_id, 1, 'withPlatformAdmin on PATCH /api/admin/feature-flags', 'backend', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 2, 'is_platform_admin on admin nurture, analytics, enterprise, credits, bundles', 'backend', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 3, 'FeatureGate and AccessDenied components; plan gate on Workflows and Collab', 'frontend', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 4, 'Dashboard layout: preserve redirect URL when session expires (x-pathname)', 'frontend', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 5, 'Fix OnboardingChecklist team link and CommandPalette Publish New API link', 'frontend', true, '2026-02-21'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint31_id, 'Secure admin routes and standardize is_platform_admin', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 'FeatureGate upgrade prompt and AccessDenied 403 UI', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 'Login redirect URL preservation from dashboard', true, '2026-02-21'::timestamptz),
  (v_sprint31_id, 'OnboardingChecklist and CommandPalette link fixes', true, '2026-02-21'::timestamptz);
END $$;
