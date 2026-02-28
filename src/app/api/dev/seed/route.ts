import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { seedMabelPipelineTest } from "../../../../../scripts/seed-mabel-pipeline-test"

/**
 * POST /api/dev/seed
 * Seed pipeline test data for the authenticated user.
 * Only available in development mode.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const project = await seedMabelPipelineTest(session.user.id)

    if (!project) {
      return NextResponse.json(
        { error: "Failed to create seed data" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        projectId: project.id,
        title: project.title,
      },
      message: "Pipeline test data seeded successfully",
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    )
  }
}
