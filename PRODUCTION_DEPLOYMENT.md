# Production Deployment Guide

**Platform:** Vercel + Supabase + Kong Gateway  
**Estimated Time:** 2-3 hours  
**Prerequisites:** GitHub account, Vercel account, Supabase account, domain (optional)

---

## Pre-Deployment Checklist

### 1. Code Quality ✅
```bash
# Run all checks locally
npm run lint              # ESLint
npm run type-check        # TypeScript
npm test                  # Unit tests
npm run test:e2e         # E2E tests
npm run build            # Production build
```

### 2. Environment Variables ✅
Review and prepare all required environment variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Optional (for full features):**
- `ANTHROPIC_API_KEY` (AI Playground)
- `REDIS_URL` (caching)
- `KONG_ADMIN_URL` (API Gateway)
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` (OAuth)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (OAuth)

### 3. Database ✅
- All migrations applied
- RLS policies enabled
- Indexes created
- Test data removed (if any)

---

## Step 1: Supabase Production Setup

### 1.1 Create Production Project
```bash
# Go to https://supabase.com/dashboard
1. Click "New project"
2. Name: apimarketplace-prod
3. Database Password: [generate strong password]
4. Region: [closest to your users]
5. Plan: Pro (recommended for production)
```

### 1.2 Apply Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to production project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Verify tables
supabase db list
```

### 1.3 Configure Authentication
```bash
# In Supabase Dashboard > Authentication > Settings

1. Site URL: https://your-domain.com
2. Redirect URLs: 
   - https://your-domain.com/auth/callback
   - https://your-domain.com/*

3. Enable providers:
   - Email (✓)
   - GitHub OAuth (configure with GitHub app)
   - Google OAuth (configure with Google Console)

4. Email Templates:
   - Customize confirm signup, reset password templates
   - Use your domain in URLs
```

### 1.4 Set Up Edge Functions
```bash
# Deploy Edge Functions
supabase functions deploy log-api-request
supabase functions deploy deliver-webhook
supabase functions deploy export-user-data

# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### 1.5 Configure Storage
```bash
# In Supabase Dashboard > Storage

1. Create buckets:
   - public (for API logos, avatars)
   - private (for data exports, documents)

2. Set policies:
   - public: read access for all
   - private: read access only for file owner
```

### 1.6 Set Up pg_cron Jobs
```sql
-- In Supabase SQL Editor

-- Hourly usage aggregation
SELECT cron.schedule(
  'aggregate-usage-hourly',
  '0 * * * *', -- Every hour
  $$SELECT aggregate_hourly_usage()$$
);

-- Daily usage aggregation
SELECT cron.schedule(
  'aggregate-usage-daily',
  '0 0 * * *', -- Daily at midnight
  $$SELECT aggregate_daily_usage()$$
);

-- Refresh platform KPIs
SELECT cron.schedule(
  'refresh-platform-kpis',
  '0 * * * *', -- Every hour
  $$SELECT refresh_platform_kpis()$$
);

-- Refresh API rankings
SELECT cron.schedule(
  'refresh-api-rankings',
  '0 0 * * *', -- Daily at midnight
  $$SELECT refresh_api_rankings()$$
);

-- Monthly billing
SELECT cron.schedule(
  'generate-monthly-invoices',
  '0 0 1 * *', -- First day of month
  $$SELECT generate_monthly_invoices()$$
);
```

---

## Step 2: Vercel Deployment

### 2.1 Connect GitHub Repository
```bash
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
```

### 2.2 Configure Environment Variables
```bash
# In Vercel Dashboard > Settings > Environment Variables

# Add all variables from .env.example
# Use production values (Supabase prod, Stripe live keys, etc.)

IMPORTANT: 
- Use Stripe LIVE keys (sk_live_..., pk_live_...)
- Use production Supabase URL and keys
- Set ENABLE_* flags to true for features you want
```

### 2.3 Configure Domains
```bash
# In Vercel Dashboard > Settings > Domains

1. Add your custom domain
2. Configure DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

3. Wait for DNS propagation (5-60 minutes)
4. Enable automatic HTTPS
```

### 2.4 Deploy
```bash
# Push to main branch
git add .
git commit -m "Production ready"
git push origin main

# Vercel will automatically deploy
# Monitor at https://vercel.com/dashboard
```

---

## Step 3: Kong Gateway Setup

### Option A: Kong Cloud (Recommended)
```bash
1. Sign up at https://konghq.com/kong-cloud
2. Create a new runtime
3. Get Admin API URL and token
4. Update KONG_ADMIN_URL in Vercel env vars
```

### Option B: Self-Hosted (Advanced)
```bash
# Use Docker on a VPS
docker-compose -f docker-compose.kong.yml up -d

# Or use managed Kubernetes
helm install kong kong/kong

# Configure firewall:
- Allow 8000 (proxy)
- Allow 8001 (admin - internal only!)
```

---

## Step 4: Redis Setup

### Option A: Upstash (Recommended)
```bash
1. Go to https://upstash.com
2. Create Redis database
3. Copy connection string
4. Add REDIS_URL to Vercel env vars
```

### Option B: Redis Cloud
```bash
1. Go to https://redis.com/cloud
2. Create database
3. Get connection string
4. Add REDIS_URL to Vercel env vars
```

---

## Step 5: Stripe Production Setup

### 5.1 Activate Live Mode
```bash
# In Stripe Dashboard

