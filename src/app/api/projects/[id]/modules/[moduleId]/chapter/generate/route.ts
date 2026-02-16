import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { openAIService } from "@/lib/services/openai"
import { inngest } from "@/lib/inngest/client"
import { z } from "zod"

const generateSchema = z.object({
  narrativePerson: z.enum(["first-person", "third-person"]).default("first-person"),
  narrativeTone: z.enum(["warm", "formal", "conversational"]).default("warm"),
  narrativeStyle: z.enum(["descriptive", "concise", "poetic"]).default("descriptive"),
})

/**
 * POST /api/projects/:id/modules/:moduleId/chapter/generate
 * Generate narrative chapter from responses
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; moduleId: string }> | { id: string; moduleId: string } }
) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const params = await Promise.resolve(context.params);

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
        interviewee: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Get module with questions
    const storyModule = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        projectId: params.id,
      },
      include: {
        questions: {
          where: {
            response: {
              not: null,
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        chapters: {
          orderBy: {
            version: "desc",
          },
          take: 1,
        },
      },
    })

    if (!storyModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      )
    }

    // Edge case: Check if chapter is already being generated
    if (storyModule.status === "GENERATING_CHAPTER") {
      return NextResponse.json(
        {
          error: "A chapter is already being generated for this module. Please wait for it to complete.",
        },
        { status: 409 } // Conflict
      )
    }

    // Check if enough questions are answered (minimum 50%)
    const totalQuestions = await prisma.moduleQuestion.count({
      where: { moduleId: params.moduleId },
    })

    const answeredQuestions = storyModule.questions.length

    // Edge case: No questions exist for this module
    if (totalQuestions === 0) {
      return NextResponse.json(
        {
          error: "No questions found for this module. Please generate questions first.",
        },
        { status: 400 }
      )
    }

    if (answeredQuestions < Math.ceil(totalQuestions * 0.5)) {
      return NextResponse.json(
        {
          error: `Please answer at least ${Math.ceil(totalQuestions * 0.5)} questions before generating a chapter (${answeredQuestions}/${totalQuestions} answered)`,
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = generateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { narrativePerson, narrativeTone, narrativeStyle } = validation.data

    // Determine version number
    const version = storyModule.chapters.length > 0 ? storyModule.chapters[0].version + 1 : 1

    // Create placeholder chapter
    const chapter = await prisma.moduleChapter.create({
      data: {
        moduleId: params.moduleId,
        content: "", // Will be filled by job
        version,
        narrativePerson,
        narrativeTone,
        narrativeStyle,
      },
    })

    // Update module status
    await prisma.module.update({
      where: { id: params.moduleId },
      data: { status: "GENERATING_CHAPTER" },
    })

    // Create job
    const job = await prisma.job.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        type: "GENERATE_MODULE_CHAPTER",
        status: "PENDING",
        input: {
          moduleId: params.moduleId,
          chapterId: chapter.id,
          narrativePerson,
          narrativeTone,
          narrativeStyle,
        },
      },
    })

    // Try to use Inngest for background job processing
    // If Inngest is not configured, fall back to direct OpenAI call
    try {
      await inngest.send({
        name: "module/chapter.generate",
        data: {
          moduleId: params.moduleId,
          chapterId: chapter.id,
          projectId: params.id,
          questions: storyModule.questions.map(q => ({
            question: q.question,
            response: q.response!,
            category: q.category,
          })),
          settings: {
            narrativePerson,
            narrativeTone,
            narrativeStyle,
          },
          intervieweeName: project.interviewee?.name || "Unknown",
        },
      })

      // Update job status
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "RUNNING" },
      })
    } catch (inngestError) {
      console.warn("Inngest not configured, falling back to direct OpenAI call:", inngestError)

      // Generate chapter directly (for MVP/testing without Inngest)
      try {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "RUNNING" },
        })

        // Prepare questions for chapter generation
        const questionsForChapter = storyModule.questions.map(q => ({
          question: q.question,
          response: q.response!,
          category: q.category,
        }))

        // Map narrative settings to OpenAI format
        const person = narrativePerson === "first-person" ? "first" : "third"

        // Generate chapter using OpenAI
        const content = await openAIService.generateChapter(
          questionsForChapter,
          {
            person: person as "first" | "third",
            tone: narrativeTone,
            style: narrativeStyle,
          }
        )

        // Calculate word count
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length

        // Update chapter with generated content
        await prisma.moduleChapter.update({
          where: { id: chapter.id },
          data: {
            content,
            wordCount,
          },
        })

        // Update module status
        await prisma.module.update({
          where: { id: params.moduleId },
          data: { status: "CHAPTER_GENERATED" },
        })

        // Update job status
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            progress: 100,
            completedAt: new Date(),
            output: {
              chapterId: chapter.id,
              wordCount,
            },
          },
        })

        console.log(`[API] Generated chapter directly for module ${params.moduleId} (${wordCount} words)`)
      } catch (openaiError) {
        console.error("Failed to generate chapter:", openaiError)

        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: openaiError instanceof Error ? openaiError.message : "Unknown error",
          },
        })

        // Update module status back to previous state
        await prisma.module.update({
          where: { id: params.moduleId },
          data: { status: "QUESTIONS_GENERATED" },
        })

        throw openaiError
      }
    }

    return NextResponse.json({
      data: {
        chapter: {
          id: chapter.id,
          version,
        },
        jobId: job.id,
      },
      message: "Chapter generation started",
    })

  } catch (error) {
    console.error("Error generating chapter:", error)

    // Provide specific error messages based on error type
    let errorMessage = "Failed to generate chapter"
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
        errorMessage = "Request timed out. The chapter may be too long. Please try again."
        statusCode = 504
      } else {
        // Include the actual error message for unexpected errors
        errorMessage = `Failed to generate chapter: ${error.message}`
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
