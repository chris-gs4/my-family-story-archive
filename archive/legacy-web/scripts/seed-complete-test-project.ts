import { PrismaClient } from '@prisma/client';
import { inngest } from '../src/lib/inngest/client';
import { generateMockResponses } from './utils/mockResponseGenerator';

const prisma = new PrismaClient();

/**
 * Create a fully-populated test project with 2 approved modules
 * This eliminates the need for manual testing
 */
async function seedCompleteTestProject() {
  try {
    console.log('🌱 Creating Fully-Populated Test Project');
    console.log('═'.repeat(60));
    console.log('This will create a complete test project with:');
    console.log('  • Project + Interviewee');
    console.log('  • Module 1: Questions → Responses → Chapter → Approved');
    console.log('  • Module 2: Questions → Responses → Chapter → Approved');
    console.log('  • Ready for PDF book export!\n');

    // Step 1: Get or create test user
    let user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!user) {
      console.log('❌ No user found. Please run seed or create a user first.');
      console.log('   Run: npx prisma db seed');
      return;
    }

    console.log(`👤 Using user: ${user.email || user.id}\n`);

    // Step 2: Create project
    console.log('📝 Step 1/10: Creating project...');
    const project = await prisma.project.create({
      data: {
        title: 'E2E Test Project',
        userId: user.id,
        status: 'DRAFT',
        currentModuleNumber: 1,
        totalModulesCompleted: 0,
        interviewee: {
          create: {
            name: 'Robert Johnson',
            relationship: 'father',
            birthYear: 1958,
            generation: 'Baby Boomer',
            topics: ['childhood', 'career', 'family', 'values'],
          }
        }
      },
      include: { interviewee: true }
    });

    console.log(`   ✅ Project created: ${project.id}`);
    console.log(`   👤 Interviewee: ${project.interviewee!.name}\n`);

    // Step 3: Create Module 1
    console.log('📚 Step 2/10: Creating Module 1...');
    const module1 = await prisma.module.create({
      data: {
        projectId: project.id,
        moduleNumber: 1,
        title: 'Module 1',
        status: 'DRAFT',
        theme: 'Early Life & Foundations'
      }
    });

    console.log(`   ✅ Module 1 created: ${module1.id}\n`);

    // Step 4: Generate Module 1 questions
    console.log('❓ Step 3/10: Generating Module 1 questions...');
    await generateModuleQuestions(project.id, module1.id, 1, project.interviewee!);
    console.log(`   ✅ Module 1 questions generated\n`);

    // Step 5: Auto-fill Module 1 responses
    console.log('✍️  Step 4/10: Auto-filling Module 1 responses...');
    await autoFillModuleResponses(module1.id, project.interviewee!, 1);
    console.log(`   ✅ Module 1 responses filled\n`);

    // Step 6: Generate Module 1 chapter
    console.log('📖 Step 5/10: Generating Module 1 chapter...');
    await generateModuleChapter(project.id, module1.id, 1);
    console.log(`   ✅ Module 1 chapter generated\n`);

    // Step 7: Approve Module 1
    console.log('✅ Step 6/10: Approving Module 1...');
    await approveModule(project.id, module1.id);
    console.log(`   ✅ Module 1 approved\n`);

    // Step 8: Create Module 2
    console.log('📚 Step 7/10: Creating Module 2...');
    const module2 = await prisma.module.create({
      data: {
        projectId: project.id,
        moduleNumber: 2,
        title: 'Module 2',
        status: 'DRAFT',
        theme: 'Career & Relationships'
      }
    });

    console.log(`   ✅ Module 2 created: ${module2.id}\n`);

    // Step 9: Generate Module 2 questions (context-aware)
    console.log('❓ Step 8/10: Generating Module 2 questions (context-aware)...');
    const module1WithQuestions = await prisma.module.findUnique({
      where: { id: module1.id },
      include: { questions: true }
    });
    await generateModuleQuestions(project.id, module2.id, 2, project.interviewee!, [module1WithQuestions!]);
    console.log(`   ✅ Module 2 questions generated with context from Module 1\n`);

    // Step 10: Auto-fill Module 2 responses
    console.log('✍️  Step 9/10: Auto-filling Module 2 responses...');
    await autoFillModuleResponses(module2.id, project.interviewee!, 2);
    console.log(`   ✅ Module 2 responses filled\n`);

    // Step 11: Generate Module 2 chapter
    console.log('📖 Step 10/10: Generating Module 2 chapter...');
    await generateModuleChapter(project.id, module2.id, 2);
    console.log(`   ✅ Module 2 chapter generated\n`);

    // Step 12: Approve Module 2
    console.log('✅ Approving Module 2...');
    await approveModule(project.id, module2.id);
    console.log(`   ✅ Module 2 approved\n`);

    // Summary
    console.log('═'.repeat(60));
    console.log('🎉 Complete Test Project Created Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Title: ${project.title}`);
    console.log(`   Interviewee: ${project.interviewee!.name}`);
    console.log(`   Modules: 2 approved modules`);
    console.log(`   Status: Ready for book export\n`);

    console.log('🔗 Quick Actions:\n');
    console.log('   View project modules dashboard:');
    console.log(`   http://localhost:3000/projects/${project.id}/modules\n`);

    console.log('   Download complete book PDF:');
    console.log(`   curl http://localhost:3000/api/projects/${project.id}/book/export > test-book.pdf\n`);

    console.log('   Or use this one-liner:');
    console.log(`   open http://localhost:3000/projects/${project.id}/modules\n`);

    console.log('═'.repeat(60));

    return project;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate questions for a module using Inngest
 */
async function generateModuleQuestions(
  projectId: string,
  moduleId: string,
  moduleNumber: number,
  interviewee: any,
  previousModules: any[] = []
) {
  // Trigger Inngest event (Inngest will create its own job record)
  await inngest.send({
    name: 'module/questions.generate',
    data: {
      moduleId,
      projectId,
      moduleNumber,
      previousModules,
      intervieweeContext: {
        name: interviewee.name,
        relationship: interviewee.relationship,
        birthYear: interviewee.birthYear || undefined,
        generation: interviewee.generation || undefined,
        topics: (interviewee.topics as string[]) || [],
      },
    },
  });

  // Wait for module status to change to QUESTIONS_GENERATED
  await waitForModuleStatus(moduleId, 'QUESTIONS_GENERATED', 'Question generation');
}

/**
 * Auto-fill module responses with mock data
 */
async function autoFillModuleResponses(
  moduleId: string,
  interviewee: any,
  moduleNumber: number
) {
  const questions = await prisma.moduleQuestion.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' }
  });

  const mockResponses = generateMockResponses(questions, interviewee, moduleNumber);

  await prisma.$transaction(
    mockResponses.map(({ questionId, response }) =>
      prisma.moduleQuestion.update({
        where: { id: questionId },
        data: {
          response,
          respondedAt: new Date()
        }
      })
    )
  );

  // Update module status to IN_PROGRESS
  await prisma.module.update({
    where: { id: moduleId },
    data: { status: 'IN_PROGRESS' }
  });

  console.log(`      Filled ${mockResponses.length} responses`);
}

