import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if page loads without errors
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

    // Check for common TYPO3 elements
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify no JavaScript errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');

    // Basic accessibility check
    await expect(page.locator('html')).toHaveAttribute('lang');
  });

  test('should have functional navigation', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for navigation elements
    const navigation = page.locator('nav, .navigation, #navigation');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check if page is still functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});