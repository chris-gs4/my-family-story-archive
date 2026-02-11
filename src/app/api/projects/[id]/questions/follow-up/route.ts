// API Route: Generate Follow-up Interview Questions
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openAIService } from '@/lib/services/openai';
import type { QuestionWithResponse } from '@/lib/services/openai';

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
      include: {
        interviewee: true,
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!project.interviewee) {
      return NextResponse.json(
        { error: 'Interviewee information required' },
        { status: 400 }
      );
    }

    // Check if there are questions with responses
    const questionsWithResponses = project.questions.filter(
      (q) => q.response && q.response.trim().length > 0
    );

    if (questionsWithResponses.length === 0) {
      return NextResponse.json(
        { error: 'Please answer at least one question before generating follow-ups' },
        { status: 400 }
      );
    }

    // Determine current batch (highest batch number + 1)
    const currentMaxBatch = Math.max(...project.questions.map((q) => q.batch));

    // Prepare previous questions for analysis
    const previousQuestions: QuestionWithResponse[] = questionsWithResponses.map((q) => ({
      question: q.question,
      response: q.response!,
      category: q.category,
    }));

    // Generate follow-up questions using OpenAI
    const followUpQuestions = await openAIService.generateFollowUpQuestions(
      {
        name: project.interviewee.name,
        relationship: project.interviewee.relationship,
        birthYear: project.interviewee.birthYear || undefined,
        generation: project.interviewee.generation || undefined,
        topics: project.interviewee.topics as string[],
      },
      previousQuestions,
      currentMaxBatch
    );

    // Save follow-up questions to database
    await prisma.interviewQuestion.createMany({
      data: followUpQuestions.map((q) => ({
        projectId: params.id,
        question: q.question,
        category: q.category,
        order: q.order,
        batch: q.batch || currentMaxBatch + 1,
        isFollowUp: true,
      })),
    });

    console.log(
      `[API] Generated ${followUpQuestions.length} follow-up questions (batch ${currentMaxBatch + 1}) for project: ${params.id}`
    );

    return NextResponse.json({
      message: 'Follow-up questions generated successfully',
      questionsGenerated: followUpQuestions.length,
      batch: currentMaxBatch + 1,
      questions: followUpQuestions,
    });
  } catch (error) {
    console.error('[API] Error generating follow-up questions:', error);

    // Provide specific error messages based on error type
    let errorMessage = "Failed to generate follow-up questions"
    let statusCode = 500

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()

      if (errorMsg.includes('quota') || errorMsg.includes('insufficient')) {
        errorMessage = "OpenAI quota exceeded. Please check your billing details or try again later."
        statusCode = 429
      } else if (errorMsg.includes('rate limit')) {
        errorMessage = "Too many requests to OpenAI. Please wait a moment and try again."
        statusCode = 429
      } else if (errorMsg.includes('api key') || errorMsg.includes('unauthorized')) {
        errorMessage = "OpenAI API key is invalid or missing. Please check your configuration."
        statusCode = 401
      } else if (errorMsg.includes('model') && errorMsg.includes('not')) {
        errorMessage = "The AI model is not available. Please check your OpenAI account permissions."
        statusCode = 400
      } else if (errorMsg.includes('timeout')) {
        errorMessage = "Request timed out. Please try again."
        statusCode = 504
      } else {
        // Include the actual error message for unexpected errors
        errorMessage = `Failed to generate follow-up questions: ${error.message}`
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
