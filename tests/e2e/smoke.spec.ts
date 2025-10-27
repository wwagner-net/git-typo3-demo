import { test, expect, Page } from '@playwright/test';

// Helper functions for common checks
async function checkCommonElements(page: Page) {
  // Search input field (on all pages)
  const searchInput = page.locator('#tx-indexedsearch-searchbox-sword');
  await expect(searchInput).toBeAttached();

  // Logo in header (on all pages)
  const logo = page.locator('#header img[src*="innovatech_logo.svg"]');
  await expect(logo).toBeVisible();
}

async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

test.describe('Innovatech Solutions - Site Tests', () => {
  test('Homepage - Content and Links', async ({ page }) => {
    await navigateAndWait(page, '/');

    // Specific homepage content
    await expect(page.getByText('Willkommen bei Innovatech Solutions')).toBeVisible();
    await expect(page.locator('a:has-text("Schreib mir ne Mail")')).toBeVisible();

    // Common elements
    await checkCommonElements(page);
  });

  test('Blog page - Main Content', async ({ page }) => {
    await navigateAndWait(page, '/blog');

    // Specific blog content
    await expect(page.getByText('Content im Hauptbereich')).toBeVisible();

    // Common elements
    await checkCommonElements(page);
  });

  test('Kontakt page - Contact Form', async ({ page }) => {
    await navigateAndWait(page, '/kontakt');

    // Specific contact form
    await expect(page.locator('#kontaktformular-30-text-1')).toBeVisible();

    // Common elements
    await checkCommonElements(page);
  });

  test('English page - Language Check', async ({ page }) => {
    await navigateAndWait(page, '/en/');

    // Language validation
    const langAttr = await page.locator('html').getAttribute('lang');
    expect(langAttr).toContain('en');

    // Common elements
    await checkCommonElements(page);
  });

  test('TYPO3 Backend - Accessibility', async ({ page }) => {
    const response = await page.goto('/typo3');

    // Response validation
    expect(response?.status()).toBeLessThan(400);

    // Login form presence
    const loginForm = page.locator('form, input[name="username"], input[name="userident"]');
    await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
  });
});
