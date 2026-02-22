# Production Readiness Report

**Generated:** 2026-02-22T15:15:01.144Z | **Scanner:** 1.0.0 | **Schema:** 1.0

## Ship status

**Status:** `ship`

---
## Routes

| Path | Description |
|------|-------------|
| /(auth)/forgot-password | Page: /(auth)/forgot-password |
| /(auth)/login | Page: /(auth)/login |
| /(auth)/reset-password | Page: /(auth)/reset-password |
| /(auth)/signup | Page: /(auth)/signup |
| /(auth)/verify-email | Page: /(auth)/verify-email |
| /(public)/about | Page: /(public)/about |
| /(public)/audit | Page: /(public)/audit |
| /(public)/collections | Page: /(public)/collections |
| /(public)/contact | Page: /(public)/contact |
| /(public)/directory | Page: /(public)/directory |
| /(public)/docs | Page: /(public)/docs |
| /(public) | Page: /(public) |
| /(public)/pricing | Page: /(public)/pricing |
| /(public)/security | Page: /(public)/security |
| /(public)/status | Page: /(public)/status |
| /(public)/use-cases | Page: /(public)/use-cases |
| /api/admin/apis/[id]/approve | API: /api/admin/apis/[id]/approve |
| /api/admin/apis/[id]/approve-claim | API: /api/admin/apis/[id]/approve-claim |
| /api/admin/apis/[id]/reject | API: /api/admin/apis/[id]/reject |
| /api/admin/apis/[id]/reject-claim | API: /api/admin/apis/[id]/reject-claim |
| /api/admin/demo | API: /api/admin/demo |
| /api/admin/feature-flags/[name] | API: /api/admin/feature-flags/[name] |
| /api/admin/feature-flags | API: /api/admin/feature-flags |
| /api/admin/moderation/reports/[id] | API: /api/admin/moderation/reports/[id] |
| /api/admin/moderation/reports | API: /api/admin/moderation/reports |
| /api/admin/organizations/[id]/verify | API: /api/admin/organizations/[id]/verify |
| /api/admin/performance/metrics | API: /api/admin/performance/metrics |
| /api/admin/readiness | API: /api/admin/readiness |
| /api/admin/readiness/scan | API: /api/admin/readiness/scan |
| /api/admin/security/metrics | API: /api/admin/security/metrics |
| /api/admin/settings/hero-variant | API: /api/admin/settings/hero-variant |
| /api/admin/settings/platform-name | API: /api/admin/settings/platform-name |
| /api/admin/stats | API: /api/admin/stats |
| /api/admin/tickets/[id]/reply | API: /api/admin/tickets/[id]/reply |
| /api/admin/tracker/deliverables/[id] | API: /api/admin/tracker/deliverables/[id] |
| /api/admin/tracker/sprints/[id] | API: /api/admin/tracker/sprints/[id] |
| /api/admin/tracker/sprints | API: /api/admin/tracker/sprints |
| /api/admin/tracker/tasks/[id] | API: /api/admin/tracker/tasks/[id] |
| /api/ai/debug | API: /api/ai/debug |
| /api/ai/explain | API: /api/ai/explain |
| /api/ai/playground | API: /api/ai/playground |
| /api/analytics/cost-intelligence | API: /api/analytics/cost-intelligence |
| /api/analytics/developer | API: /api/analytics/developer |
| /api/analytics/provider | API: /api/analytics/provider |
| /api/analytics | API: /api/analytics |
| /api/apis/[id]/claim | API: /api/apis/[id]/claim |
| /api/apis/[id]/publish | API: /api/apis/[id]/publish |
| /api/apis/[id]/reviews | API: /api/apis/[id]/reviews |
| /api/apis/[id] | API: /api/apis/[id] |
| /api/apis/[id]/status | API: /api/apis/[id]/status |
| /api/apis/[id]/versions | API: /api/apis/[id]/versions |
| /api/apis | API: /api/apis |
| /api/auth/me | API: /api/auth/me |
| /api/auth/signup | API: /api/auth/signup |
| /api/challenges/[id] | API: /api/challenges/[id] |
| /api/challenges/[id]/submit | API: /api/challenges/[id]/submit |
| /api/challenges | API: /api/challenges |
| /api/collections/[id]/apis | API: /api/collections/[id]/apis |
| /api/collections/[id] | API: /api/collections/[id] |
| /api/collections | API: /api/collections |
| /api/contact | API: /api/contact |
| /api/cron/process-gdpr-deletions | API: /api/cron/process-gdpr-deletions |
| /api/cron/process-retention | API: /api/cron/process-retention |
| /api/cron/refresh-mvs | API: /api/cron/refresh-mvs |
| /api/favorites | API: /api/favorites |
| /api/forum/topics/[id]/posts | API: /api/forum/topics/[id]/posts |
| /api/forum/topics/[id] | API: /api/forum/topics/[id] |
| /api/forum/topics | API: /api/forum/topics |
| /api/gdpr/consent | API: /api/gdpr/consent |
| /api/gdpr/delete/[id] | API: /api/gdpr/delete/[id] |
| /api/gdpr/delete | API: /api/gdpr/delete |
| /api/gdpr/export | API: /api/gdpr/export |
| /api/health | API: /api/health |
| /api/leads | API: /api/leads |
| /api/organizations/current/audit-log | API: /api/organizations/current/audit-log |
| /api/organizations/current/members | API: /api/organizations/current/members |
| /api/organizations/current | API: /api/organizations/current |
| /api/parse-openapi | API: /api/parse-openapi |
| /api/proxy | API: /api/proxy |
| /api/readiness/full | API: /api/readiness/full |
| /api/readiness/quick | API: /api/readiness/quick |
| /api/readiness/reports/[id] | API: /api/readiness/reports/[id] |
| /api/readiness/reports | API: /api/readiness/reports |
| /api/referrals | API: /api/referrals |
| /api/reports | API: /api/reports |
| /api/settings/platform-name | API: /api/settings/platform-name |
| /api/subscriptions | API: /api/subscriptions |
| /api/user/onboarding/checklist | API: /api/user/onboarding/checklist |
| /api/user/onboarding | API: /api/user/onboarding |
| /api/user/profile | API: /api/user/profile |
| /api/waitlist | API: /api/waitlist |
| /api/webhooks/endpoints | API: /api/webhooks/endpoints |
| /api/webhooks/stripe | API: /api/webhooks/stripe |
| /api/workflows/[id]/execute | API: /api/workflows/[id]/execute |
| /api/workflows/[id] | API: /api/workflows/[id] |
| /api/workflows | API: /api/workflows |
| /auth/callback | API: /auth/callback |
| /collections/[id] | Page: /collections/[id] |
| /dashboard/activity | Page: /dashboard/activity |
| /dashboard/admin/apis/claims/[id] | Page: /dashboard/admin/apis/claims/[id] |
| /dashboard/admin/apis/claims | Page: /dashboard/admin/apis/claims |
| /dashboard/admin/apis | Page: /dashboard/admin/apis |
| /dashboard/admin/apis/review/[id] | Page: /dashboard/admin/apis/review/[id] |
| /dashboard/admin/apis/review | Page: /dashboard/admin/apis/review |
| /dashboard/admin/dev/demo | Page: /dashboard/admin/dev/demo |
| /dashboard/admin/dev | Page: /dashboard/admin/dev |
| /dashboard/admin/dev/tracker | Page: /dashboard/admin/dev/tracker |
| /dashboard/admin/operations/health | Page: /dashboard/admin/operations/health |
| /dashboard/admin/operations | Page: /dashboard/admin/operations |
| /dashboard/admin/operations/performance | Page: /dashboard/admin/operations/performance |
| /dashboard/admin/operations/readiness | Page: /dashboard/admin/operations/readiness |
| /dashboard/admin/operations/security | Page: /dashboard/admin/operations/security |
| /dashboard/admin | Page: /dashboard/admin |
| /dashboard/admin/people/organizations | Page: /dashboard/admin/people/organizations |
| /dashboard/admin/people | Page: /dashboard/admin/people |
| /dashboard/admin/people/users/[id] | Page: /dashboard/admin/people/users/[id] |
| /dashboard/admin/people/users | Page: /dashboard/admin/people/users |
| /dashboard/admin/people/verification | Page: /dashboard/admin/people/verification |
| /dashboard/admin/platform/feature-flags | Page: /dashboard/admin/platform/feature-flags |
| /dashboard/admin/platform | Page: /dashboard/admin/platform |
| /dashboard/admin/platform/settings | Page: /dashboard/admin/platform/settings |
| /dashboard/admin/support/moderation | Page: /dashboard/admin/support/moderation |
| /dashboard/admin/support | Page: /dashboard/admin/support |
| /dashboard/admin/support/tickets/[id] | Page: /dashboard/admin/support/tickets/[id] |
| /dashboard/admin/support/tickets | Page: /dashboard/admin/support/tickets |
| /dashboard/analytics/cost-intelligence | Page: /dashboard/analytics/cost-intelligence |
| /dashboard/analytics | Page: /dashboard/analytics |
| /dashboard/analytics/provider | Page: /dashboard/analytics/provider |
| /dashboard/analytics/usage | Page: /dashboard/analytics/usage |
| /dashboard/developer/api-builder | Page: /dashboard/developer/api-builder |
| /dashboard/developer/collab | Page: /dashboard/developer/collab |
| /dashboard/developer | Page: /dashboard/developer |
| /dashboard/developer/playground | Page: /dashboard/developer/playground |
| /dashboard/developer/sandbox | Page: /dashboard/developer/sandbox |
| /dashboard/developer/workflows | Page: /dashboard/developer/workflows |
| /dashboard/discover/challenges/[id] | Page: /dashboard/discover/challenges/[id] |
| /dashboard/discover/challenges | Page: /dashboard/discover/challenges |
| /dashboard/discover/collections/[id] | Page: /dashboard/discover/collections/[id] |
| /dashboard/discover/collections | Page: /dashboard/discover/collections |
| /dashboard/discover/favorites | Page: /dashboard/discover/favorites |
| /dashboard/discover/forum/[id] | Page: /dashboard/discover/forum/[id] |
| /dashboard/discover/forum | Page: /dashboard/discover/forum |
| /dashboard/discover | Page: /dashboard/discover |
| /dashboard/discover/referrals | Page: /dashboard/discover/referrals |
| /dashboard/discover/subscriptions | Page: /dashboard/discover/subscriptions |
| /dashboard/notifications | Page: /dashboard/notifications |
| /dashboard | Page: /dashboard |
| /dashboard/provider/affiliates | Page: /dashboard/provider/affiliates |
| /dashboard/provider/apis/[id] | Page: /dashboard/provider/apis/[id] |
| /dashboard/provider/apis/new | Page: /dashboard/provider/apis/new |
| /dashboard/provider/apis | Page: /dashboard/provider/apis |
| /dashboard/provider/apis/publish | Page: /dashboard/provider/apis/publish |
| /dashboard/provider | Page: /dashboard/provider |
| /dashboard/settings/api-keys | Page: /dashboard/settings/api-keys |
| /dashboard/settings/billing | Page: /dashboard/settings/billing |
| /dashboard/settings/notifications | Page: /dashboard/settings/notifications |
| /dashboard/settings/organization | Page: /dashboard/settings/organization |
| /dashboard/settings | Page: /dashboard/settings |
| /dashboard/settings/privacy | Page: /dashboard/settings/privacy |
| /dashboard/settings/profile | Page: /dashboard/settings/profile |
| /dashboard/settings/security | Page: /dashboard/settings/security |
| /dashboard/settings/webhooks | Page: /dashboard/settings/webhooks |
| /dashboard/tickets/[id] | Page: /dashboard/tickets/[id] |
| /dashboard/tickets | Page: /dashboard/tickets |
| /docs/[org_slug]/[api_slug] | Page: /docs/[org_slug]/[api_slug] |
| /legal/acceptable-use | Page: /legal/acceptable-use |
| /legal/cookie-settings | Page: /legal/cookie-settings |
| /legal/cookies | Page: /legal/cookies |
| /legal/dpa | Page: /legal/dpa |
| /legal/privacy | Page: /legal/privacy |
| /legal/sla | Page: /legal/sla |
| /legal/terms | Page: /legal/terms |
| /marketplace/[org_slug]/[api_slug] | Page: /marketplace/[org_slug]/[api_slug] |
| /marketplace/[org_slug]/[api_slug]/status | Page: /marketplace/[org_slug]/[api_slug]/status |
| /marketplace/compare | Page: /marketplace/compare |
| /marketplace | Page: /marketplace |

