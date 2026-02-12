import { test, expect } from '@playwright/test';

test.describe('Marketplace Catalog', () => {
  test('should display marketplace page', async ({ page }) => {
    await page.goto('/marketplace');
    
    await expect(page.locator('h1')).toContainText(/marketplace|discover/i);
  });

  test('should show search input', async ({ page }) => {
    await page.goto('/marketplace');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/marketplace');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill('payment');
    await searchInput.press('Enter');
    
    // URL should contain search query
    await expect(page).toHaveURL(/q=payment/);
  });

  test('should display API cards', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="api-card"], .api-card, article', { 
      timeout: 5000 
    }).catch(() => {});
    
    // Check if any content is displayed (could be cards or empty state)
    const hasCards = await page.locator('[data-testid="api-card"], .api-card, article').count() > 0;
    const hasEmptyState = await page.locator('text=/no.*apis?|empty/i').isVisible().catch(() => false);
    
    expect(hasCards || hasEmptyState).toBeTruthy();
  });

  test('should navigate to API detail page', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Wait for and click first API card link
    const firstApiLink = page.locator('a[href*="/marketplace/"]').first();
    
    if (await firstApiLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstApiLink.click();
      
      // Should be on an API detail page
      await expect(page).toHaveURL(/\/marketplace\/[^/]+\/[^/]+/);
    } else {
      test.skip(true, 'No APIs available in marketplace');
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/marketplace');
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Search should still be visible on mobile
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
  });
});
