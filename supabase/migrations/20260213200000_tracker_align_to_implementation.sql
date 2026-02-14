-- Align Implementation Tracker to actual codebase (audit 2026-02-13)
-- Mapping: Phase 1 (1-4) auth, orgs, API catalog; Phase 2 (5-12) publish, marketplace, subs, Kong, usage, billing, docs, provider;
-- Phase 3 (13-17) AI playground/sandbox/workflows/collab; Phase 4 (18-20) analytics, feature flags, webhooks; (21-22) versioning/rate limits partial;
-- Phase 5 (23-26) admin, audit logs, health, docs; (27-28) launch not started.
-- What is pending to complete sprints 21, 22, 25, 27, 28: see docs/TRACKER_PENDING.md

-- Phase 1: Foundation (all implemented)
UPDATE implementation_sprints SET status = 'completed' WHERE sprint_number IN (1, 2, 3, 4);

-- Phase 2: Core Marketplace (all implemented: publish, marketplace, subscriptions, Kong gateway, usage, billing, docs, provider dashboard)
UPDATE implementation_sprints SET status = 'completed' WHERE sprint_number IN (5, 6, 7, 8, 9, 10, 11, 12);

-- Phase 3: Killer Features (AI playground, sandbox, workflows UI, collab)
UPDATE implementation_sprints SET status = 'completed' WHERE sprint_number IN (13, 14, 15, 16, 17);

-- Phase 4: Advanced (analytics, feature flags, webhooks done; versioning/rate limits partial)
UPDATE implementation_sprints SET status = 'completed' WHERE sprint_number IN (18, 19, 20);
UPDATE implementation_sprints SET status = 'in_progress' WHERE sprint_number IN (21, 22);

-- Phase 5: Admin done, audit logs used, monitoring has health endpoint, docs/legal done; launch/go-live not done
UPDATE implementation_sprints SET status = 'completed' WHERE sprint_number IN (23, 24, 26);
UPDATE implementation_sprints SET status = 'in_progress' WHERE sprint_number = 25;
UPDATE implementation_sprints SET status = 'not_started' WHERE sprint_number IN (27, 28);

-- Optional: set completed_at for completed sprints (so progress % reflects reality)
UPDATE implementation_sprints SET completed_at = COALESCE(updated_at, created_at, now()) WHERE status = 'completed';

-- Update sprint names to match implementation (clearer labels)
UPDATE implementation_sprints SET name = 'Project setup & tooling' WHERE sprint_number = 1;
UPDATE implementation_sprints SET name = 'Auth & user model' WHERE sprint_number = 2;
UPDATE implementation_sprints SET name = 'Organizations & roles' WHERE sprint_number = 3;
UPDATE implementation_sprints SET name = 'API catalog & schema' WHERE sprint_number = 4;
UPDATE implementation_sprints SET name = 'API publishing flow' WHERE sprint_number = 5;
UPDATE implementation_sprints SET name = 'Marketplace browse & search' WHERE sprint_number = 6;
UPDATE implementation_sprints SET name = 'Subscriptions & plans' WHERE sprint_number = 7;
UPDATE implementation_sprints SET name = 'Kong API gateway integration' WHERE sprint_number = 8;
UPDATE implementation_sprints SET name = 'Usage metering & analytics' WHERE sprint_number = 9;
UPDATE implementation_sprints SET name = 'Billing & Stripe payments' WHERE sprint_number = 10;
UPDATE implementation_sprints SET name = 'Developer portal & API docs' WHERE sprint_number = 11;
UPDATE implementation_sprints SET name = 'Provider dashboard' WHERE sprint_number = 12;
UPDATE implementation_sprints SET name = 'AI code generation (explain/debug)' WHERE sprint_number = 13;
UPDATE implementation_sprints SET name = 'AI Playground' WHERE sprint_number = 14;
UPDATE implementation_sprints SET name = 'API Sandbox & testing' WHERE sprint_number = 15;
UPDATE implementation_sprints SET name = 'Workflows automation (UI + engine)' WHERE sprint_number = 16;
UPDATE implementation_sprints SET name = 'Collaborative testing' WHERE sprint_number = 17;
UPDATE implementation_sprints SET name = 'Advanced analytics & usage dashboard' WHERE sprint_number = 18;
UPDATE implementation_sprints SET name = 'Feature flags (admin)' WHERE sprint_number = 19;
UPDATE implementation_sprints SET name = 'Webhooks & Stripe events' WHERE sprint_number = 20;
UPDATE implementation_sprints SET name = 'API versioning' WHERE sprint_number = 21;
UPDATE implementation_sprints SET name = 'Rate limits & quotas' WHERE sprint_number = 22;
UPDATE implementation_sprints SET name = 'Admin & moderation (users, orgs, API review)' WHERE sprint_number = 23;
UPDATE implementation_sprints SET name = 'Audit logs & compliance' WHERE sprint_number = 24;
UPDATE implementation_sprints SET name = 'Monitoring & health checks' WHERE sprint_number = 25;
UPDATE implementation_sprints SET name = 'Documentation & onboarding' WHERE sprint_number = 26;
UPDATE implementation_sprints SET name = 'Launch preparation' WHERE sprint_number = 27;
UPDATE implementation_sprints SET name = 'Go-live & support' WHERE sprint_number = 28;

-- Mark the single placeholder task as completed for completed sprints (so task progress matches)
UPDATE sprint_tasks t
SET is_completed = true, completed_at = now()
FROM implementation_sprints s
WHERE t.sprint_id = s.id AND s.status = 'completed';

-- Mark the single placeholder deliverable as completed for completed sprints
UPDATE sprint_deliverables d
SET is_completed = true, completed_at = now()
FROM implementation_sprints s
WHERE d.sprint_id = s.id AND s.status = 'completed';
