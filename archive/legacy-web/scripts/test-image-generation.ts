// Test script for image generation workflow
// Creates a new project, generates two chapters with images, and exports PDFs
// Run with: npx tsx scripts/test-image-generation.ts

import { PrismaClient } from '@prisma/client';
import { openAIService } from '../src/lib/services/openai';
import { generateChapterPDF } from '../src/lib/services/documentGenerator';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function testImageGenerationWorkflow() {
  console.log('🧪 Testing Image Generation Workflow\n');
  console.log('=' . repeat(60));

  try {
    // 1. Find or create test user
    console.log('\n📝 Step 1: Finding test user...');
    let user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('   ℹ️  Test user not found, creating one...');
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password_here'
        }
      });
    }
    console.log(`   ✅ User found: ${user.email} (ID: ${user.id})`);

    // 2. Create new project for Sarah Mitchell
    console.log('\n📝 Step 2: Creating new project for Sarah Mitchell...');
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: 'Sarah Mitchell - Image Generation Test',
        status: 'DRAFT',
        currentModuleNumber: 1,
        interviewee: {
          create: {
            name: 'Sarah Mitchell',
            relationship: 'Grandmother',
            birthYear: 1945,
            generation: 'Silent Generation',
            topics: ['childhood', 'career', 'family']
          }
        }
      },
      include: {
        interviewee: true
      }
    });
    console.log(`   ✅ Project created: ${project.title} (ID: ${project.id})`);
    console.log(`   ✅ Interviewee: ${project.interviewee?.name}`);

    // 3. Create Module 1 with questions
    console.log('\n📝 Step 3: Creating Module 1 with questions...');
    const module1 = await prisma.module.create({
      data: {
        projectId: project.id,
        moduleNumber: 1,
        title: 'Early Life & Foundations',
        theme: 'Childhood and early years',
        status: 'DRAFT'
      }
    });
    console.log(`   ✅ Module 1 created: ${module1.title}`);

    // Generate questions for Module 1
    console.log('   🤖 Generating questions with AI...');
    const questions = await openAIService.generateQuestions({
      name: project.interviewee!.name,
      relationship: project.interviewee!.relationship,
      birthYear: project.interviewee!.birthYear ?? undefined,
      generation: project.interviewee!.generation ?? undefined,
      topics: project.interviewee!.topics as string[]
    }, 5);

    console.log(`   ✅ Generated ${questions.length} questions`);

    // Save questions with sample responses
    const sampleResponses = [
      'I grew up in a small town in Ohio during the 1950s. Life was simple but filled with warmth and community spirit.',
      'My parents were hardworking people who taught me the value of honesty and perseverance.',
      'I remember playing outside with neighborhood children until the streetlights came on.',
      'Education was very important in our family. My father always said it was the key to opportunity.',
      'We didn\'t have much, but we had each other and that was everything.'
    ];

    await prisma.moduleQuestion.createMany({
      data: questions.map((q, index) => ({
        moduleId: module1.id,
        question: q.question,
        category: q.category,
        order: index + 1,
        response: sampleResponses[index % sampleResponses.length]
      }))
    });

    console.log('   ✅ Questions saved with sample responses');

    // 4. Generate Chapter 1
    console.log('\n📝 Step 4: Generating Chapter 1...');
    const questionsWithResponses = await prisma.moduleQuestion.findMany({
      where: { moduleId: module1.id }
    });

    const questionAnswerPairs = questionsWithResponses.map(q => ({
      question: q.question,
      response: q.response!,
      category: q.category
    }));

    const chapterContent1 = await openAIService.generateChapter(questionAnswerPairs);
    const wordCount1 = chapterContent1.split(/\s+/).length;

    const chapter1 = await prisma.moduleChapter.create({
      data: {
        moduleId: module1.id,
        content: chapterContent1,
        wordCount: wordCount1,
        version: 1
      }
    });

    console.log(`   ✅ Chapter 1 generated (${chapter1.wordCount} words)`);

    // Update module status
    await prisma.module.update({
      where: { id: module1.id },
      data: { status: 'CHAPTER_GENERATED' }
    });

    // 5. Generate Image for Chapter 1
    console.log('\n📝 Step 5: Generating illustration for Chapter 1...');

    // Extract theme from chapter content
    const theme1 = 'childhood memories and early life in 1950s Ohio';
    const imagePrompt1 = `Minimalist black and white line drawing sketch for ${project.interviewee!.name}'s story about ${theme1}.
Hand-drawn illustration style with clean, simple lines.
Like a thoughtful book illustration - not detailed or realistic, just capturing the essence.
No shading, no background clutter, just elegant linework on white background.
Warm and nostalgic feeling, suitable for a family memoir.`;

    console.log(`   🎨 Prompt: ${imagePrompt1.substring(0, 100)}...`);

    const { url: imageUrl1, revisedPrompt: revisedPrompt1 } = await openAIService.generateImage(imagePrompt1, {
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    });

    await prisma.moduleChapter.update({
      where: { id: chapter1.id },
      data: {
        illustrationUrl: imageUrl1,
        illustrationPrompt: revisedPrompt1,
        illustrationGeneratedAt: new Date()
      }
    });

    await prisma.module.update({
      where: { id: module1.id },
      data: {
        coverImageUrl: imageUrl1,
        coverImagePrompt: revisedPrompt1,
        coverImageGeneratedAt: new Date()
      }
    });

    console.log(`   ✅ Illustration generated and saved`);
    console.log(`   🖼️  URL: ${imageUrl1.substring(0, 80)}...`);

    // 6. Create Module 2
    console.log('\n📝 Step 6: Creating Module 2...');
    const module2 = await prisma.module.create({
      data: {
        projectId: project.id,
        moduleNumber: 2,
        title: 'Career & Relationships',
        theme: 'Professional life and family',
        status: 'DRAFT'
      }
    });
    console.log(`   ✅ Module 2 created: ${module2.title}`);

    // Generate follow-up questions
    console.log('   🤖 Generating follow-up questions...');
    const previousQuestions = questionsWithResponses.map(q => ({
      question: q.question,
      response: q.response!,
      category: q.category
    }));

    const followUpQuestions = await openAIService.generateFollowUpQuestions(
      {
        name: project.interviewee!.name,
        relationship: project.interviewee!.relationship,
        birthYear: project.interviewee!.birthYear ?? undefined,
        generation: project.interviewee!.generation ?? undefined,
        topics: project.interviewee!.topics as string[]
      },
      previousQuestions,
      2
    );

    console.log(`   ✅ Generated ${followUpQuestions.length} follow-up questions`);

    const sampleResponses2 = [
      'I started my career as a teacher in 1967, during a time of great social change.',
      'Meeting my husband was the best thing that ever happened to me. We met at a community dance.',
      'Raising children while working was challenging but incredibly rewarding.',
      'I witnessed tremendous changes in education and society over my 35-year teaching career.',
      'Family has always been my anchor through all of life\'s ups and downs.'
    ];

    await prisma.moduleQuestion.createMany({
      data: followUpQuestions.map((q, index) => ({
        moduleId: module2.id,
        question: q.question,
        category: q.category,
        order: index + 1,
        response: sampleResponses2[index % sampleResponses2.length]
      }))
    });

    console.log('   ✅ Follow-up questions saved with responses');

    // 7. Generate Chapter 2
    console.log('\n📝 Step 7: Generating Chapter 2...');
    const questionsWithResponses2 = await prisma.moduleQuestion.findMany({
      where: { moduleId: module2.id }
    });

    const questionAnswerPairs2 = questionsWithResponses2.map(q => ({
      question: q.question,
      response: q.response!,
      category: q.category
    }));

    const chapterContent2 = await openAIService.generateChapter(questionAnswerPairs2);
    const wordCount2 = chapterContent2.split(/\s+/).length;

    const chapter2 = await prisma.moduleChapter.create({
      data: {
        moduleId: module2.id,
        content: chapterContent2,
        wordCount: wordCount2,
        version: 1
      }
    });

    console.log(`   ✅ Chapter 2 generated (${chapter2.wordCount} words)`);

    await prisma.module.update({
      where: { id: module2.id },
      data: { status: 'CHAPTER_GENERATED' }
    });

    // 8. Generate Image for Chapter 2
    console.log('\n📝 Step 8: Generating illustration for Chapter 2...');

    const theme2 = 'teaching career and family life';
    const imagePrompt2 = `Minimalist black and white line drawing sketch for ${project.interviewee!.name}'s story about ${theme2}.
Hand-drawn illustration style with clean, simple lines.
Like a thoughtful book illustration - not detailed or realistic, just capturing the essence.
No shading, no background clutter, just elegant linework on white background.
Warm and nostalgic feeling, suitable for a family memoir.`;

    console.log(`   🎨 Prompt: ${imagePrompt2.substring(0, 100)}...`);

    const { url: imageUrl2, revisedPrompt: revisedPrompt2 } = await openAIService.generateImage(imagePrompt2, {
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    });

    await prisma.moduleChapter.update({
      where: { id: chapter2.id },
      data: {
        illustrationUrl: imageUrl2,
        illustrationPrompt: revisedPrompt2,
        illustrationGeneratedAt: new Date()
      }
    });

    await prisma.module.update({
      where: { id: module2.id },
      data: {
        coverImageUrl: imageUrl2,
        coverImagePrompt: revisedPrompt2,
        coverImageGeneratedAt: new Date()
      }
    });

    console.log(`   ✅ Illustration generated and saved`);
    console.log(`   🖼️  URL: ${imageUrl2.substring(0, 80)}...`);

    // 9. Export PDFs
    console.log('\n📝 Step 9: Exporting PDFs...');

    const outputDir = path.join(process.cwd(), 'test-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Export Chapter 1 PDF
    console.log('   📄 Generating Chapter 1 PDF...');
    const pdf1 = await generateChapterPDF(
      {
        moduleNumber: 1,
        title: module1.title ?? undefined,
        content: chapter1.content,
        wordCount: chapter1.wordCount ?? undefined,
        illustrationUrl: imageUrl1
      },
      project.interviewee!.name,
      project.title
    );

    const pdf1Path = path.join(outputDir, 'sarah-mitchell-chapter-1.pdf');
    fs.writeFileSync(pdf1Path, pdf1.buffer);
    console.log(`   ✅ Chapter 1 PDF saved: ${pdf1Path}`);

    // Export Chapter 2 PDF
    console.log('   📄 Generating Chapter 2 PDF...');
    const pdf2 = await generateChapterPDF(
      {
        moduleNumber: 2,
        title: module2.title ?? undefined,
        content: chapter2.content,
        wordCount: chapter2.wordCount ?? undefined,
        illustrationUrl: imageUrl2
      },
      project.interviewee!.name,
      project.title
    );

    const pdf2Path = path.join(outputDir, 'sarah-mitchell-chapter-2.pdf');
    fs.writeFileSync(pdf2Path, pdf2.buffer);
    console.log(`   ✅ Chapter 2 PDF saved: ${pdf2Path}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`  • Project: ${project.title}`);
    console.log(`  • Interviewee: ${project.interviewee!.name}`);
    console.log(`  • Modules created: 2`);
    console.log(`  • Chapters generated: 2`);
    console.log(`  • Illustrations generated: 2`);
    console.log(`  • PDFs exported: 2`);
    console.log(`\n📂 PDFs saved to: ${outputDir}`);
    console.log(`  • ${path.basename(pdf1Path)}`);
    console.log(`  • ${path.basename(pdf2Path)}`);
    console.log('\n💡 You can open these PDFs to verify the illustrations are included!');
    console.log('\n🎨 Total OpenAI Cost: $${openAIService.getTotalCost().toFixed(4)}');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testImageGenerationWorkflow()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
