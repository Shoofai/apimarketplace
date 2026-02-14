# Launch Preparation Checklist

Single artifact for launch-day preparation. See also [DEPLOYMENT.md](../DEPLOYMENT.md) and [GO_LIVE_AND_SUPPORT.md](GO_LIVE_AND_SUPPORT.md).

---

## 1. Production environment checklist

Set these in Vercel (Project → Settings → Environment Variables). Use **Production** environment.

| Variable | Set in Vercel | Verified |
|----------|----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | [ ] | [ ] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [ ] | [ ] |
| `SUPABASE_SERVICE_ROLE_KEY` | [ ] | [ ] |
| `NEXT_PUBLIC_SITE_URL` | [ ] (e.g. `https://your-domain.vercel.app`) | [ ] |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [ ] | [ ] |
| `STRIPE_SECRET_KEY` | [ ] | [ ] |
| `STRIPE_WEBHOOK_SECRET` | [ ] | [ ] |
| `ANTHROPIC_API_KEY` | [ ] (if AI Playground enabled) | [ ] |
| `ENABLE_KONG` | [ ] | [ ] |
| `ENABLE_BILLING` | [ ] | [ ] |
| `ENABLE_AI_PLAYGROUND` | [ ] | [ ] |
| `ENABLE_WORKFLOWS` | [ ] | [ ] |
| `ENABLE_CACHING` | [ ] | [ ] |
| `KONG_ADMIN_URL` | [ ] (if Kong enabled) | [ ] |
| `KONG_PROXY_URL` | [ ] (if Kong enabled) | [ ] |
| `REDIS_URL` | [ ] (optional) | [ ] |
| `GITHUB_CLIENT_ID` | [ ] (optional) | [ ] |
| `GITHUB_CLIENT_SECRET` | [ ] (optional) | [ ] |

---

## 2. Migration verification

- [ ] **Before deploy:** Run `supabase db push` (or apply migrations manually) against the **production** Supabase project so schema is up to date.
- [ ] **After deploy:** In Supabase Dashboard → Table Editor (or SQL), confirm expected tables exist (e.g. `users`, `apis`, `api_subscriptions`, `implementation_sprints`). Optionally run a read-only query to verify connectivity from the app.

---

## 3. Launch-day runbook

### Pre-launch

1. [ ] Merge release branch to `main` (or tag release).
2. [ ] Confirm production env vars in Vercel (see §1).
3. [ ] Apply migrations to production DB (see §2).
4. [ ] Run locally: `npm run build && npm run start` (or rely on Vercel build).

### Deploy

1. [ ] Trigger deploy (push to `main` or “Redeploy” in Vercel).
2. [ ] Wait for build to succeed; note deployment URL.
3. [ ] If using custom domain: verify DNS and `NEXT_PUBLIC_SITE_URL` match.

### Post-deploy verification

1. [ ] Open production URL; confirm homepage loads.
2. [ ] Smoke checks: Login, Marketplace, Dashboard (one key flow).
3. [ ] Call `GET /api/health` and confirm `status: "ok"` (or expected services).
4. [ ] Check Vercel Functions logs for errors in first few requests.

### Rollback

- **Application:** Vercel → Deployments → select previous deployment → “Promote to Production”.
- **Database:** If a migration caused issues, revert via a new migration or Supabase SQL (document in [GO_LIVE_AND_SUPPORT.md](GO_LIVE_AND_SUPPORT.md)).

### Contacts

- **Owner / on-call:** _______________________
- **Vercel support:** [vercel.com/support](https://vercel.com/support)
- **Supabase support:** [supabase.com/support](https://supabase.com/support)

---

## 4. Responsive audit

- [ ] **375px** – Mobile (e.g. iPhone SE)
- [ ] **768px** – Tablet
- [ ] **1024px** – Desktop
- [ ] **1536px** – Large desktop

E2E: `tests/e2e/marketplace.spec.ts` includes a mobile responsive check. Run `npm run test:e2e` before launch.

---

## 5. References

- [DEPLOYMENT.md](../DEPLOYMENT.md) – Vercel setup, troubleshooting
- [GO_LIVE_AND_SUPPORT.md](GO_LIVE_AND_SUPPORT.md) – Go-live steps, support, rollback, monitoring
