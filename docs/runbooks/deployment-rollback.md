# Deployment Rollback Runbook

## Severity: SEV-1 (if rollback needed due to production issue)
## On-call: Platform Engineering

## When to Roll Back
- New deployment introduced errors not caught by CI
- Error rate spiked immediately after deployment
- Critical functionality broken (auth, billing, API proxy)

## Vercel Rollback Steps

### 1. Instant Rollback via Vercel Dashboard
1. Go to https://vercel.com → Project → Deployments
2. Find the last known-good deployment (green checkmark, before the bad deploy)
3. Click the three-dot menu → "Promote to Production"
4. This is instant — no rebuild required

### 2. Rollback via CLI
```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

### 3. Verify Rollback
```bash
# Check the deployment URL matches the rolled-back version
curl -s https://apimarketplace.pro/api/health | jq .version

# Verify error rate is dropping in Sentry
```

## Database Migration Rollback
If the bad deployment included a database migration:

1. **DO NOT** roll back the database automatically
2. Assess if the migration is backward-compatible
3. If it added columns/tables: the old code simply won't use them (safe)
4. If it removed columns/changed types: create a forward-fix migration
5. Apply the fix migration via Supabase CLI:
   ```bash
   npx supabase db push
   ```

## Post-Rollback
1. Investigate root cause of the bad deployment
2. Add regression test for the failure scenario
3. Fix the issue in a new branch
4. Deploy the fix through normal CI/CD pipeline
5. Create post-mortem if SEV-1

## Prevention
- Run `npm run type-check && npm run build` locally before pushing
- Review Vercel preview deployment before merging to main
- Run E2E regression suite: `npm run test:e2e:regression`
