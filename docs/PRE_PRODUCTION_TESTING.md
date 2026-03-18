# Pre-production and regression testing

This document describes the regression and pre-production test suite, how to run it, and how to use the Regression Test Dashboard.

## Overview

- **E2E (Playwright):** `tests/e2e/` — auth, marketplace, dashboard links, subscriptions, admin, accessibility, and **pre-production** (all-pages smoke + console/page-error checks).
- **Regression suite:** Pre-production spec only, single browser (Chromium), JSON report for the dashboard.
- **Load (k6):** `tests/load/` — marketplace and dashboard load scripts.
- **Unit (Vitest):** `tests/unit/` — API key, slug, code-generator.

## Running the pre-production / regression suite

1. **Start the app** (if not using CI with `BASE_URL`):
   ```bash
   npm run dev
   ```
   App runs on port 3020 by default. The regression config uses `BASE_URL` or `http://localhost:3020`.

2. **Run the full regression suite** (writes results and summary for the dashboard):
   ```bash
   npm run test:e2e:regression
   ```
   This runs:
   - `playwright test --config=playwright.regression.config.ts` (only `tests/e2e/pre-production.spec.ts`)
   - `tsx scripts/write-regression-summary.ts` (writes `test-results/regression-summary.json`)

3. **Run only the Playwright step** (e.g. in CI):
   ```bash
   npx playwright test --config=playwright.regression.config.ts
   ```

4. **Update the dashboard summary from an existing report** (if you already ran Playwright and have `test-results/regression-results.json`):
   ```bash
   npm run test:e2e:regression:report
   ```

## What the pre-production spec covers

- **All-pages smoke (public):** Visits 19+ public routes (/, /login, /signup, /marketplace, /pricing, /docs, /audit, /contact, /collections, /start, legal pages, etc.). Asserts HTTP 200 and no uncaught console/page errors (ResizeObserver and hydration noise filtered).
- **Redirects:** Unauthenticated access to /dashboard, /dashboard/subscriptions, /dashboard/admin → login redirect.
- **Critical pages — no errors:** Same routes plus /dashboard checked for console.error and pageerror (with short wait).
- **Authenticated smoke (optional):** When `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are set, visits /dashboard, settings, analytics, activity, discover/subscriptions, marketplace.
- **Load sanity:** Homepage and marketplace respond within 5s and 8s respectively.

## Regression Test Dashboard

- **URL:** `/dashboard/admin/regression` (platform admin only).
- **Data source:** `GET /api/admin/regression-results` reads `test-results/regression-summary.json`.
- **Update:** The summary is updated every time you run `npm run test:e2e:regression` (or `test:e2e:regression:report` after a run). The dashboard shows last run time, passed/failed/skipped counts, duration, and a table of each test with outcome and duration.

## Environment variables for E2E

| Variable | Purpose |
|---------|--------|
| `BASE_URL` | App URL (e.g. `http://localhost:3020`). Default in regression config is 3020. |
| `TEST_USER_EMAIL` | Optional; enables authenticated smoke tests. |
| `TEST_USER_PASSWORD` | Optional; with above. |
| `TEST_ADMIN_EMAIL` | Optional; used by dashboard-links and admin specs. |
| `TEST_ADMIN_PASSWORD` | Optional; with above. |

## Load tests (k6)

- **Marketplace:** `npm run load:marketplace` — ramps to 100/200 VUs, hits /, /marketplace, /marketplace?q=payment, /api/health. Set `BASE_URL` if needed.
- **Dashboard:** `npm run load:dashboard` — 100 VUs for 5m hitting dashboard-like paths.

**Note:** `tests/load/marketplace.js` uses `handleSummary` with `htmlReport` and `textSummary`. These are not part of core k6; if the run fails with "htmlReport is not defined", install a summary package (e.g. `k6-summary`) or remove/adjust the custom `handleSummary` in that file.

## Console and page error checks

The pre-production spec attaches listeners for `console` (type `error`) and `pageerror`. Any such error fails the test unless it is filtered (e.g. ResizeObserver, hydration, NEXT_NOT_FOUND). To avoid flakiness, critical-page tests use `allowWarnings: true` and a short post-load wait.

## Rationale and approval for functional changes

- **No functional changes** were made to app behavior; only test infrastructure and admin dashboard were added.
- **If you add or change tests** that assert on product behavior, document the rationale in the spec or in this file and get approval before changing production code to satisfy tests.