---
## Gaps (findings)

### HIGH (1)

- **DB-4** Migration contains DROP TABLE/COLUMN, TRUNCATE, or ALTER COLUMN TYPE.
  - `/Users/timinkan/projects/apimarketplace/supabase/migrations/20260224000001_api_requests_log_retention.sql`
  - Fix: Ensure backup/rollback plan; avoid destructive DDL in shared branches.

### LOW (47)

- **UI-3** API route /api/admin/apis/[id]/approve may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/apis/[id]/approve/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/apis/[id]/approve-claim may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/apis/[id]/approve-claim/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/apis/[id]/reject may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/apis/[id]/reject/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/apis/[id]/reject-claim may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/apis/[id]/reject-claim/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/feature-flags/[name] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/feature-flags/[name]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/feature-flags may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/feature-flags/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/moderation/reports/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/moderation/reports/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/organizations/[id]/verify may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/organizations/[id]/verify/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/stats may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/stats/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/tickets/[id]/reply may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/tickets/[id]/reply/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/tracker/deliverables/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/tracker/deliverables/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/tracker/sprints/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/tracker/sprints/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/admin/tracker/tasks/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/admin/tracker/tasks/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/ai/debug may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/ai/debug/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/ai/explain may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/ai/explain/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/ai/playground may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/ai/playground/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/analytics may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/analytics/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/apis/[id]/claim may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/apis/[id]/claim/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/apis/[id]/publish may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/apis/[id]/publish/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/apis/[id]/reviews may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/apis/[id]/reviews/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/apis/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/apis/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/apis/[id]/status may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/apis/[id]/status/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/apis/[id]/versions may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/apis/[id]/versions/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/auth/me may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/auth/me/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/challenges/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/challenges/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/challenges/[id]/submit may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/challenges/[id]/submit/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/challenges may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/challenges/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/collections/[id]/apis may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/collections/[id]/apis/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/collections/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/collections/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/cron/process-gdpr-deletions may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/cron/process-gdpr-deletions/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/cron/process-retention may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/cron/process-retention/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/cron/refresh-mvs may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/cron/refresh-mvs/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/forum/topics/[id]/posts may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/forum/topics/[id]/posts/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/forum/topics/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/forum/topics/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/gdpr/delete/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/gdpr/delete/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/gdpr/delete may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/gdpr/delete/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/gdpr/export may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/gdpr/export/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/organizations/current/audit-log may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/organizations/current/audit-log/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/organizations/current/members may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/organizations/current/members/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/readiness/reports/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/readiness/reports/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/referrals may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/referrals/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/settings/platform-name may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/settings/platform-name/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/waitlist may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/waitlist/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/webhooks/stripe may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/webhooks/stripe/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/workflows/[id]/execute may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/workflows/[id]/execute/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /api/workflows/[id] may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/api/workflows/[id]/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

- **UI-3** API route /auth/callback may never be called (no matching callsite).
  - `/Users/timinkan/projects/apimarketplace/src/app/auth/callback/route.ts`
  - Fix: Confirm route is used (e.g. from server action or external).

---

**Suppressed:** 47

---

## Ship checklist

- [x] NEXT_PUBLIC_SITE_URL set
- [x] Supabase URL and anon key configured
- [x] Stripe webhook signing secret configured