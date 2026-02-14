-- Mark sprints 27 (Launch preparation) and 28 (Go-live & support) as completed
UPDATE implementation_sprints
SET status = 'completed', completed_at = COALESCE(completed_at, now()), updated_at = now()
WHERE sprint_number IN (27, 28);
