import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean up test data created during E2E tests
 * WARNING: Only run in test environment!
 */
export async function cleanupTestData(userId?: string) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot cleanup data in production!');
  }

  try {
    if (userId) {
      // Delete specific user's test projects
      await prisma.project.deleteMany({
        where: {
          userId,
          title: {
            contains: 'E2E Test',
          },
        },
      });
    } else {
      // Delete all E2E test projects
      await prisma.project.deleteMany({
        where: {
          title: {
            contains: 'E2E Test',
          },
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get test user ID by email
 */
export async function getTestUserId(email: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id || null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Create a test project for E2E testing
 */
export async function createTestProject(userId: string, title: string) {
  try {
    const project = await prisma.project.create({
      data: {
        title: `E2E Test - ${title}`,
        userId,
        status: 'DRAFT',
        currentModuleNumber: 1,
        totalModulesCompleted: 0,
        interviewee: {
          create: {
            name: 'Test Interviewee',
            relationship: 'parent',
            birthYear: 1960,
            generation: 'Baby Boomer',
            topics: ['childhood', 'career', 'family'],
          },
        },
      },
      include: {
        interviewee: true,
      },
    });

    return project;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Test data constants
 */
export const TEST_INTERVIEWEE = {
  name: 'Jane Doe',
  relationship: 'parent',  // Changed from 'mother' to match RELATIONSHIPS options
  birthYear: 1955,
  generation: 'Baby Boomer',
  topics: ['childhood', 'career', 'family'],
};

export const SAMPLE_QUESTION_RESPONSE = 'This is a test response for an interview question. It contains enough detail to be meaningful for chapter generation.';
