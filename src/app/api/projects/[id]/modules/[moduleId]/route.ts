import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/projects/:id/modules/:moduleId
 * Get single module with all questions and chapter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Get module with all details
    const module = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        projectId: params.id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        chapters: {
          orderBy: {
            version: "desc",
          },
          take: 1, // Get latest version
        },
      },
    })

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        module: {
          id: module.id,
          moduleNumber: module.moduleNumber,
          title: module.title,
          status: module.status,
          theme: module.theme,
          createdAt: module.createdAt,
          updatedAt: module.updatedAt,
          approvedAt: module.approvedAt,
        },
        questions: module.questions,
        chapter: module.chapters[0] || null,
      },
    })

  } catch (error) {
    console.error("Error fetching module:", error)
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/:id/modules/:moduleId
 * Delete a module (soft delete - mark as deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check if module exists
    const module = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        projectId: params.id,
      },
    })

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      )
    }

    // Don't allow deleting if it's the only module
    const moduleCount = await prisma.module.count({
      where: { projectId: params.id },
    })

    if (moduleCount === 1) {
      return NextResponse.json(
        { error: "Cannot delete the only module in a project" },
        { status: 400 }
      )
    }

    // Delete module (cascade will handle questions and chapters)
    await prisma.module.delete({
      where: { id: params.moduleId },
    })

    // Renumber remaining modules
    const remainingModules = await prisma.module.findMany({
      where: { projectId: params.id },
      orderBy: { moduleNumber: "asc" },
    })

    for (let i = 0; i < remainingModules.length; i++) {
      await prisma.module.update({
        where: { id: remainingModules[i].id },
        data: { moduleNumber: i + 1 },
      })
    }

    // Update project current module if needed
    if (module.status === "APPROVED") {
      await prisma.project.update({
        where: { id: params.id },
        data: {
          totalModulesCompleted: Math.max(0, project.totalModulesCompleted - 1),
        },
      })
    }

    return NextResponse.json({
      message: "Module deleted successfully",
    })

  } catch (error) {
    console.error("Error deleting module:", error)
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    )
  }
}
