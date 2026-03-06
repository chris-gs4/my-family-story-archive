#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function generateLandingPagePDF() {
  console.log('🚀 Starting PDF generation with Playwright...');

  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1920,
        height: 1080,
      },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    console.log(`📡 Navigating to ${serverUrl}...`);

    await page.goto(serverUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('✅ Page loaded successfully');

    // Wait for all images to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('load');

    // Force all Next.js Image components to load eagerly
    await page.evaluate(() => {
      // Remove loading="lazy" from all images
      document.querySelectorAll('img').forEach(img => {
        img.loading = 'eager';
        // Force decode
        if (img.decode) {
          img.decode().catch(() => {});
        }
      });
    });

    // Wait for all images to actually load
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete && img.naturalHeight > 0);
    }, { timeout: 10000 }).catch(() => {
      console.log('⚠️  Some images may not have loaded');
    });

    // Give extra time for images to render
    await page.waitForTimeout(3000);

    console.log('✅ All content ready');

    // Inject CSS to prevent page breaks, remove shadows, and optimize for single-page PDF
    await page.addStyleTag({
      content: `
        @media print {
          * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .grid > div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Remove all box shadows and webkit tap highlights */
          button, a, div, img {
            box-shadow: none !important;
            -webkit-box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
        }
      `
    });

    // Get the full page height
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    // Generate PDF
    const pdfPath = join(projectRoot, 'mabel-landing-page.pdf');

    await page.pdf({
      path: pdfPath,
      width: '1920px',
      height: `${bodyHeight}px`,
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      pageRanges: '1',
    });

    console.log(`✅ PDF generated successfully: ${pdfPath}`);

    return pdfPath;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
generateLandingPagePDF()
  .then((path) => {
    console.log('\n🎉 Done! Your PDF is ready for demo night.');
    console.log(`📄 Location: ${path}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to generate PDF:', error.message);
    console.log('\n💡 Make sure your dev server is running:');
    console.log('   npm run dev');
    console.log('\nThen run this script again:');
    console.log('   npm run generate:pdf');
    process.exit(1);
  });
