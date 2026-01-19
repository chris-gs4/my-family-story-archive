// API Route: Save Question Responses
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      include: { questions: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { responses } = body;

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json(
        { error: 'Invalid responses format' },
        { status: 400 }
      );
    }

    // Update each question with its response
    const updatePromises = Object.entries(responses).map(
      ([questionId, response]) => {
        if (typeof response !== 'string') return null;

        return prisma.interviewQuestion.updateMany({
          where: {
            id: questionId,
            projectId: params.id, // Ensure question belongs to this project
          },
          data: {
            response: response.trim(),
          },
        });
      }
    );

    await Promise.all(updatePromises.filter(Boolean));

    // Check if all questions have responses
    const updatedQuestions = await prisma.interviewQuestion.findMany({
      where: { projectId: params.id },
    });

    const allQuestionsAnswered = updatedQuestions.every(
      (q) => q.response && q.response.trim().length > 0
    );

    // Update project status if all questions are answered
    if (allQuestionsAnswered && project.status === 'QUESTIONS_GENERATED') {
      await prisma.project.update({
        where: { id: params.id },
        data: { status: 'TRANSCRIPTION_COMPLETE' }, // Skip audio upload for text-based flow
      });
    }

    console.log(
      `[API] Saved ${Object.keys(responses).length} responses for project: ${params.id}`
    );

    return NextResponse.json({
      message: 'Responses saved successfully',
      questionsAnswered: Object.keys(responses).length,
      allComplete: allQuestionsAnswered,
    });
  } catch (error) {
    console.error('[API] Error saving responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
