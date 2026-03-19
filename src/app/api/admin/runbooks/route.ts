import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/auth/admin';

/**
 * Runbook content bundled at build time.
 * On Vercel, we can't read the filesystem at runtime,
 * so runbook content is embedded as a static map.
 */
const RUNBOOKS: Record<string, { title: string; content: string }> = {
  'database-failover': {
    title: 'Database Failover',
    content: `## Severity: SEV-1

### Symptoms
- API routes returning 500 errors with connection errors
- Health endpoint reporting database as unhealthy

### Immediate Actions
1. Check health endpoint: \`curl /api/health | jq .services.database\`
2. Check Supabase Dashboard for connection pool status
3. If pool exhausted: increase pool size (Settings → Database → Connection Pooling)
4. If database down: check status.supabase.com, enable maintenance mode
5. For migration rollback: create reverse migration and push via Supabase CLI

### Recovery
- Health endpoint returns ok with database healthy
- Dashboard loads, API routes return 200
- Error rate in Sentry drops to baseline`,
  },
  'stripe-unavailable': {
    title: 'Stripe Unavailable',
    content: `## Severity: SEV-2

### Symptoms
- Checkout sessions failing with 500
- Circuit breaker for Stripe in OPEN state
- Users unable to subscribe or purchase

### Immediate Actions
1. Check circuit breaker: \`curl /api/health | jq .circuitBreakers.stripe\`
2. Check status.stripe.com
3. Circuit breaker auto-handles — do NOT disable it
4. Existing subscriptions unaffected (stored in our DB)
5. When Stripe recovers, circuit breaker auto-closes in 30s

### Do NOT
- Manually retry failed payments (Stripe retries automatically)
- Disable the circuit breaker
- Restart the application`,
  },
  'redis-down': {
    title: 'Redis Down',
    content: `## Severity: SEV-3

### Impact (graceful degradation)
- Rate limiting falls back to per-instance in-memory
- Caching disabled (all requests hit database)
- All features continue to work, just slower

### Immediate Actions
1. Check health: \`curl /api/health | jq .services.redis\`
2. Check Redis provider status page
3. Verify REDIS_URL environment variable
4. System continues without Redis — monitor database load`,
  },
  'high-error-rate': {
    title: 'High Error Rate',
    content: `## Severity: SEV-1 (>5%) or SEV-2 (1-5%)

### Triage Checklist
1. Check /api/health for overall status and circuit breakers
2. Check Sentry → Issues → Sort by Last Seen
3. Identify: is it one endpoint or widespread?

### Common Causes
- Database errors → see database-failover
- Stripe errors → see stripe-unavailable
- Deployment regression → see deployment-rollback
- Rate limiting spike → check for single IP abuse

### Escalation
- SEV-1: Rollback if cause unclear within 15 min
- SEV-2: Investigate for 30 min before escalating`,
  },
  'deployment-rollback': {
    title: 'Deployment Rollback',
    content: `## Severity: SEV-1

### Vercel Instant Rollback
1. Vercel Dashboard → Deployments
2. Find last known-good deployment
3. Three-dot menu → "Promote to Production" (instant, no rebuild)

### CLI: \`vercel promote <deployment-url>\`

### Database Migration Rollback
- If migration added columns/tables: old code won't use them (safe)
- If migration removed/changed types: create a forward-fix migration
- Do NOT auto-rollback the database

### Prevention
- Run type-check + build locally before pushing
- Review Vercel preview deployment before merge
- Run E2E regression suite`,
  },
  'kong-gateway-failure': {
    title: 'Kong Gateway Failure',
    content: `## Severity: SEV-2

### Impact
- API proxy requests fail
- Users can still access APIs directly via base URLs
- Dashboard, marketplace, billing all unaffected

### Immediate Actions
1. Check /api/health for Kong status and circuit breaker
2. Verify KONG_ADMIN_URL and ENABLE_KONG env vars
3. Circuit breaker auto-opens after 3 failures, retries after 15s
4. No manual intervention needed for recovery

### If Kong Instance Down
- Restart Kong instance
- Check Kong logs for crash reason
- Verify Kong database accessibility`,
  },
};

/**
 * GET /api/admin/runbooks
 * Returns list of runbooks or a specific runbook by name.
 * Query params: ?name=database-failover
 */
export async function GET(request: Request) {
  try {
    await requirePlatformAdmin();
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (name) {
    const runbook = RUNBOOKS[name];
    if (!runbook) {
      return NextResponse.json({ error: 'Runbook not found' }, { status: 404 });
    }
    return NextResponse.json(runbook);
  }

  // List all runbooks
  const list = Object.entries(RUNBOOKS).map(([key, { title }]) => ({
    name: key,
    title,
  }));

  return NextResponse.json(list);
}
