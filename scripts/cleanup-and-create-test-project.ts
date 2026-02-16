// Cleanup all test projects and create one clean project for Sarah Mitchell
// Run with: npx tsx scripts/cleanup-and-create-test-project.ts

import { PrismaClient } from '@prisma/client';
import { openAIService } from '../src/lib/services/openai';

const prisma = new PrismaClient();

async function cleanupAndCreateTestProject() {
  console.log('🧹 Cleaning up and creating test project...\n');

  try {
    // Find demo user (Sarah Mitchell)
    const user = await prisma.user.findUnique({
      where: { email: 'demo@mabel.com' }
    });

    if (!user) {
      console.log('❌ Demo user not found');
      return;
    }

    console.log(`✅ Found user: ${user.email}`);

    // Delete all existing projects for this user
    console.log('\n🗑️  Deleting all existing projects...');

    const deleteResult = await prisma.project.deleteMany({
      where: { userId: user.id }
    });

    console.log(`   ✅ Deleted ${deleteResult.count} projects`);

    // Create ONE clean test project
    console.log('\n📝 Creating clean test project...');

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: 'Test Project',
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

    console.log(`   ✅ Created project: "${project.title}"`);
    console.log(`   ✅ Interviewee: ${project.interviewee?.name}`);

    // Create Module 1
    console.log('\n📝 Creating Module 1...');
    const module1 = await prisma.module.create({
      data: {
        projectId: project.id,
        moduleNumber: 1,
        title: 'Early Life & Foundations',
        theme: 'Childhood memories',
        status: 'DRAFT'
      }
    });

    // Generate questions
    console.log('   🤖 Generating questions...');
    const questions = await openAIService.generateQuestions({
      name: project.interviewee!.name,
      relationship: project.interviewee!.relationship,
      birthYear: project.interviewee!.birthYear,
      generation: project.interviewee!.generation,
      topics: project.interviewee!.topics as string[]
    }, 5);

    const sampleResponses = [
      'I grew up in a small town in Ohio during the 1950s. Life was simple but filled with community spirit.',
      'My parents taught me the value of honesty and hard work. They were wonderful role models.',
      'I remember playing outside with friends until the streetlights came on. Those were carefree days.',
      'Education was very important to my family. My father always encouraged me to study and learn.',
      'We didn\'t have much money, but we had each other and that meant everything.'
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

    console.log(`   ✅ Created ${questions.length} questions with responses`);

    // Generate Chapter
    console.log('   📖 Generating chapter...');
    const questionsWithResponses = await prisma.moduleQuestion.findMany({
      where: { moduleId: module1.id }
    });

    const questionAnswerPairs = questionsWithResponses.map(q => ({
      question: q.question,
      response: q.response!,
      category: q.category
    }));

    const chapterContent = await openAIService.generateChapter(questionAnswerPairs);
    const wordCount = chapterContent.split(/\s+/).length;

    const chapter = await prisma.moduleChapter.create({
      data: {
        moduleId: module1.id,
        content: chapterContent,
        wordCount: wordCount,
        version: 1
      }
    });

    await prisma.module.update({
      where: { id: module1.id },
      data: { status: 'CHAPTER_GENERATED' }
    });

    console.log(`   ✅ Chapter generated (${wordCount} words)`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE!\n');
    console.log('📋 Summary:');
    console.log(`   • Project: "${project.title}"`);
    console.log(`   • Interviewee: ${project.interviewee!.name}`);
    console.log(`   • Module 1: "${module1.title}"`);
    console.log(`   • Questions: ${questions.length} with responses`);
    console.log(`   • Chapter: Generated (${wordCount} words)`);
    console.log(`   • Status: Ready for image generation testing`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Login as demo@mabel.com');
    console.log('   3. Open "Test Project"');
    console.log('   4. Click "View chapter" on Module 1');
    console.log('   5. Test image generation and PDF export');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndCreateTestProject()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
