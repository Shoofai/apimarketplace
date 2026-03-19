# Redis Down Runbook

## Severity: SEV-3
## On-call: Platform Engineering

## Symptoms
- Health endpoint reporting Redis as unhealthy
- Rate limiting falling back to per-instance in-memory mode
- Cache misses increasing (slower API responses)
- Log warnings: "Redis Client Error" or "Failed to connect to Redis"

## Impact Assessment
Redis is an **optional dependency** — the system degrades gracefully:
- **Rate limiting**: Falls back to in-memory per Vercel instance (less accurate but functional)
- **Caching**: All cache operations return null, every request hits the database
- **Functionality**: All features continue to work, just slower

## Immediate Actions

### 1. Confirm the Issue
```bash
# Check health endpoint
curl -s https://apimarketplace.pro/api/health | jq .services.redis
```

### 2. Check Redis Provider
- If using Upstash: Check https://status.upstash.com
- If using Redis Cloud: Check provider dashboard
- Verify `REDIS_URL` environment variable is correctly set in Vercel

### 3. If Connection String Changed
- Update `REDIS_URL` in Vercel environment variables
- Redeploy to pick up new connection string

### 4. If Redis is Unrecoverable
- The system continues to function without Redis
- Monitor database load — it will increase due to cache misses
- Consider scaling Supabase compute if database load is high

## Recovery Verification
1. Health endpoint shows Redis status as "healthy"
2. Log warnings for Redis errors stop appearing
3. API response times return to baseline (cache hits resume)

## Post-Incident
- Review Redis memory usage and eviction policies
- Consider Redis Sentinel or cluster mode for HA
