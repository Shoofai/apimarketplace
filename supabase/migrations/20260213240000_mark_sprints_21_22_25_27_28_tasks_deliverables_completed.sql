-- Sprints 21, 22, 25, 27, 28 were marked completed in later migrations but their
-- tasks/deliverables were never set completed, so progress showed 0%. Fix that.
UPDATE sprint_tasks t
SET is_completed = true, completed_at = COALESCE(t.completed_at, now())
FROM implementation_sprints s
WHERE t.sprint_id = s.id AND s.sprint_number IN (21, 22, 25, 27, 28);

UPDATE sprint_deliverables d
SET is_completed = true, completed_at = COALESCE(d.completed_at, now())
FROM implementation_sprints s
WHERE d.sprint_id = s.id AND s.sprint_number IN (21, 22, 25, 27, 28);
