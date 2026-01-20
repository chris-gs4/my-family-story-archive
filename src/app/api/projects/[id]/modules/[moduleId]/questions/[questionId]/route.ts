import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const answerSchema = z.object({
  response: z.string().min(1, "Response cannot be empty").max(10000, "Response too long"),
})

/**
 * PATCH /api/projects/:id/modules/:moduleId/questions/:questionId
 * Submit answer to a question
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string; questionId: string } }
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

    const body = await request.json()
    const validation = answerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { response } = validation.data

    // Update question response
    const question = await prisma.moduleQuestion.update({
      where: {
        id: params.questionId,
      },
      data: {
        response,
        respondedAt: new Date(),
      },
    })

    // Update module status to IN_PROGRESS if it was in QUESTIONS_GENERATED
    const module = await prisma.module.findUnique({
      where: { id: params.moduleId },
    })

    if (module && module.status === "QUESTIONS_GENERATED") {
      await prisma.module.update({
        where: { id: params.moduleId },
        data: { status: "IN_PROGRESS" },
      })
    }

    return NextResponse.json({
      data: question,
      message: "Response saved successfully",
    })

  } catch (error) {
    console.error("Error saving response:", error)
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/:id/modules/:moduleId/questions/:questionId
 * Get single question with response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string; questionId: string } }
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

    const question = await prisma.moduleQuestion.findUnique({
      where: {
        id: params.questionId,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: question,
    })

  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    )
  }
}
