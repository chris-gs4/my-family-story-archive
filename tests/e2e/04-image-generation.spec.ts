import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Image Generation and PDF Export', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'demo@familystoryarchive.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should generate chapter image and export PDF with image', async ({ page }) => {
    // Navigate to Test Project
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Find and click Test Project
    const testProject = page.getByText('Test Project').first();
    await testProject.click();

    // Wait for modules page
    await page.waitForURL(/\/projects\/.*\/modules/);
    await page.waitForTimeout(1000);

    // Click View chapter on Module 1
    await page.getByText('View chapter').first().click();

    // Wait for chapter page
    await page.waitForURL(/\/chapter$/);
    await page.waitForTimeout(1000);

    // Scroll to Chapter Illustration section
    const illustrationSection = page.locator('text=Chapter Illustration').first();
    await illustrationSection.scrollIntoViewIfNeeded();

    // Check if image already exists
    const hasImage = await page.locator('img[alt="Chapter illustration"]').count() > 0;

    if (!hasImage) {
      // Click Auto-generate Image button
      const generateButton = page.getByRole('button', { name: /Auto-generate Image/i });
      await expect(generateButton).toBeVisible();
      await generateButton.click();

      // Wait for image generation (up to 45 seconds)
      await page.waitForTimeout(2000); // Initial wait

      // Wait for the image to appear (with longer timeout for DALL-E)
      await expect(page.locator('img[alt="Chapter illustration"]')).toBeVisible({ timeout: 45000 });

      console.log('✅ Image generated successfully');
    } else {
      console.log('✅ Image already exists');
    }

    // Verify no prompt text is shown
    const promptText = page.locator('text=/Prompt:/i');
    await expect(promptText).not.toBeVisible();
    console.log('✅ Prompt text is hidden');

    // Test PDF export
    const downloadPromise = page.waitForEvent('download');
    const pdfButton = page.getByRole('button', { name: /Download PDF/i });
    await pdfButton.click();

    const download = await downloadPromise;
    const downloadPath = path.join(__dirname, '../../test-results', download.suggestedFilename());
    await download.saveAs(downloadPath);

    // Verify PDF was downloaded
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(10000); // PDF should be > 10KB
    console.log(`✅ PDF downloaded: ${download.suggestedFilename()} (${(stats.size / 1024).toFixed(2)} KB)`);

    // Navigate back to modules to verify cover image
    await page.goBack();
    await page.waitForTimeout(1000);

    // Verify module cover image is displayed
    const coverImage = page.locator('img[alt="Module cover"]').first();
    await expect(coverImage).toBeVisible();
    console.log('✅ Module cover image is displayed');
  });

  test('should show regenerate button on existing images', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    const testProject = page.getByText('Test Project').first();
    await testProject.click();

    await page.waitForURL(/\/projects\/.*\/modules/);
    await page.waitForTimeout(1000);

    await page.getByText('View chapter').first().click();
    await page.waitForURL(/\/chapter$/);
    await page.waitForTimeout(1000);

    // Check if image exists
    const hasImage = await page.locator('img[alt="Chapter illustration"]').count() > 0;

    if (hasImage) {
      // Should show Regenerate button instead of Auto-generate
      const regenerateButton = page.getByRole('button', { name: /Regenerate Image/i });
      await expect(regenerateButton).toBeVisible();
      console.log('✅ Regenerate button is shown for existing images');
    }
  });
});
