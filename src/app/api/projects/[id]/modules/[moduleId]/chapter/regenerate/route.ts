import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inngest } from "@/lib/inngest/client"
import { z } from "zod"

const regenerateSchema = z.object({
  narrativePerson: z.enum(["first-person", "third-person"]).optional(),
  narrativeTone: z.enum(["warm", "formal", "conversational"]).optional(),
  narrativeStyle: z.enum(["descriptive", "concise", "poetic"]).optional(),
  feedback: z.string().optional(), // User's specific feedback
})

/**
 * POST /api/projects/:id/modules/:moduleId/chapter/regenerate
 * Regenerate chapter with feedback or new settings
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; moduleId: string }> | { id: string; moduleId: string } }
) {
  try {
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

    // Get module with questions and existing chapter
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

    if (storyModule.chapters.length === 0) {
      return NextResponse.json(
        { error: "No existing chapter to regenerate. Generate a chapter first." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = regenerateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const previousChapter = storyModule.chapters[0]
    const newVersion = previousChapter.version + 1

    // Use provided settings or fall back to previous settings
    const narrativePerson = validation.data.narrativePerson || previousChapter.narrativePerson || "first-person"
    const narrativeTone = validation.data.narrativeTone || previousChapter.narrativeTone || "warm"
    const narrativeStyle = validation.data.narrativeStyle || previousChapter.narrativeStyle || "descriptive"
    const feedback = validation.data.feedback

    // Create new chapter version
    const chapter = await prisma.moduleChapter.create({
      data: {
        moduleId: params.moduleId,
        content: "", // Will be filled by job
        version: newVersion,
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
          feedback,
          previousChapterId: previousChapter.id,
          isRegeneration: true,
        },
      },
    })

    // Trigger Inngest job
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
          feedback,
          previousChapter: previousChapter.content,
          isRegeneration: true,
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
            version: newVersion,
          },
          jobId: job.id,
        },
        message: "Chapter regeneration started",
      })
    } catch (inngestError) {
      console.error("Inngest error:", inngestError)
      // If Inngest fails, clean up and return error
      await prisma.moduleChapter.delete({ where: { id: chapter.id } })
      await prisma.job.delete({ where: { id: job.id } })
      throw new Error(`Inngest send failed: ${inngestError instanceof Error ? inngestError.message : 'Unknown error'}`)
    }

  } catch (error) {
    console.error("Error regenerating chapter:", error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate chapter'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
