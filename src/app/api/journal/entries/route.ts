import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { s3Service } from "@/lib/services/s3"

// GET /api/journal/entries - List all journal entries for the user's active project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the user's journal project (most recent)
    const project = await prisma.project.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    if (!project) {
      return NextResponse.json({ data: [], total: 0 })
    }

    const entries = await prisma.journalEntry.findMany({
      where: { projectId: project.id },
      orderBy: { entryDate: "desc" },
      select: {
        id: true,
        entryDate: true,
        title: true,
        narrativeText: true,
        promptText: true,
        status: true,
        wordCount: true,
        duration: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: entries, total: entries.length })
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    )
  }
}

// POST /api/journal/entries - Create a new journal entry and get a presigned upload URL
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, promptText, audioFormat = "webm" } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      )
    }

    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Generate presigned upload URL with format-aware extension and MIME type
    const mimeTypes: Record<string, string> = {
      webm: "audio/webm",
      aac: "audio/aac",
      mp4: "audio/mp4",
      m4a: "audio/mp4",
    }
    const ext = audioFormat in mimeTypes ? audioFormat : "webm"
    const contentType = mimeTypes[ext] || "audio/webm"
    const fileName = `entry-${Date.now()}.${ext}`
    const { fileKey, uploadUrl } = await s3Service.getUploadUrl(
      fileName,
      contentType
    )

    // Create journal entry record
    const entry = await prisma.journalEntry.create({
      data: {
        projectId,
        audioFileKey: fileKey,
        promptText: promptText || null,
        status: "RECORDING",
      },
    })

    return NextResponse.json(
      {
        data: {
          entry,
          uploadUrl,
          fileKey,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json(
      { error: "Failed to create journal entry" },
      { status: 500 }
    )
  }
}
