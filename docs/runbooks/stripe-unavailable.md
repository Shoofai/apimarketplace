# Stripe Unavailable Runbook

## Severity: SEV-2
## On-call: Platform Engineering + Billing

## Symptoms
- Checkout sessions failing with 500 errors
- Circuit breaker for Stripe in OPEN state (check `/api/health` → circuitBreakers.stripe)
- Stripe webhook deliveries failing
- Users unable to subscribe or purchase credits

## Immediate Actions

### 1. Confirm the Issue
```bash
# Check circuit breaker status
curl -s https://apimarketplace.pro/api/health | jq .circuitBreakers.stripe

# Check Stripe Status
# https://status.stripe.com
```

### 2. If Stripe API is Down
- The circuit breaker will automatically prevent cascading failures
- Existing subscriptions continue to work (they're stored in our DB)
- New checkouts will fail gracefully with "Payment service temporarily unavailable"
- **Do NOT** disable the circuit breaker — it protects the system

### 3. Monitor Recovery
- Circuit breaker will automatically transition to HALF_OPEN after 30 seconds
- If Stripe is back, it will close the circuit and resume normal operation
- Check Sentry for any Stripe-related errors clearing

### 4. Webhook Backlog
- When Stripe recovers, it will retry failed webhooks automatically
- Our webhook handler has idempotency checks (`processed_stripe_events` table)
- The retry-webhooks cron job runs every 10 minutes for our outbound webhooks

## What NOT to Do
- Do NOT manually retry failed payments — Stripe has its own retry logic
- Do NOT disable the circuit breaker
- Do NOT restart the application (it won't help)

## Recovery Verification
1. Circuit breaker returns to CLOSED state
2. New checkout sessions succeed
3. Webhook deliveries resume (check `webhook_deliveries` table)
4. No new Stripe errors in Sentry

## Post-Incident
- Reconcile any payments that may have been lost during the outage
- Check `billing_accounts` for any inconsistencies
- Review dunning cron job logs for missed retries
