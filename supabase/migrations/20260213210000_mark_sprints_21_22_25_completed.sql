-- Mark sprints 21 (API versioning), 22 (Rate limits & quotas), 25 (Monitoring & health checks) as completed
UPDATE implementation_sprints
SET status = 'completed', completed_at = COALESCE(completed_at, now()), updated_at = now()
WHERE sprint_number IN (21, 22, 25);
