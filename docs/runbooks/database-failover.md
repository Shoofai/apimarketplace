# Database Failover Runbook

## Severity: SEV-1
## On-call: Platform Engineering

## Symptoms
- API routes returning 500 errors with "connection refused" or "too many connections"
- Health endpoint (`/api/health`) reporting database status as unhealthy
- Supabase dashboard showing connection pool exhaustion

## Immediate Actions

### 1. Confirm the Issue
```bash
# Check health endpoint
curl -s https://apimarketplace.pro/api/health | jq .services.database

# Check Supabase dashboard → Database → Connection Pooling
```

### 2. If Connection Pool Exhausted
- Navigate to Supabase Dashboard → Settings → Database → Connection Pooling
- Increase pool size temporarily (default: 15, max: 50 for Pro plan)
- Check for connection leaks: Look for API routes that don't close connections

### 3. If Database is Completely Down
- Check Supabase Status page: https://status.supabase.com
- If Supabase-wide outage: Enable maintenance mode via feature flag
  ```sql
  UPDATE feature_flags SET enabled_globally = true WHERE name = 'maintenance_mode';
  ```
- If project-specific: Contact Supabase support via dashboard

### 4. Migration Rollback
If a recent migration caused the issue:
- Identify the breaking migration in `supabase/migrations/`
- Create a rollback migration that reverses the change
- Apply via Supabase CLI: `npx supabase db push`

## Recovery Verification
1. Health endpoint returns `{ status: 'ok' }` with database healthy
2. Dashboard loads successfully
3. API routes return 200 for authenticated requests
4. Check error rate in Sentry has dropped to baseline

## Post-Incident
- Create post-mortem within 24 hours
- Update this runbook with any new learnings
- Review connection pool settings for adequacy
