import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const updateNarrativeSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
})

/**
 * PATCH /api/projects/:id/narrative
 *
 * Updates the narrative content for a project
 */
export async function PATCH(
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
        narrative: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (!project.narrative) {
      return NextResponse.json(
        { error: "No narrative found for this project" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateNarrativeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content } = validation.data

    // Calculate new word count
    const wordCount = content.trim().split(/\s+/).length

    // Update narrative
    const updatedNarrative = await prisma.narrative.update({
      where: {
        id: project.narrative.id,
      },
      data: {
        content,
        wordCount,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      data: updatedNarrative,
      message: "Narrative updated successfully",
    })

  } catch (error) {
    console.error("Error updating narrative:", error)
    return NextResponse.json(
      { error: "Failed to update narrative" },
      { status: 500 }
    )
  }
}
