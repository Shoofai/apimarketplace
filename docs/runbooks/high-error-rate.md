# High Error Rate Runbook

## Severity: SEV-1 (>5% error rate) or SEV-2 (1-5%)
## On-call: Platform Engineering

## Symptoms
- Sentry alert for spike in errors
- Health endpoint returning 503
- User reports of failures
- Error rate exceeding baseline in Vercel Analytics

## Triage Checklist

### 1. Identify the Scope
```bash
# Check overall health
curl -s https://apimarketplace.pro/api/health | jq .

# Check circuit breaker states
curl -s https://apimarketplace.pro/api/health | jq .circuitBreakers
```

### 2. Check Sentry
- Go to Sentry → Issues → Sort by "Last Seen"
- Identify the top error by frequency
- Check if it's one endpoint or widespread

### 3. Common Causes & Fixes

**Database errors (connection/query failures)**
→ See `database-failover.md`

**Stripe errors (payment/checkout failures)**
→ See `stripe-unavailable.md`

**Redis errors (cache/rate-limit failures)**
→ See `redis-down.md`

**Deployment regression**
→ See `deployment-rollback.md`

**Kong gateway errors**
→ See `kong-gateway-failure.md`

**Rate limiting spike (429s)**
→ Check if a single IP is causing it
→ Review rate limit configuration in `src/lib/rate-limit.ts`

**Memory/CPU exhaustion**
→ Check Vercel Functions → Monitoring
→ Look for infinite loops or memory leaks in recent deployments

### 4. If Cause Unknown
1. Check Vercel deployment logs for the most recent deploy
2. Compare error start time with deployment time
3. If correlated: roll back (see `deployment-rollback.md`)
4. If not correlated: check external service status pages

## Escalation
- SEV-1 (>5%): Immediate rollback if cause unclear within 15 minutes
- SEV-2 (1-5%): Investigate for 30 minutes before escalating

## Recovery Verification
1. Error rate returns to baseline (<0.1%)
2. Health endpoint returns 200
3. No new Sentry issues in last 10 minutes
