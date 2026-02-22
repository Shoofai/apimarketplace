-- Post-Sprint 27 changelog: Sprint 29 + tasks + deliverables (from .plan.md and git notes)
DO $$
DECLARE
  v_sprint_id uuid;
BEGIN
  INSERT INTO implementation_sprints (sprint_number, name, phase, status, duration_weeks, notes, completed_at)
  VALUES (
    29,
    'Post-Sprint 27 changelog',
    'Phase 6: Post-launch changelog',
    'completed',
    1,
    'Changelog from .plan.md Implemented sections and git notes (refs/notes/implemented).',
    '2026-02-22'::timestamptz
  )
  RETURNING id INTO v_sprint_id;

  INSERT INTO sprint_tasks (sprint_id, task_number, title, category, is_completed, completed_at) VALUES
  (v_sprint_id, 1, 'Panel menu four hubs: Discover, Analytics, Provider, Developer; sidebar consolidation; next.config redirects', 'frontend', true, '2026-02-21'::timestamptz),
  (v_sprint_id, 2, 'API-from-apps hero card: height, step progress, success toast, connector data-flow, tile states', 'frontend', true, '2026-02-22'::timestamptz),
  (v_sprint_id, 3, 'Production readiness: DB-4 migration rollback/backup plan; UI-3 API_ROUTE_CALLSITES.md and 47 route comments', 'documentation', true, '2026-02-22'::timestamptz);

  INSERT INTO sprint_deliverables (sprint_id, name, is_completed, completed_at) VALUES
  (v_sprint_id, 'Dashboard hub consolidation (Discover, Analytics, Provider, Developer) and redirects', true, '2026-02-21'::timestamptz),
  (v_sprint_id, 'Hero API-from-apps card enhancements (UX and animations)', true, '2026-02-22'::timestamptz),
  (v_sprint_id, 'API_ROUTE_CALLSITES.md and migration rollback documentation', true, '2026-02-22'::timestamptz);
END $$;
