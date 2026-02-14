-- Implementation Tracker: ensure tables exist and seed 28 sprints with sample tasks/deliverables
-- Tables may already exist; we only insert seed data when implementation_sprints is empty.

-- Create implementation_sprints if not exists (match existing schema from types)
CREATE TABLE IF NOT EXISTS implementation_sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_number int NOT NULL UNIQUE,
  name text NOT NULL,
  phase text NOT NULL,
  status text DEFAULT 'not_started',
  duration_weeks int NOT NULL DEFAULT 2,
  dependencies int[] DEFAULT '{}',
  notes text,
  description text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sprint_tasks if not exists (include is_completed for UI/API)
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES implementation_sprints(id) ON DELETE CASCADE,
  task_number int NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'development',
  description text,
  notes text,
  status text DEFAULT 'not_started',
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);

-- Create sprint_deliverables if not exists (use 'name' to match types; API can alias to title)
CREATE TABLE IF NOT EXISTS sprint_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES implementation_sprints(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sprint_deliverables_sprint_id ON sprint_deliverables(sprint_id);

-- Add is_completed to sprint_tasks if table existed with older schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sprint_tasks' AND column_name = 'is_completed') THEN
    NULL;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sprint_tasks') THEN
    ALTER TABLE sprint_tasks ADD COLUMN is_completed boolean DEFAULT false;
  END IF;
END $$;

-- Seed 28 sprints only when table is empty
INSERT INTO implementation_sprints (sprint_number, name, phase, duration_weeks, status)
SELECT n, name, phase, 2, 'not_started' FROM (VALUES
  (1, 'Project setup & tooling', 'Phase 1: Foundation'),
  (2, 'Auth & user model', 'Phase 1: Foundation'),
  (3, 'Organizations & roles', 'Phase 1: Foundation'),
  (4, 'API catalog schema', 'Phase 1: Foundation'),
  (5, 'API publishing flow', 'Phase 2: Core Marketplace'),
  (6, 'Marketplace browse & search', 'Phase 2: Core Marketplace'),
  (7, 'Subscription & plans', 'Phase 2: Core Marketplace'),
  (8, 'API gateway integration', 'Phase 2: Core Marketplace'),
  (9, 'Usage metering', 'Phase 2: Core Marketplace'),
  (10, 'Billing & payments', 'Phase 2: Core Marketplace'),
  (11, 'Developer portal & docs', 'Phase 2: Core Marketplace'),
  (12, 'Provider dashboard', 'Phase 2: Core Marketplace'),
  (13, 'AI code generation', 'Phase 3: Killer Features'),
  (14, 'AI playground', 'Phase 3: Killer Features'),
  (15, 'Sandbox & testing', 'Phase 3: Killer Features'),
  (16, 'Workflows automation', 'Phase 3: Killer Features'),
  (17, 'Collaborative testing', 'Phase 3: Killer Features'),
  (18, 'Advanced analytics', 'Phase 4: Advanced Features'),
  (19, 'Feature flags', 'Phase 4: Advanced Features'),
  (20, 'Webhooks & events', 'Phase 4: Advanced Features'),
  (21, 'API versioning', 'Phase 4: Advanced Features'),
  (22, 'Rate limits & quotas', 'Phase 4: Advanced Features'),
  (23, 'Admin & moderation', 'Phase 5: Operations & Launch'),
  (24, 'Audit logs & compliance', 'Phase 5: Operations & Launch'),
  (25, 'Monitoring & alerts', 'Phase 5: Operations & Launch'),
  (26, 'Documentation & onboarding', 'Phase 5: Operations & Launch'),
  (27, 'Launch preparation', 'Phase 5: Operations & Launch'),
  (28, 'Go-live & support', 'Phase 5: Operations & Launch')
) AS v(n, name, phase)
WHERE NOT EXISTS (SELECT 1 FROM implementation_sprints LIMIT 1);

-- Seed one task and one deliverable per sprint (only when sprint_tasks is empty)
-- category must be one of: database, backend, frontend, testing, devops, documentation
INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed)
SELECT s.id, 1, 'Complete sprint scope', 'backend', false
FROM implementation_sprints s
WHERE NOT EXISTS (SELECT 1 FROM sprint_tasks LIMIT 1);

INSERT INTO sprint_deliverables (sprint_id, name, is_completed)
SELECT s.id, 'Sprint deliverable', false
FROM implementation_sprints s
WHERE NOT EXISTS (SELECT 1 FROM sprint_deliverables LIMIT 1);
