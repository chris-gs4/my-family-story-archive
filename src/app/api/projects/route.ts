import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const createProjectSchema = z.object({
  title: z.string().min(1).max(200).trim(),
})

// GET /api/projects - List all projects for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          interviewee: {
            select: {
              name: true,
              relationship: true,
            },
          },
          sessions: {
            select: {
              id: true,
              status: true,
            },
          },
          narrative: {
            select: {
              id: true,
              status: true,
              wordCount: true,
            },
          },
          jobs: {
            where: {
              status: {
                in: ["PENDING", "RUNNING"],
              },
            },
            select: {
              id: true,
              type: true,
              status: true,
              progress: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      data: projects,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = createProjectSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title } = validation.data

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        userId: session.user.id,
        status: "DRAFT",
      },
      include: {
        interviewee: true,
        sessions: true,
        narrative: true,
      },
    })

    return NextResponse.json(
      {
        data: project,
        message: "Project created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
