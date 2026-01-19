// API Route: Generate Interview Questions
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mockOpenAI } from '@/lib/services/mock/openai';
import type { ProjectStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { interviewee: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!project.interviewee) {
      return NextResponse.json(
        { error: 'Please add interviewee information first' },
        { status: 400 }
      );
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        type: 'GENERATE_QUESTIONS',
        status: 'RUNNING',
        progress: 0,
        input: {
          intervieweeName: project.interviewee.name,
          relationship: project.interviewee.relationship,
          topics: project.interviewee.topics,
        },
      },
    });

    // For MVP: Run job directly using mock OpenAI service
    // In production, this would be handled by Inngest background jobs
    try {
      // Delete existing questions first (for regeneration)
      await prisma.interviewQuestion.deleteMany({
        where: { projectId: params.id },
      });

      // Generate questions using mock OpenAI
      const questions = await mockOpenAI.generateQuestions(
        {
          name: project.interviewee.name,
          relationship: project.interviewee.relationship,
          birthYear: project.interviewee.birthYear || undefined,
          generation: project.interviewee.generation || undefined,
          topics: project.interviewee.topics as string[],
        },
        3
      );

      // Save questions to database
      await prisma.interviewQuestion.createMany({
        data: questions.map((q) => ({
          projectId: params.id,
          question: q.question,
          category: q.category,
          order: q.order,
          batch: 1, // Initial batch
          isFollowUp: false,
        })),
      });

      // Update project status
      await prisma.project.update({
        where: { id: params.id },
        data: { status: 'QUESTIONS_GENERATED' as ProjectStatus },
      });

      // Update job status
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          output: {
            questionsGenerated: questions.length,
          },
        },
      });

      console.log(`[API] Generated ${questions.length} questions for project: ${params.id}`);

      return NextResponse.json({
        jobId: job.id,
        message: 'Questions generated successfully',
        questionsGenerated: questions.length,
      });
    } catch (jobError) {
      // Update job with error
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: jobError instanceof Error ? jobError.message : 'Unknown error',
        },
      });

      throw jobError;
    }
  } catch (error) {
    console.error('[API] Error generating questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
