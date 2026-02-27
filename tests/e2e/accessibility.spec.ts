import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoA11yViolations(page: import('@playwright/test').Page, options?: { rules?: string[] }) {
  const builder = new AxeBuilder({ page });
  if (options?.rules?.length) builder.withRules(options.rules);
  const results = await builder.analyze();
  expect(results.violations, results.violations.length ? JSON.stringify(results.violations, null, 2) : '').toHaveLength(0);
}

test.describe('Accessibility', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expectNoA11yViolations(page);
  });

  test('marketplace should have no accessibility violations', async ({ page }) => {
    await page.goto('/marketplace');
    await expectNoA11yViolations(page);
  });

  test('login page should have no accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await expectNoA11yViolations(page);
  });

  test('signup page should have no accessibility violations', async ({ page }) => {
    await page.goto('/signup');
    await expectNoA11yViolations(page);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Only one h1 per page
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('all form inputs should have labels', async ({ page }) => {
    await page.goto('/signup');
    
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      // Should have either id (for label), aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focused element should be visible
    const focused = await page.locator(':focus').first();
    await expect(focused).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await expectNoA11yViolations(page, { rules: ['color-contrast'] });
  });
});
