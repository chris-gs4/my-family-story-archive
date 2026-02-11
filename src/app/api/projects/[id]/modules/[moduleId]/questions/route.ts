import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/projects/:id/modules/:moduleId/questions
 * Get all questions for a module with response status
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

    // Get questions
    const questions = await prisma.moduleQuestion.findMany({
      where: {
        moduleId: params.moduleId,
      },
      orderBy: {
        order: "asc",
      },
    })

    const totalQuestions = questions.length
    const answeredQuestions = questions.filter(q => q.response).length
    const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return NextResponse.json({
      data: {
        questions,
        stats: {
          total: totalQuestions,
          answered: answeredQuestions,
          progress,
          canGenerateChapter: answeredQuestions >= Math.ceil(totalQuestions * 0.5), // 50% minimum
        },
      },
    })

  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}
