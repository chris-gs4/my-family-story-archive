// API Route: Generate Interview Questions
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest/client';

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

    // Trigger Inngest function
    await inngest.send({
      name: 'interview/questions.generate',
      data: {
        projectId: params.id,
      },
    });

    console.log(`[API] Question generation job triggered for project: ${params.id}`);

    return NextResponse.json({
      jobId: job.id,
      message: 'Question generation started',
    });
  } catch (error) {
    console.error('[API] Error generating questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
