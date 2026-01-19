import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mockOpenAI } from "@/lib/services/mock/openai"
import { z } from "zod"
import type { NarrativeStatus } from "@prisma/client"

// Validation schema
const generateNarrativeSchema = z.object({
  style: z.enum(['first-person', 'third-person']).default('first-person'),
})

/**
 * POST /api/projects/:id/narrative/generate
 *
 * Triggers narrative generation from transcription
 *
 * Body:
 * - style: 'first-person' | 'third-person' (default: 'first-person')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        sessions: {
          include: {
            transcription: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        narrative: true,
        interviewee: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check for content source: either transcription OR text responses
    const latestSession = project.sessions[0]
    const hasTranscription = latestSession?.transcription?.text
    const hasTextResponses = project.questions.some(
      (q) => q.response && q.response.trim().length > 0
    )

    if (!hasTranscription && !hasTextResponses) {
      return NextResponse.json(
        { error: "No content found. Please either answer the interview questions or upload audio." },
        { status: 400 }
      )
    }

    // Prepare transcript text from either source
    let transcriptText = ''
    if (hasTextResponses) {
      // Combine question responses into a transcript format
      transcriptText = project.questions
        .filter((q) => q.response && q.response.trim().length > 0)
        .map((q) => `Q: ${q.question}\n\nA: ${q.response}`)
        .join('\n\n---\n\n')
    } else if (hasTranscription && latestSession.transcription) {
      transcriptText = latestSession.transcription.text
    }

    // Parse request body
    const body = await request.json()
    const validation = generateNarrativeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { style } = validation.data

    // Check if narrative generation is already in progress
    const existingJob = await prisma.job.findFirst({
      where: {
        projectId: params.id,
        type: 'GENERATE_NARRATIVE',
        status: {
          in: ['PENDING', 'RUNNING'],
        },
      },
    })

    if (existingJob) {
      return NextResponse.json(
        { error: "Narrative generation already in progress" },
        { status: 409 }
      )
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        type: "GENERATE_NARRATIVE",
        status: "RUNNING",
        progress: 0,
        input: {
          style,
          source: hasTextResponses ? 'text_responses' : 'transcription',
        },
      },
    })

    // Update project status
    await prisma.project.update({
      where: { id: params.id },
      data: { status: "GENERATING_NARRATIVE" },
    })

    // For MVP: Run job directly using mock OpenAI service
    // In production, this would be handled by Inngest background jobs
    try {
      // Generate narrative using mock OpenAI
      const narrativeResult = await mockOpenAI.generateNarrative(
        transcriptText,
        style
      )

      const narrativeContent = narrativeResult.content
      const wordCount = narrativeResult.wordCount

      // Create or update narrative
      await prisma.narrative.upsert({
        where: { projectId: params.id },
        create: {
          projectId: params.id,
          content: narrativeContent,
          structure: { chapters: [] },
          status: 'FINAL' as NarrativeStatus,
          wordCount,
        },
        update: {
          content: narrativeContent,
          status: 'FINAL' as NarrativeStatus,
          wordCount,
          version: { increment: 1 },
        },
      })

      // Update project status
      await prisma.project.update({
        where: { id: params.id },
        data: { status: 'NARRATIVE_COMPLETE' },
      })

      // Update job status
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          output: {
            wordCount,
            style,
          },
        },
      })

      console.log(`[API] Generated narrative (${wordCount} words) for project: ${params.id}`)

      return NextResponse.json({
        data: {
          jobId: job.id,
          status: "COMPLETED",
          message: "Narrative generated successfully.",
          wordCount,
        },
      })
    } catch (jobError) {
      // Update job with error
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: jobError instanceof Error ? jobError.message : 'Unknown error',
        },
      })

      // Update project status to error
      await prisma.project.update({
        where: { id: params.id },
        data: { status: 'ERROR' },
      })

      throw jobError;
    }

  } catch (error) {
    console.error("Error generating narrative:", error)
    return NextResponse.json(
      { error: "Failed to generate narrative" },
      { status: 500 }
    )
  }
}