1. Switch to Live mode (top right)
2. Complete account verification
3. Get live API keys:
   - Publishable key: pk_live_...
   - Secret key: sk_live_...
```

### 5.2 Configure Webhooks
```bash
# Add webhook endpoint
URL: https://your-domain.com/api/webhooks/stripe
Events to send:
  - invoice.paid
  - invoice.payment_failed
  - account.updated
  - payment_intent.succeeded
  - customer.subscription.updated
  - customer.subscription.deleted

# Get webhook signing secret
- Copy webhook secret (whsec_...)
- Add as STRIPE_WEBHOOK_SECRET in Vercel
```

### 5.3 Set Up Connect
```bash
# For marketplace payouts
1. Enable Stripe Connect
2. Complete platform profile
3. Configure OAuth settings:
   - Redirect URI: https://your-domain.com/api/stripe/connect/callback
```

---

## Step 6: Monitoring & Observability

### 6.1 Sentry (Error Tracking)
```bash
npm install @sentry/nextjs

# Configure sentry.client.config.ts
# Configure sentry.server.config.ts
# Add SENTRY_DSN to Vercel env vars
```

### 6.2 Vercel Analytics
```bash
# Enable in Vercel Dashboard > Analytics
# Automatic web vitals tracking
```

### 6.3 Health Check Monitoring
```bash
# Use UptimeRobot or Better Uptime
Monitor: https://your-domain.com/api/health
Interval: 5 minutes
Alert: Email/Slack on downtime
```

---

## Step 7: Post-Deployment Verification

### 7.1 Smoke Tests
```bash
✅ Homepage loads
✅ User can sign up
✅ User can log in
✅ Marketplace catalog shows APIs
✅ API detail page loads
✅ Sandbox works (if Kong enabled)
✅ Dashboard loads
✅ Settings pages work
✅ Webhooks receive events
✅ Notifications appear
✅ Health check returns 200
```

### 7.2 Performance Tests
```bash
# Run k6 load tests against production
k6 run tests/load/marketplace.js -e BASE_URL=https://your-domain.com

# Check results:
✅ 95th percentile < 2s
✅ Error rate < 1%
✅ No 500 errors
```

### 7.3 Security Verification
```bash
# Check security headers
https://securityheaders.com/?q=https://your-domain.com
Target: A+ rating

# Check SSL
https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
Target: A+ rating
```

---

## Step 8: Launch Checklist

```bash
Infrastructure
✅ Supabase production project created
✅ All migrations applied
✅ pg_cron jobs scheduled
✅ Edge Functions deployed
✅ Storage buckets configured

Deployment
✅ Vercel project deployed
✅ Custom domain configured
✅ SSL certificate active
✅ All environment variables set

External Services
✅ Kong Gateway configured
✅ Redis instance running
✅ Stripe live mode active
✅ Stripe webhooks configured
✅ OAuth providers configured

Monitoring
✅ Error tracking (Sentry)
✅ Uptime monitoring
✅ Performance monitoring
✅ Health checks

Verification
✅ All smoke tests pass
✅ Load tests pass
✅ Security headers A+
✅ SSL rating A+

Documentation
✅ Terms of Service published
✅ Privacy Policy published
✅ API documentation accessible
✅ Support email configured
```

---

## Rollback Procedure

If issues occur:

```bash
1. Rollback Vercel deployment:
   vercel rollback

2. Revert database migrations:
   supabase db reset
   
3. Check logs:
   - Vercel: vercel logs
   - Supabase: Dashboard > Logs
   - Kong: docker logs kong

4. Restore from backup if needed
```

---

## Post-Launch Monitoring (48 hours)

```bash
Monitor these metrics:

1. Error Rate
   - Target: < 0.1%
   - Alert if: > 1%

2. Response Times
   - P95: < 2s
   - Alert if: > 5s

3. Database
   - Connection pool usage < 80%
   - Query performance stable

4. External Services
   - Stripe webhook success > 99%
   - Kong gateway uptime > 99.9%
   - Redis cache hit rate > 70%

5. User Activity
   - Signup conversion rate
   - Login success rate
   - Error patterns

6. Business Metrics
   - New API listings
   - New subscriptions
   - API calls volume
```

---

## Success Criteria

Your deployment is successful when:

✅ All services are healthy
✅ Users can sign up and log in
✅ APIs are discoverable
✅ Subscriptions work
✅ Billing processes
✅ Notifications deliver
✅ Performance targets met
✅ Security headers A+
✅ No critical errors for 48 hours

---

## Support Channels

- **Technical Issues:** Check logs (Vercel, Supabase, Kong)
- **Database:** Supabase Dashboard > Logs
- **Payments:** Stripe Dashboard > Events
- **Security:** security@your-domain.com
- **Status Page:** status.your-domain.com (set up with Statuspage.io)

---

**Deployment Complete! 🎉**

Your APIMarketplace Pro is now live and ready for users!
