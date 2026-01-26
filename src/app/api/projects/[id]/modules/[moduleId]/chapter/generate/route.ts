import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
    const module = await prisma.module.findFirst({
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

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      )
    }

    // Check if enough questions are answered (minimum 50%)
    const totalQuestions = await prisma.moduleQuestion.count({
      where: { moduleId: params.moduleId },
    })

    const answeredQuestions = module.questions.length

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
    const version = module.chapters.length > 0 ? module.chapters[0].version + 1 : 1

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

    // Trigger Inngest job
    await inngest.send({
      name: "module/chapter.generate",
      data: {
        moduleId: params.moduleId,
        chapterId: chapter.id,
        projectId: params.id,
        questions: module.questions.map(q => ({
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
    return NextResponse.json(
      { error: "Failed to generate chapter" },
      { status: 500 }
    )
  }
}
