import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './utils/auth';
import { TEST_INTERVIEWEE, SAMPLE_QUESTION_RESPONSE } from './utils/test-data';

test.describe('Module Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create a new project with interviewee', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');

    // Click "New Project" button
    await page.click('button:has-text("New Project")');

    // Should redirect to setup page - fill in interviewee information
    await expect(page).toHaveURL(/.*\/setup/, { timeout: 5000 });

    // Wait for the setup form to load (uses id attributes, not name)
    await page.waitForSelector('#name', { timeout: 5000 });

    await page.fill('#name', TEST_INTERVIEWEE.name);
    await page.selectOption('#relationship', TEST_INTERVIEWEE.relationship);
    await page.fill('#birthYear', TEST_INTERVIEWEE.birthYear.toString());

    // Submit interviewee form - button text is "Start My Story →"
    await page.click('button:has-text("Start My Story")');

    // Should redirect to questions page (not modules page directly)
    await expect(page).toHaveURL(/.*\/questions/, { timeout: 10000 });
  });

  test('should navigate to existing project with questions', async ({ page }) => {
    // Note: This test assumes test seed script has been run (npm run test:seed)
    // That creates a project with Robert Johnson and generated questions

    // login() already put us on dashboard, just wait for it to be ready
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible({ timeout: 10000 });

    // Wait a bit for project cards to render
    await page.waitForTimeout(2000);

    // Look for "E2E Test Project" using getByText
    await page.getByText('E2E Test Project', { exact: true }).first().click();

    // Should be on modules page
    await expect(page).toHaveURL(/.*\/modules/, { timeout: 5000 });

    // Should see module cards with "Story Modules" heading
    await expect(page.locator('h1:has-text("Story Modules")')).toBeVisible();
  });

  test('should view approved module chapters', async ({ page }) => {
    // Note: Test seed creates APPROVED modules with completed chapters
    // login() already put us on dashboard, just wait for it to be ready
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.getByText('E2E Test Project', { exact: true }).first().click();
    await expect(page).toHaveURL(/.*\/modules/);

    // Since modules are approved, should see "View chapter" buttons
    const viewChapterButton = page.locator('button:has-text("View chapter")').first();
    await expect(viewChapterButton).toBeVisible();

    // Click to view the chapter
    await viewChapterButton.click();

    // Should be on chapter page
    await expect(page).toHaveURL(/.*\/chapter/, { timeout: 5000 });

    // Should see chapter content and metadata
    await expect(page.locator('text=Word Count')).toBeVisible();
    await expect(page.locator('text=Version')).toBeVisible();
  });

  test('should show approved status on completed modules', async ({ page }) => {
    // Note: Test seed creates approved modules
    // login() already put us on dashboard, just wait for it to be ready
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.getByText('E2E Test Project', { exact: true }).first().click();
    await expect(page).toHaveURL(/.*\/modules/);

    // Should see approved status indicators (could be "Chapter approved" or "Complete")
    const approvedIndicator = page.locator('text=Chapter approved').or(page.locator('text=Complete')).first();
    await expect(approvedIndicator).toBeVisible({ timeout: 5000 });

    // Click to view an approved chapter
    await page.click('button:has-text("View chapter")');
    await expect(page).toHaveURL(/.*\/chapter/);

    // Should see "Module Approved" badge
    await expect(page.locator('text=Module Approved')).toBeVisible();
  });

  test('should display chapter page with content and metadata', async ({ page }) => {
    // Note: Test seed creates approved modules
    // login() already put us on dashboard, just wait for it to be ready
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.getByText('E2E Test Project', { exact: true }).first().click();

    // Click on any approved module to view chapter
    const viewButton = page.locator('button:has-text("View chapter")').first();
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // Should be on chapter page
    await expect(page).toHaveURL(/.*\/chapter/, { timeout: 5000 });

    // Should see chapter metadata
    await expect(page.locator('text=Word Count')).toBeVisible();
    await expect(page.locator('text=Version')).toBeVisible();
    await expect(page.locator('text=Narrative')).toBeVisible();

    // Should see Download PDF button
    await expect(page.locator('button:has-text("Download PDF")')).toBeVisible();
  });

  test('should hide regenerate button on approved modules', async ({ page }) => {
    // Note: Approved modules shouldn't show Regenerate button
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible();
    await page.waitForTimeout(2000);

    await page.getByText('E2E Test Project', { exact: true }).first().click();

    // Click to view an approved chapter
    await page.click('button:has-text("View chapter")');
    await expect(page).toHaveURL(/.*\/chapter/);

    // Should see "Module Approved" indicator
    await expect(page.locator('text=Module Approved')).toBeVisible();

    // Regenerate button should NOT be visible (approved chapters are locked)
    const regenerateButton = page.locator('button:has-text("Regenerate")');
    await expect(regenerateButton).not.toBeVisible();

    // Should be able to download PDF though
    await expect(page.locator('button:has-text("Download PDF")')).toBeVisible();
  });

  test('should show create next module button', async ({ page }) => {
    // Navigate to modules page
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("My Story Projects")')).toBeVisible();
    await page.waitForTimeout(2000);

    await page.getByText('E2E Test Project', { exact: true }).first().click();
    await expect(page).toHaveURL(/.*\/modules/);

    // Should see button to create next module
    await expect(page.locator('button:has-text("Create Next Module"), button:has-text("Create First Module")')).toBeVisible();
  });
});
