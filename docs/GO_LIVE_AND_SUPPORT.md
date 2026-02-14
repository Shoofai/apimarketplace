# Go-Live and Support

Post-launch process, support channels, and incident handling. See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) for pre-launch and launch-day steps.

---

## Go-live steps

1. **Final production deploy**
   - Follow [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) (runbook: pre-launch, deploy, post-deploy verification).
   - Ensure `main` is in a releasable state and all checks pass.

2. **DNS and env verification**
   - Confirm custom domain (if used) resolves and SSL is active.
   - Verify `NEXT_PUBLIC_SITE_URL` equals the production URL (no trailing slash).
   - In Supabase: confirm project URL and anon key match `NEXT_PUBLIC_SUPABASE_*` in Vercel.

3. **Post-launch monitoring (e.g. first 48h)**
   - **Vercel:** Logs and function invocations; watch for 5xx or spikes.
   - **Supabase:** Dashboard → Logs / Database metrics; confirm no connection exhaustion.
   - **Health:** Periodically call `GET /api/health` (or use [System Health](/dashboard/admin/health) if admin) and expect `status: "ok"` under normal conditions.

---

## Rollback plan

- **When to rollback:** Critical errors (e.g. app unreachable, auth broken, payment flow broken), or a failed migration that breaks the app.
- **How (application):** Vercel → Deployments → previous deployment → “Promote to Production”. No code change required.
- **How (database):** If a migration caused the issue, apply a corrective migration or run revert SQL in Supabase. Document the change and update [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) if rollback steps change.
- **Contacts:** See “Contacts” in [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

---

## Support channels

- **Primary:** support@apimarketplace.pro (or your chosen support email).
- **In-app:** Link to support email from Help/Contact (e.g. in footer or dashboard). A simple `mailto:` or “Contact support” link is sufficient; a contact form can be added later.
- **Incidents / outages:** Log in [docs/incidents.md](incidents.md) (create the file when first incident occurs) or in your issue tracker. Include: date, summary, impact, resolution, and any follow-up actions.

---

## Status page (optional)

- **Option A:** Use [Statuspage.io](https://www.atlassian.com/software/statuspage) (or similar) and link from footer or status.your-domain.com.
- **Option B:** In-app public route `/status` that calls `GET /api/health` and displays “Operational” or “Degraded” with a timestamp—no admin-only data. See [src/app/status/page.tsx](../src/app/status/page.tsx) if implemented.
