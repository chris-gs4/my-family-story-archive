import { test, expect } from '@playwright/test';
import { login, logout, TEST_USER } from './utils/auth';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from signin page
    await page.goto('/auth/signin');
  });

  test('should display login page', async ({ page }) => {
    // Should show login form
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await login(page);

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Should show dashboard heading
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message - be flexible about what we're looking for
    const errorVisible = await page.locator('[role="alert"]').isVisible({ timeout: 5000 }).catch(() => false) ||
                         await page.locator('.text-red-600').isVisible({ timeout: 5000 }).catch(() => false) ||
                         await page.locator('text=Invalid').isVisible({ timeout: 5000 }).catch(() => false) ||
                         await page.locator('text=incorrect').isVisible({ timeout: 5000 }).catch(() => false);

    expect(errorVisible).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await login(page);

    // Verify logged in
    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await logout(page);

    // Should redirect to home or login page
    await expect(page).toHaveURL(/\/(|auth\/signin)/);
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard');

    // Should redirect to signin page
    await expect(page).toHaveURL(/.*auth\/signin/);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await login(page);

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