/**
 * Generate chapter for a module using Inngest
 */
async function generateModuleChapter(
  projectId: string,
  moduleId: string,
  moduleNumber: number
) {
  // Get project with interviewee
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { interviewee: true }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Get module with questions
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      questions: {
        where: {
          response: {
            not: null,
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      chapters: {
        orderBy: {
          version: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  // Verify enough questions are answered
  const totalQuestions = await prisma.moduleQuestion.count({
    where: { moduleId }
  });

  const answeredCount = module.questions.length;
  const requiredCount = Math.ceil(totalQuestions * 0.5);

  if (answeredCount < requiredCount) {
    throw new Error(`Not enough questions answered (${answeredCount}/${requiredCount} required)`);
  }

  // Determine version number
  const version = module.chapters.length > 0 ? module.chapters[0].version + 1 : 1;

  // Create placeholder chapter
  const chapter = await prisma.moduleChapter.create({
    data: {
      moduleId,
      content: '', // Will be filled by Inngest job
      version,
      narrativePerson: 'first-person',
      narrativeTone: 'warm',
      narrativeStyle: 'descriptive',
    },
  });

  // Update module status to GENERATING_CHAPTER
  await prisma.module.update({
    where: { id: moduleId },
    data: { status: 'GENERATING_CHAPTER' }
  });

  // Trigger Inngest event with all required data
  await inngest.send({
    name: 'module/chapter.generate',
    data: {
      moduleId,
      chapterId: chapter.id,
      projectId,
      questions: module.questions.map(q => ({
        question: q.question,
        response: q.response!,
        category: q.category,
      })),
      settings: {
        narrativePerson: 'first-person',
        narrativeTone: 'warm',
        narrativeStyle: 'descriptive',
      },
      intervieweeName: project.interviewee?.name || 'Unknown',
    },
  });

  // Wait for module status to change to CHAPTER_GENERATED
  await waitForModuleStatus(moduleId, 'CHAPTER_GENERATED', 'Chapter generation');
}

/**
 * Approve a module
 */
async function approveModule(projectId: string, moduleId: string) {
  const module = await prisma.module.update({
    where: { id: moduleId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date()
    }
  });

  // Increment total modules completed
  await prisma.project.update({
    where: { id: projectId },
    data: {
      totalModulesCompleted: { increment: 1 }
    }
  });

  console.log(`      Module ${module.moduleNumber} approved at ${module.approvedAt}`);
}

/**
 * Wait for module to reach a specific status by polling
 * This is more reliable than polling job status
 */
async function waitForModuleStatus(
  moduleId: string,
  targetStatus: string,
  description: string
) {
  const maxAttempts = 90; // 90 attempts * 2 seconds = 3 minutes max
  const pollInterval = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { status: true }
    });

    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (module.status === targetStatus) {
      console.log(`\n      ✅ ${description} completed`);
      return;
    }

    // Check for error states
    if (module.status === ('FAILED' as string)) {
      throw new Error(`${description} failed - module status is FAILED`);
    }

    // Show progress
    process.stdout.write(`\r      ⏳ ${description} in progress... (${attempt}/${maxAttempts}) [status: ${module.status}]`);

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`${description} timed out after ${maxAttempts * pollInterval / 1000} seconds`);
}

// Run if called directly
if (require.main === module) {
  console.log('\n');
  seedCompleteTestProject()
    .then(() => {
      console.log('\n✨ All done! Your test project is ready.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed to create test project:', error);
      process.exit(1);
    });
}

export { seedCompleteTestProject };
