# Implementation Tracker — What's Pending

**Last updated:** 2026-02-25  
**Reference:** Tracker alignment migration `20260213200000_tracker_align_to_implementation.sql` and project docs (`IMPLEMENTATION_STATUS.md`, `PHASE_4_IMPLEMENTATION.md`, `PHASE_5_IMPLEMENTATION.md`). Changelog entries for post-launch work are also recorded as git notes on implementing commits (`git notes --ref=implemented`); list with `git log --show-notes=implemented --oneline`. See plan tracker_post-sprint_27_changelog.

---

## Incomplete Sprints (0 of 29)

All 29 sprints are now completed in the tracker.

**Recently completed:** Sprints 27 (Launch preparation) and 28 (Go-live & support). Dashboard links & E2E — apis/new, activity, pricing, docs index, webhooks endpoint, docs URL fixes, E2E dashboard-links.spec.ts.

**UX polish:** Dashboard sidebar — single active item only (deepest route match in MAIN and PLATFORM ADMIN so only the selected page is highlighted).

---

## Summary

- **Sprint 21 (API versioning):** ✅ Completed — version selector and changelog on API detail; Versions tab; GET /api/apis/[id]/versions.
- **Sprint 22 (Rate limits & quotas):** ✅ Completed — rate limits and quota usage on subscriptions page; rate limits table on API detail (provider).
- **Sprint 25 (Monitoring):** ✅ Completed — admin system health dashboard at `/dashboard/admin/health`; DB/Redis/Kong status; refresh and 30s auto-refresh.
- **Sprint 27 (Launch preparation):** ✅ Completed — docs/LAUNCH_CHECKLIST.md (env checklist, migration verification, runbook, responsive audit); /legal/terms and /legal/privacy pages; signup links fixed; cookie consent banner; app and dashboard error boundaries; E2E subscriptions and admin specs; a11y signup.
- **Sprint 28 (Go-live & support):** ✅ Completed — docs/GO_LIVE_AND_SUPPORT.md (go-live steps, rollback, support channels, incidents, optional status page); tracker and DB updated.
- **Dashboard links & E2E:** ✅ Completed — `/dashboard/apis/new`, `/dashboard/activity`, `/pricing`, `/docs` index; POST `/api/webhooks/endpoints`; docs links fixed to use org slug; E2E `dashboard-links.spec.ts` for unauthenticated, authenticated, and admin flows.
- **Dashboard sidebar (single active):** ✅ Completed — only the selected page is highlighted; deepest route match in MAIN and PLATFORM ADMIN; fixed missing `Sparkles` import for Upgrade CTA.
- **Sprint 29 (Post-Sprint 27 changelog):** ✅ Completed — Panel menu four hubs (Discover, Analytics, Provider, Developer); API-from-apps hero card enhancements; production readiness (DB-4 rollback doc, UI-3 API_ROUTE_CALLSITES.md + 47 route comments). Changelog sources: .plan.md "Implemented" sections and git notes on commits (`git notes --ref=implemented`; list with `git log --show-notes=implemented --oneline`).
