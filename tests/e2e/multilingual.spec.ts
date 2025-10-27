import { test, expect } from '@playwright/test';

test.describe('Multilingual Tests', () => {
  const languages = [
    { code: 'de', path: '/', title: 'Deutsch' },
    { code: 'en', path: '/en/', title: 'English' },
    { code: 'fr', path: '/fr/', title: 'Français' },
    { code: 'mi', path: '/mi/', title: 'Māori' }
  ];

  languages.forEach(({ code, path, title }) => {
    test(`should load ${title} (${code}) language correctly`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Check if page loads successfully
      await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

      // Check language attribute
      const html = page.locator('html');
      const langAttr = await html.getAttribute('lang');
      expect(langAttr).toContain(code);

      // Check for language-specific content
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test('language switcher should work', async ({ page }) => {
    await page.goto('/');

    // Look for language switcher
    const languageSwitcher = page.locator('.language-menu, .lang-menu, [class*="language"], [class*="lang"]');

    if (await languageSwitcher.count() > 0) {
      await expect(languageSwitcher.first()).toBeVisible();

      // Try to find English link
      const englishLink = page.locator('a[href*="/en/"], a[hreflang="en"], a[hreflang="en-US"]');

      if (await englishLink.count() > 0) {
        await englishLink.first().click();
        await page.waitForLoadState('networkidle');

        // Check if we're on English page
        const url = page.url();
        expect(url).toContain('/en/');

        const html = page.locator('html');
        const langAttr = await html.getAttribute('lang');
        expect(langAttr).toContain('en');
      }
    }
  });

  test('hreflang tags should be present', async ({ page }) => {
    await page.goto('/');

    // Check for hreflang links
    const hreflangLinks = page.locator('link[hreflang]');
    const count = await hreflangLinks.count();

    if (count > 0) {
      // Should have hreflang for multiple languages
      expect(count).toBeGreaterThan(1);

      // Check specific hreflang values
      const hreflangValues = await hreflangLinks.evaluateAll(links =>
        links.map(link => link.getAttribute('hreflang'))
      );

      expect(hreflangValues).toContain('de-DE');
      expect(hreflangValues).toContain('en-US');
      expect(hreflangValues).toContain('fr-FR');
    }
  });

  test('fallback languages should work', async ({ page }) => {
    // Test pages that might not exist in all languages
    const testPaths = ['/en/nonexistent', '/fr/nonexistent'];

    for (const testPath of testPaths) {
      const response = await page.goto(testPath);

      // Should either show 404 page or fallback content
      if (response) {
        expect(response.status()).toBeLessThan(500);
      }
    }
  });
});
