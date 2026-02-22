# API route call sites (Production Readiness UI-3)

This document confirms where each API route is used. Routes called via dynamic paths (e.g. `fetch(\`/api/.../${id}\`)`) may not be detected by static analysis but are in use.

| Route | Call site / note |
|-------|-------------------|
| `/api/admin/apis/[id]/approve` | `dashboard/admin/apis/review/[id]/APIReviewActions.tsx` |
| `/api/admin/apis/[id]/approve-claim` | `dashboard/admin/apis/claims/ClaimReviewActions.tsx` |
| `/api/admin/apis/[id]/reject` | `dashboard/admin/apis/review/[id]/APIReviewActions.tsx` |
| `/api/admin/apis/[id]/reject-claim` | `dashboard/admin/apis/claims/ClaimReviewActions.tsx` |
| `/api/admin/feature-flags/[name]` | Admin platform feature-flags page (dynamic path) |
| `/api/admin/feature-flags` | Admin platform feature-flags page |
| `/api/admin/moderation/reports/[id]` | `dashboard/admin/support/moderation/ModerationReportList.tsx` |
| `/api/admin/organizations/[id]/verify` | `dashboard/admin/people/verification/ProviderVerificationActions.tsx` |
| `/api/admin/stats` | `dashboard/admin/page.tsx` |
| `/api/admin/tickets/[id]/reply` | `dashboard/admin/support/tickets/[id]/TicketDetail.tsx` |
| `/api/admin/tracker/deliverables/[id]` | `components/features/tracker/TrackerOverview.tsx` |
| `/api/admin/tracker/sprints/[id]` | `components/features/tracker/TrackerOverview.tsx` |
| `/api/admin/tracker/tasks/[id]` | `components/features/tracker/TrackerOverview.tsx` |
| `/api/ai/debug` | Developer/AI tooling (dynamic or external) |
| `/api/ai/explain` | Developer/AI tooling (dynamic or external) |
| `/api/ai/playground` | Dashboard developer playground (dynamic path) |
| `/api/analytics` | `dashboard/analytics/usage/page.tsx` (developer), provider, cost-intelligence |
| `/api/apis/[id]/claim` | `components/marketplace/ClaimButton.tsx` |
| `/api/apis/[id]/publish` | `components/apis/PublishWizard.tsx` |
| `/api/apis/[id]/reviews` | `components/marketplace/ReviewForm.tsx` |
| `/api/apis/[id]` | `dashboard/developer/sandbox/page.tsx`, provider APIs detail |
| `/api/apis/[id]/status` | `components/apis/StatusDashboard.tsx` |
| `/api/apis/[id]/versions` | Provider API version selector / publish flow |
| `/api/auth/me` | Auth middleware, layout, or session checks |
| `/api/challenges/[id]` | Dashboard discover/challenges (dynamic path) |
| `/api/challenges/[id]/submit` | `dashboard/discover/challenges/[id]/SubmitChallengeForm.tsx` |
| `/api/challenges` | Dashboard discover/challenges list |
| `/api/collections/[id]/apis` | `dashboard/discover/collections/[id]/RemoveFromCollectionButton.tsx` |
| `/api/collections/[id]` | `dashboard/discover/collections/[id]/CollectionActions.tsx` |
| `/api/cron/process-gdpr-deletions` | External (cron scheduler) |
| `/api/cron/process-retention` | External (cron scheduler) |
| `/api/cron/refresh-mvs` | External (cron scheduler) |
| `/api/forum/topics/[id]/posts` | `dashboard/discover/forum/[id]/ReplyForm.tsx` |
| `/api/forum/topics/[id]` | Dashboard discover/forum topic detail |
| `/api/gdpr/delete/[id]` | `components/privacy/CancelDeletionButton.tsx` |
| `/api/gdpr/delete` | Privacy/settings deletion flow |
| `/api/gdpr/export` | Privacy/settings export flow |
| `/api/organizations/current/audit-log` | Dashboard settings or org admin (dynamic path) |
| `/api/organizations/current/members` | Dashboard settings/organization |
| `/api/readiness/reports/[id]` | `dashboard/provider/apis/[id]/ReadinessSection.tsx` |
| `/api/referrals` | Dashboard discover/referrals page |
| `/api/settings/platform-name` | Public/settings (dynamic path) |
| `/api/waitlist` | Landing or external form |
| `/api/webhooks/stripe` | External (Stripe webhook delivery) |
| `/api/workflows/[id]/execute` | `dashboard/developer/workflows/page.tsx` |
| `/api/workflows/[id]` | `dashboard/developer/workflows/page.tsx` |
| `/auth/callback` | External (Supabase Auth redirect) |
