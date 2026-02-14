import { test, expect } from '@playwright/test';

test.describe('Subscriptions', () => {
  test('subscriptions page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Should redirect to login (or show login prompt)
    await expect(page).toHaveURL(/\/login/);
  });

  test('subscriptions page shows content or empty state when authenticated', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Test user not configured');

    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/dashboard/subscriptions');
    await expect(page).toHaveURL(/\/dashboard\/subscriptions/);

    // Either "My Subscriptions" heading or empty state
    const heading = page.locator('h1');
    await expect(heading).toContainText(/subscriptions|Subscriptions/i);
  });
});
