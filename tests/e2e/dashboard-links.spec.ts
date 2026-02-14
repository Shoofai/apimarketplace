import { test, expect } from '@playwright/test';

test.describe('Dashboard links (unauthenticated)', () => {
  test('dashboard redirects to login when not logged in', async ({ page }) => {
    const res = await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    expect(res?.status()).toBe(200);
  });

  test('pricing page loads without auth', async ({ page }) => {
    const res = await page.goto('/pricing');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/Pricing/i);
  });

  test('docs index page loads without auth', async ({ page }) => {
    const res = await page.goto('/docs');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/API Documentation/i);
  });
});

test.describe('Dashboard links (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Test user not configured');
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard home loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('sidebar link: Marketplace', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/marketplace"]');
    await expect(page).toHaveURL(/\/marketplace/);
  });

  test('sidebar link: Settings', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/settings"]');
    await expect(page).toHaveURL('/dashboard/settings');
  });

  test('sidebar link: Analytics', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/analytics"]');
    await expect(page).toHaveURL('/dashboard/analytics');
  });

  test('sidebar link: AI Playground', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/playground"]');
    await expect(page).toHaveURL('/dashboard/playground');
  });

  test('sidebar link: Sandbox', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/sandbox"]');
    await expect(page).toHaveURL(/\/dashboard\/sandbox/);
  });

  test('fixed route: /dashboard/apis/new', async ({ page }) => {
    const res = await page.goto('/dashboard/apis/new');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/Publish/i);
  });

  test('fixed route: /dashboard/activity', async ({ page }) => {
    const res = await page.goto('/dashboard/activity');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/Activity/i);
  });

  test('fixed route: /pricing', async ({ page }) => {
    const res = await page.goto('/pricing');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/Pricing/i);
  });

  test('fixed route: /docs', async ({ page }) => {
    const res = await page.goto('/docs');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(/API Documentation/i);
  });

  test('settings sub-routes load', async ({ page }) => {
    const routes = [
      '/dashboard/settings/profile',
      '/dashboard/settings/organization',
      '/dashboard/settings/api-keys',
      '/dashboard/settings/billing',
      '/dashboard/settings/notifications',
      '/dashboard/settings/webhooks',
      '/dashboard/settings/privacy',
      '/dashboard/settings/security',
    ];
    for (const route of routes) {
      const res = await page.goto(route);
      expect(res?.status(), `Expected 200 for ${route}`).toBe(200);
      await expect(page).toHaveURL(route);
    }
  });

  test('account dropdown: Settings and Billing', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="account-menu-trigger"]');
    await page.click('a[href="/dashboard/settings"]');
    await expect(page).toHaveURL('/dashboard/settings');
    await page.goto('/dashboard');
    await page.click('[data-testid="account-menu-trigger"]');
    await page.click('a[href="/dashboard/settings/billing"]');
    await expect(page).toHaveURL('/dashboard/settings/billing');
  });

  test('nav AI Playground link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/playground"]');
    await expect(page).toHaveURL('/dashboard/playground');
  });
});

test.describe('Dashboard links (admin)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Admin test user not configured');
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('admin sidebar and home links load', async ({ page }) => {
    await page.goto('/dashboard');
    const adminLinks = [
      '/dashboard/admin',
      '/dashboard/admin/apis/review',
      '/dashboard/admin/users',
      '/dashboard/admin/organizations',
      '/dashboard/admin/feature-flags',
      '/dashboard/admin/demo',
      '/dashboard/admin/tracker',
    ];
    for (const route of adminLinks) {
      const res = await page.goto(route);
      expect(res?.status(), `Expected 200 for ${route}`).toBe(200);
      await expect(page).toHaveURL(route);
    }
  });

  test('admin health page from admin dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await page.click('a[href="/dashboard/admin/health"]');
    await expect(page).toHaveURL('/dashboard/admin/health');
  });
});
