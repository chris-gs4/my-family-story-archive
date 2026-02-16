import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/projects/:id/modules/:moduleId/approve
 * Approve module (marks as complete, triggers next module creation)
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Get module with chapter
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

    // Check if module already approved
    if (storyModule.status === "APPROVED") {
      return NextResponse.json(
        { error: "Module already approved" },
        { status: 400 }
      )
    }

    // Check if chapter exists
    if (storyModule.chapters.length === 0) {
      return NextResponse.json(
        { error: "Generate a chapter before approving the module" },
        { status: 400 }
      )
    }

    // Approve module
    const approvedModule = await prisma.module.update({
      where: { id: params.moduleId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    })

    // Update project
    await prisma.project.update({
      where: { id: params.id },
      data: {
        totalModulesCompleted: { increment: 1 },
        currentModuleNumber: { increment: 1 },
      },
    })

    // Check if we should suggest book compilation (3+ modules)
    const completedModulesCount = await prisma.module.count({
      where: {
        projectId: params.id,
        status: "APPROVED",
      },
    })

    const suggestBookCompilation = completedModulesCount >= 3

    // Create next module placeholder (optional - can be done on-demand)
    let nextModule = null
    if (completedModulesCount < 8) {
      // Don't auto-create if already have 8 modules
      const nextModuleNumber = storyModule.moduleNumber + 1

      // Check if next module already exists
      const existingNextModule = await prisma.module.findFirst({
        where: {
          projectId: params.id,
          moduleNumber: nextModuleNumber,
        },
      })

      if (!existingNextModule) {
        // Only create if it doesn't exist
        nextModule = await prisma.module.create({
          data: {
            projectId: params.id,
            moduleNumber: nextModuleNumber,
            title: `Module ${nextModuleNumber}`,
            status: "DRAFT",
          },
        })
      } else {
        // Use existing module
        nextModule = existingNextModule
      }
    }

    return NextResponse.json({
      data: {
        approvedModule: {
          id: approvedModule.id,
          moduleNumber: approvedModule.moduleNumber,
          status: approvedModule.status,
          approvedAt: approvedModule.approvedAt,
        },
        nextModule: nextModule ? {
          id: nextModule.id,
          moduleNumber: nextModule.moduleNumber,
          status: nextModule.status,
        } : null,
        completedModulesCount,
        suggestBookCompilation,
      },
      message: suggestBookCompilation
        ? "Module approved! You have enough content to compile your book."
        : "Module approved successfully!",
    })

  } catch (error) {
    console.error("Error approving module:", error)
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')

    const errorMessage = error instanceof Error ? error.message : 'Failed to approve module'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
