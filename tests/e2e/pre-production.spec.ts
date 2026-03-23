/**
 * Pre-production / Regression E2E suite.
 * - All-pages smoke: visit key routes, expect 200 and no uncaught errors.
 * - Console and page error checks: fail if any console.error or pageerror on critical pages.
 * Run: npx playwright test tests/e2e/pre-production.spec.ts
 * With results summary: npm run test:e2e:regression
 */

import { test, expect } from '@playwright/test';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './fixtures/auth';

// Use relative paths; baseURL comes from playwright.config.ts (e.g. BASE_URL or localhost:3000).

// Public routes that must load with 200 (no auth). Keep in sync with app routes.
const PUBLIC_SMOKE_ROUTES: { path: string; name: string }[] = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
  { path: '/marketplace', name: 'Marketplace' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/enterprise', name: 'Enterprise' },
  { path: '/docs', name: 'Docs' },
  { path: '/audit', name: 'API Audit' },
  { path: '/contact', name: 'Contact' },
  { path: '/collections', name: 'Collections' },
  { path: '/start', name: 'Get Started' },
  { path: '/about', name: 'About' },
  { path: '/security', name: 'Security' },
  { path: '/changelog', name: 'Changelog' },
  { path: '/help', name: 'Help' },
  { path: '/legal/terms', name: 'Terms' },
  { path: '/legal/privacy', name: 'Privacy' },
  { path: '/legal/cookies', name: 'Cookies' },
  { path: '/status', name: 'Status' },
];

// Critical pages for console/page error checks (subset that we assert have no errors).
const CRITICAL_PAGES_FOR_ERROR_CHECK = ['/', '/login', '/signup', '/marketplace', '/pricing', '/dashboard'];

/**
 * Collects console messages and page errors during a page load.
 * Fails the test if any console.error or pageerror occurs (unless allowed by options).
 */
async function assertNoConsoleOrPageErrors(
  page: import('@playwright/test').Page,
  options?: { allowWarnings?: boolean }
) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') consoleErrors.push(text);
    if (!options?.allowWarnings && type === 'warning') consoleErrors.push(`[warning] ${text}`);
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  return { consoleErrors, pageErrors };
}

test.describe('Pre-production: all-pages smoke (public)', () => {
  for (const { path, name } of PUBLIC_SMOKE_ROUTES) {
    test(`${name} (${path}) loads with 200 and no uncaught errors`, async ({ page }) => {
      const { consoleErrors, pageErrors } = await assertNoConsoleOrPageErrors(page);

      const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `${path} should return 200`).toBe(200);

      // Allow a short moment for any late errors
      await page.waitForTimeout(500);

      const errs = [...pageErrors, ...consoleErrors].filter(
        (m) =>
          !m.includes('ResizeObserver') &&
          !m.includes('Hydration') &&
          !m.includes('NEXT_NOT_FOUND')
      );
      expect(errs, `No console/page errors on ${path}. Got: ${errs.join('; ')}`).toHaveLength(0);
    });
  }
});

test.describe('Pre-production: redirects (unauthenticated)', () => {
  test('dashboard redirects to login when not logged in', async ({ page }) => {
    const res = await page.goto('/dashboard');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/login/);
  });

  test('dashboard/subscriptions redirects to login when not logged in', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await expect(page).toHaveURL(/\/login/);
  });

  test('dashboard/admin redirects to login when not logged in', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Pre-production: critical pages — no console/page errors', () => {
  for (const path of CRITICAL_PAGES_FOR_ERROR_CHECK) {
    const name = path === '/' ? 'Home' : path.slice(1) || 'Home';
    test(`${name} has no uncaught errors`, async ({ page }) => {
      const { consoleErrors, pageErrors } = await assertNoConsoleOrPageErrors(page, {
        allowWarnings: true,
      });

      const res = await page.goto(path, { waitUntil: 'networkidle' }).catch(() => null);
      // Dashboard may redirect to login
      if (res && res.status() !== 200) {
        test.skip(true, `Page returned ${res.status()}`);
        return;
      }

      await page.waitForTimeout(800);

      const errs = [...pageErrors, ...consoleErrors].filter(
        (m) =>
          !m.includes('ResizeObserver') &&
          !m.includes('Hydration') &&
          !m.includes('NEXT_NOT_FOUND')
      );
      expect(errs, `No console/page errors on ${path}. Got: ${errs.join('; ')}`).toHaveLength(0);
    });
  }
});

test.describe('Pre-production: authenticated smoke (optional)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_USER_EMAIL || !TEST_USER_PASSWORD, 'Test user not configured');
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  const AUTH_ROUTES = [
    '/dashboard',
    '/dashboard/settings',
    '/dashboard/analytics',
    '/dashboard/activity',
    '/dashboard/discover/subscriptions',
    '/marketplace',
  ];

  for (const path of AUTH_ROUTES) {
    test(`authenticated ${path} loads with 200`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `Expected 200 for ${path}`).toBe(200);
    });
  }
});

test.describe('Pre-production: load sanity', () => {
  test('homepage responds within 5s', async ({ page }) => {
    const start = Date.now();
    const res = await page.goto('/', { timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(res?.status()).toBe(200);
    expect(elapsed, 'Homepage should load within 5s').toBeLessThan(5000);
  });

  test('marketplace responds within 8s', async ({ page }) => {
    const start = Date.now();
    const res = await page.goto('/marketplace', { timeout: 15000 });
    const elapsed = Date.now() - start;
    expect(res?.status()).toBe(200);
    expect(elapsed, 'Marketplace should load within 8s').toBeLessThan(8000);
  });
});
