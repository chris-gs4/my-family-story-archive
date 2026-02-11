import { PrismaClient } from '@prisma/client';
import { generateMockResponses } from './utils/mockResponseGenerator';

const prisma = new PrismaClient();

interface QuestionWithModule {
  id: string;
  question: string;
  category: string;
  order: number;
  response: string | null;
  moduleId: string;
  module: {
    id: string;
    moduleNumber: number;
    title: string;
    status: string;
  };
}

/**
 * Auto-fill all unanswered questions in a project with realistic mock responses
 * @param projectId - The ID of the project to auto-fill
 */
async function autoFillTestProject(projectId?: string) {
  try {
    console.log('🤖 Auto-Fill Test Project Script\n');

    // Get or find project
    let project;
    if (projectId) {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          interviewee: true,
          modules: {
            orderBy: { moduleNumber: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }
    } else {
      // Find the most recent test project
      project = await prisma.project.findFirst({
        where: {
          OR: [
            { title: { contains: 'Test' } },
            { title: { contains: 'test' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          interviewee: true,
          modules: {
            orderBy: { moduleNumber: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!project) {
        throw new Error('No test project found. Please provide a project ID or create a test project first.');
      }

      console.log(`📝 Found most recent test project: ${project.title}`);
    }

    console.log(`📊 Project: ${project.title} (${project.id})`);
    console.log(`👤 Interviewee: ${project.interviewee?.name || 'Unknown'}\n`);

    if (!project.interviewee) {
      throw new Error('Project has no interviewee. Cannot generate responses.');
    }

    let totalFilled = 0;
    let modulesUpdated = 0;

    // Process each module
    for (const module of project.modules) {
      console.log(`📚 Module ${module.moduleNumber}: ${module.title}`);
      console.log(`   Status: ${module.status}`);

      // Get unanswered questions
      const unansweredQuestions = module.questions.filter(q => !q.response);

      if (unansweredQuestions.length === 0) {
        console.log(`   ✅ All ${module.questions.length} questions already answered\n`);
        continue;
      }

      console.log(`   🔍 Found ${unansweredQuestions.length} unanswered questions (out of ${module.questions.length} total)`);

      // Generate mock responses
      const mockResponses = generateMockResponses(
        unansweredQuestions,
        project.interviewee,
        module.moduleNumber
      );

      // Update all responses in a transaction
      await prisma.$transaction(async (tx) => {
        // Update each question response
        const updatePromises = mockResponses.map(({ questionId, response }) =>
          tx.moduleQuestion.update({
            where: { id: questionId },
            data: {
              response,
              respondedAt: new Date()
            }
          })
        );

        await Promise.all(updatePromises);

        // Update module status to IN_PROGRESS if it's still in QUESTIONS_GENERATED
        if (module.status === 'QUESTIONS_GENERATED') {
          await tx.module.update({
            where: { id: module.id },
            data: { status: 'IN_PROGRESS' }
          });
          console.log(`   📝 Updated module status: QUESTIONS_GENERATED → IN_PROGRESS`);
        }
      });

      console.log(`   ✅ Filled ${mockResponses.length} responses\n`);
      totalFilled += mockResponses.length;
      modulesUpdated++;
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('🎉 Auto-fill Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   Project: ${project.title}`);
    console.log(`   Modules processed: ${modulesUpdated}/${project.modules.length}`);
    console.log(`   Questions filled: ${totalFilled}`);
    console.log(`\n💡 Next steps:`);

    // Check if any modules are ready for chapter generation
    const readyForChapter = project.modules.filter(m => m.status === 'IN_PROGRESS');
    if (readyForChapter.length > 0) {
      console.log(`   1. Generate chapters for modules: ${readyForChapter.map(m => m.moduleNumber).join(', ')}`);
      console.log(`      (Use the UI or call the chapter generation API)`);
    }

    const hasApprovedModules = project.modules.some(m => m.status === 'APPROVED');
    if (hasApprovedModules) {
      console.log(`   2. Export book PDF:`);
      console.log(`      curl http://localhost:3000/api/projects/${project.id}/book/export > test-book.pdf`);
    }

    console.log('═'.repeat(60));

    return project;

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const projectId = process.argv[2];

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Auto-Fill Test Project Script
==============================

Automatically fills all unanswered questions in a project with realistic mock responses.

Usage:
  npx tsx scripts/auto-fill-test-project.ts [PROJECT_ID]

Arguments:
  PROJECT_ID    Optional. The ID of the project to auto-fill.
                If not provided, finds the most recent test project.

Examples:
  # Auto-fill most recent test project
  npx tsx scripts/auto-fill-test-project.ts

  # Auto-fill specific project
  npx tsx scripts/auto-fill-test-project.ts cm12abc456xyz

Options:
  --help, -h    Show this help message
    `);
    process.exit(0);
  }

  autoFillTestProject(projectId)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { autoFillTestProject };
