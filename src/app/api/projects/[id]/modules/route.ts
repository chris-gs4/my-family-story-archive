import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mockOpenAI } from "@/lib/services/mock/openai"
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

    // Trigger Inngest job to generate questions
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

    return NextResponse.json({
      data: {
        module,
        jobId: job.id,
        message: "Module created. Generating questions...",
      },
    })

  } catch (error) {
    console.error("Error creating module:", error)
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
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
