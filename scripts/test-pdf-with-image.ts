// Test PDF generation with image
// Run with: npx tsx scripts/test-pdf-with-image.ts

import { PrismaClient } from '@prisma/client';
import { generateChapterPDF } from '../src/lib/services/documentGenerator';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function testPDFWithImage() {
  console.log('🧪 Testing PDF Generation with Image\n');

  try {
    // Find the demo user's Test Project
    const project = await prisma.project.findFirst({
      where: {
        title: 'Test Project',
        user: {
          email: 'demo@mabel.com'
        }
      },
      include: {
        interviewee: true,
        modules: {
          include: {
            chapters: {
              orderBy: { version: 'desc' },
              take: 1
            }
          },
          take: 1
        }
      }
    });

    if (!project || !project.modules[0] || !project.modules[0].chapters[0]) {
      console.log('❌ Test Project or chapter not found');
      return;
    }

    const module = project.modules[0];
    const chapter = project.modules[0].chapters[0];

    console.log(`✅ Found project: "${project.title}"`);
    console.log(`✅ Module: "${module.title}"`);
    console.log(`✅ Chapter has illustration: ${chapter.illustrationUrl ? 'YES' : 'NO'}`);

    if (chapter.illustrationUrl) {
      console.log(`   Image URL: ${chapter.illustrationUrl.substring(0, 80)}...`);
    }

    // Generate PDF
    console.log('\n📄 Generating PDF...');

    const pdfData = await generateChapterPDF(
      {
        moduleNumber: module.moduleNumber,
        title: module.title ?? undefined,
        content: chapter.content,
        wordCount: chapter.wordCount ?? undefined,
        illustrationUrl: chapter.illustrationUrl
      },
      project.interviewee?.name ?? undefined,
      project.title
    );

    // Save PDF
    const outputDir = path.join(process.cwd(), 'test-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfPath = path.join(outputDir, 'test-with-fixes.pdf');
    fs.writeFileSync(pdfPath, pdfData.buffer);

    console.log(`\n✅ PDF Generated Successfully!`);
    console.log(`   File: ${pdfPath}`);
    console.log(`   Size: ${(pdfData.buffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n📝 Checks:`);
    console.log(`   • Consistent text formatting: Should be fixed`);
    console.log(`   • Image at bottom: ${chapter.illustrationUrl ? 'Should be included' : 'No image to include'}`);
    console.log(`\n💡 Open the PDF to verify both fixes worked!`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPDFWithImage()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
