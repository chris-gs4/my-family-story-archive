import { Page } from '@playwright/test';

/**
 * Test user credentials
 */
export const TEST_USER = {
  email: 'demo@mabel.com',
  password: 'demo123',
  name: 'Sarah Mitchell',
};

/**
 * Login helper - logs in a user and waits for redirect to dashboard
 */
export async function login(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto('/auth/signin');

  // Fill in credentials
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  // Click user name/email to open dropdown (look for the button containing user info)
  await page.click('button:has-text("@"), button:has-text("Sarah Mitchell"), button:has-text("demo@")');

  // Wait for dropdown to appear and click "Log Out"
  await page.click('text=Log Out');

  // Wait for redirect to home or login page
  await page.waitForURL(/\/(|auth\/signin)/);
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check if user menu or dashboard elements are visible
    const userMenu = page.locator('[data-testid="user-menu"], [aria-label="User menu"]');
    return await userMenu.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}
