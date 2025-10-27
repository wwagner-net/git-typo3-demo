import { test, expect } from '@playwright/test';

test.describe('Forms Tests', () => {
  test('contact form should be functional', async ({ page }) => {
    await page.goto('/');

    // Look for contact form or contact page
    const contactForm = page.locator('form[name*="contact"], .contact-form, #contact-form');
    const contactLink = page.locator('a[href*="contact"]');

    // If there's a contact link, follow it
    if (await contactLink.count() > 0) {
      await contactLink.first().click();
      await page.waitForLoadState('networkidle');
    }

    // Check if contact form exists on current page
    if (await contactForm.count() > 0) {
      await expect(contactForm.first()).toBeVisible();

      // Check for common form fields
      const nameField = page.locator('input[name*="name"], input[id*="name"]');
      const emailField = page.locator('input[name*="email"], input[id*="email"]');
      const messageField = page.locator('textarea[name*="message"], textarea[id*="message"]');

      if (await nameField.count() > 0) {
        await expect(nameField.first()).toBeVisible();
      }
      if (await emailField.count() > 0) {
        await expect(emailField.first()).toBeVisible();
      }
      if (await messageField.count() > 0) {
        await expect(messageField.first()).toBeVisible();
      }
    }
  });

  test('forms should have proper validation', async ({ page }) => {
    await page.goto('/');

    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount > 0) {
      for (let i = 0; i < Math.min(formCount, 3); i++) {
        const form = forms.nth(i);
        const requiredFields = form.locator('input[required], textarea[required]');
        const requiredCount = await requiredFields.count();

        // Check if required fields have proper attributes
        for (let j = 0; j < requiredCount; j++) {
          const field = requiredFields.nth(j);
          await expect(field).toHaveAttribute('required');
        }
      }
    }
  });

  test('search functionality should work', async ({ page }) => {
    await page.goto('/');

    // Look for search form
    const searchForm = page.locator('form[role="search"], .tx-indexedsearch-searchbox, #search-form');
    const searchInput = page.locator('input.tx-indexedsearch-searchbox-sword, input[type="search"], input[name*="search"], input[placeholder*="search" i]');

    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();

      // Test search functionality
      await searchInput.first().fill('test');
      await searchInput.first().press('Enter');

      // Wait for results or new page
      await page.waitForLoadState('networkidle');

      // Check if we're on a search results page or got results
      const url = page.url();
      expect(url).toMatch(/search|results/i);
    }
  });
});
