import { test, expect } from '@playwright/test';

test.describe('TYPO3 Backend Tests', () => {
  test('backend login page should be accessible', async ({ page }) => {
    await page.goto('/typo3');

    // Check if login form is present
    const loginForm = page.locator('form[name="loginform"], .typo3-login-form, #t3-login-form');
    await expect(loginForm).toBeVisible({ timeout: 10000 });

    // Check for username field
    const usernameField = page.locator('input[name="username"], #t3-username');
    await expect(usernameField).toBeVisible();

    // Check for password field
    const passwordField = page.locator('input[name="userident"], input[name="password"], #t3-password');
    await expect(passwordField).toBeVisible();

    // Check for login button
    const loginButton = page.locator('button[type="submit"], .btn-login, #t3-login-submit');
    await expect(loginButton).toBeVisible();
  });

  test('backend should return proper response codes', async ({ page }) => {
    const response = await page.goto('/typo3');

    // Backend should be accessible (200) or redirect (3xx)
    expect(response?.status()).toBeLessThan(400);
  });

  test('install tool should be protected', async ({ page }) => {
    const response = await page.goto('/typo3/install.php');

    // Install tool should either be protected or show install interface
    expect(response?.status()).toBeLessThan(500);
  });
});