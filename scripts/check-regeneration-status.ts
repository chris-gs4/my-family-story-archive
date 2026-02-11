// Script to check regeneration status
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatus() {
  try {
    // Find the Maria Santos project
    const project = await prisma.project.findFirst({
      where: {
        interviewee: {
          name: {
            contains: 'Maria Santos',
          },
        },
      },
      include: {
        modules: {
          where: {
            moduleNumber: 1,
          },
          include: {
            chapters: {
              orderBy: {
                version: 'desc',
              },
              take: 3, // Get last 3 versions
            },
          },
        },
      },
    });

    if (!project) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`\n📊 Project: ${project.title}`);
    console.log(`   ID: ${project.id}\n`);

    const module = project.modules[0];
    if (!module) {
      console.log('❌ Module 1 not found');
      return;
    }

    console.log(`📝 Module 1 Status: ${module.status}`);
    console.log(`\n📖 Recent Chapter Versions:\n`);

    module.chapters.forEach((chapter, index) => {
      console.log(`Version ${chapter.version}:`);
      console.log(`  - ID: ${chapter.id}`);
      console.log(`  - Word Count: ${chapter.wordCount || 'null'}`);
      console.log(`  - Content Length: ${chapter.content?.length || 0} chars`);
      console.log(`  - Has Content: ${chapter.content ? 'Yes' : 'No'}`);
      console.log(`  - Created: ${chapter.createdAt.toLocaleString()}`);
      console.log('');
    });

    // Check recent jobs
    const jobs = await prisma.job.findMany({
      where: {
        projectId: project.id,
        type: 'GENERATE_MODULE_CHAPTER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    console.log(`\n🔧 Recent Generation Jobs:\n`);
    jobs.forEach((job) => {
      console.log(`Job ${job.id.slice(0, 8)}...:`);
      console.log(`  - Status: ${job.status}`);
      console.log(`  - Progress: ${job.progress}%`);
      console.log(`  - Created: ${job.createdAt.toLocaleString()}`);
      if (job.error) {
        console.log(`  - Error: ${job.error}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
