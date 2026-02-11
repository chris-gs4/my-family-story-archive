// Script to unapprove a module for testing
// Usage: npx tsx scripts/unapprove-module.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unapproveModule() {
  try {
    console.log('Finding Project "1/30/2026" (Maria Santos)...');

    // Find the project
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
        },
      },
    });

    if (!project) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`✅ Found project: ${project.title} (${project.id})`);

    const module = project.modules[0];
    if (!module) {
      console.log('❌ Module 1 not found');
      return;
    }

    console.log(`✅ Found Module 1: ${module.title} (${module.id})`);
    console.log(`   Current status: ${module.status}`);

    if (module.status !== 'APPROVED') {
      console.log('⚠️  Module is not approved, nothing to do');
      return;
    }

    // Unapprove the module
    console.log('\n🔄 Unapproving module...');
    const updatedModule = await prisma.module.update({
      where: { id: module.id },
      data: {
        status: 'CHAPTER_GENERATED',
        approvedAt: null,
      },
    });

    // Decrement project completion count
    await prisma.project.update({
      where: { id: project.id },
      data: {
        totalModulesCompleted: {
          decrement: 1,
        },
      },
    });

    console.log(`✅ Module unapproved successfully!`);
    console.log(`   New status: ${updatedModule.status}`);
    console.log(`   ApprovedAt: ${updatedModule.approvedAt}`);
    console.log('\n🎉 You can now test the regenerate feature!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unapproveModule();
