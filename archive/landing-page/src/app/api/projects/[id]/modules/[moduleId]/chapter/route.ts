import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
})

/**
 * GET /api/projects/:id/modules/:moduleId/chapter
 * Get latest chapter for module
 */
export async function GET(
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Get module with latest chapter
    const storyModule = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        projectId: params.id,
      },
      include: {
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

    const chapter = storyModule.chapters[0]

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        chapter,
        module: {
          id: storyModule.id,
          moduleNumber: storyModule.moduleNumber,
          title: storyModule.title,
          status: storyModule.status,
          theme: storyModule.theme,
          approvedAt: storyModule.approvedAt,
        },
      },
    })

  } catch (error) {
    console.error("Error fetching chapter:", error)
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/projects/:id/modules/:moduleId/chapter
 * Update chapter content (manual edit)
 */
export async function PATCH(
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content } = validation.data

    // Get latest chapter
    const existingChapter = await prisma.moduleChapter.findFirst({
      where: {
        moduleId: params.moduleId,
      },
      orderBy: {
        version: "desc",
      },
    })

    if (!existingChapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      )
    }

    // Update chapter
    const chapter = await prisma.moduleChapter.update({
      where: {
        id: existingChapter.id,
      },
      data: {
        content,
        wordCount: content.split(/\s+/).length,
      },
    })

    return NextResponse.json({
      data: chapter,
      message: "Chapter updated successfully",
    })

  } catch (error) {
    console.error("Error updating chapter:", error)
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    )
  }
}
