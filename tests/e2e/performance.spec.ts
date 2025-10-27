import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('homepage should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Homepage should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have excessive resource requests', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not have excessive number of requests (adjust threshold as needed)
    expect(requests.length).toBeLessThan(100);
  });

  test('should not have 404 errors for assets', async ({ page }) => {
    const failed404s: string[] = [];

    page.on('response', response => {
      if (response.status() === 404) {
        failed404s.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Log any 404s for debugging
    if (failed404s.length > 0) {
      console.log('404 errors found:', failed404s);
    }

    // Allow some 404s for optional resources, but not too many
    expect(failed404s.length).toBeLessThan(5);
  });
});