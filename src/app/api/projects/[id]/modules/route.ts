import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { openAIService } from "@/lib/services/openai"
import { inngest } from "@/lib/inngest/client"
import { z } from "zod"

// Validation schema
const createModuleSchema = z.object({
  theme: z.string().optional(),
})

/**
 * POST /api/projects/:id/modules
 * Create a new module and generate questions
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
        interviewee: true,
        modules: {
          where: { status: "APPROVED" },
          include: {
            questions: true,
            chapters: true,
          },
          orderBy: { moduleNumber: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (!project.interviewee) {
      return NextResponse.json(
        { error: "Please complete interviewee setup first" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = createModuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { theme } = validation.data

    // Determine next module number
    const nextModuleNumber = project.currentModuleNumber

    // Create module
    const module = await prisma.module.create({
      data: {
        projectId: params.id,
        moduleNumber: nextModuleNumber,
        title: theme || `Module ${nextModuleNumber}`,
        status: "DRAFT",
        theme,
      },
    })

    // Create job to generate questions
    const job = await prisma.job.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        type: "GENERATE_MODULE_QUESTIONS",
        status: "PENDING",
        input: {
          moduleId: module.id,
          moduleNumber: nextModuleNumber,
          theme,
        },
      },
    })

    // Try to use Inngest for background job processing
    // If Inngest is not configured, fall back to direct OpenAI call for MVP testing
    let useDirectCall = false

    try {
      await inngest.send({
        name: "module/questions.generate",
        data: {
          moduleId: module.id,
          projectId: params.id,
          moduleNumber: nextModuleNumber,
          theme,
          previousModules: project.modules,
          intervieweeContext: {
            name: project.interviewee.name,
            relationship: project.interviewee.relationship,
            birthYear: project.interviewee.birthYear || undefined,
            generation: project.interviewee.generation || undefined,
            topics: (project.interviewee.topics as string[]) || [],
          },
        },
      })

      // Update job status
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "RUNNING" },
      })
    } catch (inngestError) {
      console.warn("Inngest not configured, falling back to direct OpenAI call:", inngestError)
      useDirectCall = true

      // Generate questions directly (for MVP/testing without Inngest)
      try {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "RUNNING" },
        })

        const intervieweeContext = {
          name: project.interviewee.name,
          relationship: project.interviewee.relationship,
          birthYear: project.interviewee.birthYear || undefined,
          generation: project.interviewee.generation || undefined,
          topics: (project.interviewee.topics as string[]) || [],
        }

        let questions
        if (nextModuleNumber === 1) {
          // Module 1: Foundation questions
          questions = await openAIService.generateQuestions(intervieweeContext, 15)
        } else {
          // Module 2+: Follow-up questions based on previous responses
          const previousQuestions = project.modules.flatMap(m =>
            m.questions
              .filter(q => q.response)
              .map(q => ({
                question: q.question,
                response: q.response!,
                category: q.category,
              }))
          )
          questions = await openAIService.generateFollowUpQuestions(
            intervieweeContext,
            previousQuestions,
            nextModuleNumber
          )
        }

        // Save questions to database
        await prisma.moduleQuestion.createMany({
          data: questions.map((q, index) => ({
            moduleId: module.id,
            question: q.question,
            category: q.category,
            order: index + 1,
          })),
        })

        // Update module status
        await prisma.module.update({
          where: { id: module.id },
          data: { status: "QUESTIONS_GENERATED" },
        })

        // Update job status
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            progress: 100,
            completedAt: new Date(),
            output: { questionsGenerated: questions.length },
          },
        })

        console.log(`[API] Generated ${questions.length} questions directly for module ${module.id}`)
      } catch (openaiError) {
        console.error("Failed to generate questions:", openaiError)

        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: openaiError instanceof Error ? openaiError.message : "Unknown error",
          },
        })

        throw openaiError
      }
    }

    return NextResponse.json({
      data: {
        module,
        jobId: job.id,
        message: "Module created. Generating questions...",
      },
    })

  } catch (error) {
    console.error("Error creating module:", error)

    // Provide specific error messages based on error type
    let errorMessage = "Failed to create module"
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
        errorMessage = `Failed to create module: ${error.message}`
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

/**
 * GET /api/projects/:id/modules
 * Get all modules for a project
 */
export async function GET(
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
        modules: {
          include: {
            questions: {
              select: {
                id: true,
                response: true,
              },
            },
            chapters: {
              select: {
                id: true,
                version: true,
              },
              orderBy: {
                version: "desc",
              },
              take: 1,
            },
          },
          orderBy: {
            moduleNumber: "asc",
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Format module data
    const modules = project.modules.map((module) => {
      const totalQuestions = module.questions.length
      const completedQuestions = module.questions.filter(q => q.response).length
      const hasChapter = module.chapters.length > 0

      return {
        id: module.id,
        moduleNumber: module.moduleNumber,
        title: module.title,
        status: module.status,
        theme: module.theme,
        completedQuestions,
        totalQuestions,
        hasChapter,
        approvedAt: module.approvedAt,
        createdAt: module.createdAt,
      }
    })

    return NextResponse.json({
      data: {
        modules,
        currentModule: project.currentModuleNumber,
        totalCompleted: project.totalModulesCompleted,
      },
    })

  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}
