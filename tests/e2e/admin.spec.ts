import { test, expect } from '@playwright/test';

test.describe('Admin access', () => {
  test('unauthenticated user cannot access admin and is redirected to login', async ({ page }) => {
    await page.goto('/dashboard/admin');

    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated non-admin user cannot access admin and is redirected to dashboard', async ({
    page,
  }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Test user not configured');

    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/dashboard/admin');
    // Non-admin should be redirected to dashboard, not remain on /dashboard/admin
    await expect(page).not.toHaveURL(/\/dashboard\/admin/);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
