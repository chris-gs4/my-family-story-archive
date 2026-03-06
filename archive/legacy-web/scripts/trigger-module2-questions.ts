// Manually trigger question generation for Module 2
import { PrismaClient } from '@prisma/client';
import { Inngest } from 'inngest';

const prisma = new PrismaClient();

const inngest = new Inngest({
  id: 'mabel',
  eventKey: process.env.INNGEST_EVENT_KEY!,
});

async function triggerModule2Questions() {
  try {
    // Find António's project
    const project = await prisma.project.findFirst({
      where: {
        interviewee: {
          name: { contains: 'António' },
        },
      },
      include: {
        interviewee: true,
        modules: {
          where: {
            status: 'APPROVED',
          },
          include: {
            questions: true,
          },
        },
      },
    });

    if (!project) {
      console.log('❌ Project not found');
      return;
    }

    // Find Module 2
    const module2 = await prisma.module.findFirst({
      where: {
        projectId: project.id,
        moduleNumber: 2,
      },
    });

    if (!module2) {
      console.log('❌ Module 2 not found');
      return;
    }

    console.log(`✅ Found Module 2: ${module2.id}`);
    console.log(`   Status: ${module2.status}`);

    // Create job record
    const job = await prisma.job.create({
      data: {
        projectId: project.id,
        userId: project.userId,
        type: 'GENERATE_MODULE_QUESTIONS',
        status: 'PENDING',
        input: {
          moduleId: module2.id,
          moduleNumber: 2,
        },
      },
    });

    console.log(`✅ Created job: ${job.id}`);

    // Get previous questions from Module 1
    const previousQuestions = project.modules.flatMap(m =>
      m.questions
        .filter(q => q.response)
        .map(q => ({
          question: q.question,
          response: q.response!,
          category: q.category,
        }))
    );

    console.log(`📋 Found ${previousQuestions.length} previous questions from Module 1`);

    // Send to Inngest
    await inngest.send({
      name: 'module/questions.generate',
      data: {
        moduleId: module2.id,
        projectId: project.id,
        moduleNumber: 2,
        previousModules: project.modules,
        intervieweeContext: {
          name: project.interviewee!.name,
          relationship: project.interviewee!.relationship,
          birthYear: project.interviewee!.birthYear || undefined,
          generation: project.interviewee!.generation || undefined,
          topics: (project.interviewee!.topics as string[]) || [],
        },
      },
    });

    console.log('✅ Sent event to Inngest: module/questions.generate');
    console.log('\n🎉 Question generation started! Check the browser - it should refresh automatically.');

    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'RUNNING' },
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

triggerModule2Questions();
