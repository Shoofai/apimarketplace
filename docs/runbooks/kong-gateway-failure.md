# Kong Gateway Failure Runbook

## Severity: SEV-2
## On-call: Platform Engineering

## Symptoms
- Circuit breaker for Kong in OPEN state (check `/api/health` → circuitBreakers.kong)
- API proxy requests failing
- Health endpoint showing Kong as unhealthy
- Kong admin API unreachable

## Impact Assessment
When Kong is down:
- **API proxy** (`/v1/{org}/{api}/`): All proxied API calls fail
- **Direct API access**: Users can still access APIs directly via their base URLs
- **Dashboard**: Fully functional (doesn't depend on Kong)
- **Marketplace**: Fully functional
- **Billing**: Fully functional

## Immediate Actions

### 1. Confirm the Issue
```bash
# Check health endpoint
curl -s https://apimarketplace.pro/api/health | jq .services.kong

# Check circuit breaker
curl -s https://apimarketplace.pro/api/health | jq .circuitBreakers.kong

# Direct check of Kong admin
curl -s $KONG_ADMIN_URL/status
```

### 2. If Kong is Feature-Flagged Off
- Check if `ENABLE_KONG=true` in environment variables
- If Kong is not needed yet, ensure it's disabled

### 3. If Kong Instance is Down
- Restart Kong instance via your infrastructure provider
- Check Kong logs for crash reasons
- Verify Kong database (if using DB mode) is accessible

### 4. If Kong is Unreachable (Network)
- Verify `KONG_ADMIN_URL` is correct in environment variables
- Check network security groups / firewall rules
- Verify DNS resolution for Kong hostname

## Circuit Breaker Behavior
- The circuit breaker will OPEN after 3 consecutive failures
- It will attempt HALF_OPEN after 15 seconds
- If Kong recovers, the breaker closes automatically
- No manual intervention needed for recovery

## Recovery Verification
1. Kong admin `/status` endpoint returns successfully
2. Circuit breaker returns to CLOSED state
3. API proxy requests succeed
4. `api_health_checks` cron shows APIs as healthy again

## Post-Incident
- Review Kong configuration for stability
- Consider Kong clustering for HA
- Update API health check intervals if needed
