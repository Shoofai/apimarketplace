import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display signup form', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.locator('h1')).toContainText('Sign up');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('h1')).toContainText('Sign in');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=/password.*8 characters/i')).toBeVisible();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // This test would require a test user account
    // Skip in CI unless test accounts are configured
    test.skip(!process.env.TEST_USER_EMAIL, 'Test user not configured');
    
    await page.goto('/login');
    
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
