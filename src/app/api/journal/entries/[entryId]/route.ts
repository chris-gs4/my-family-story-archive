import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inngest } from "@/lib/inngest/client"

// GET /api/journal/entries/[entryId] - Get a single journal entry
export async function GET(
  request: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entry = await prisma.journalEntry.findUnique({
      where: { id: params.entryId },
      include: {
        project: {
          select: { userId: true },
        },
      },
    })

    if (!entry || entry.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ data: entry })
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return NextResponse.json(
      { error: "Failed to fetch journal entry" },
      { status: 500 }
    )
  }
}

// PATCH /api/journal/entries/[entryId] - Update entry status (e.g., mark as uploaded)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, duration } = body

    // Fetch entry and verify ownership
    const entry = await prisma.journalEntry.findUnique({
      where: { id: params.entryId },
      include: {
        project: {
          select: { userId: true, id: true },
        },
      },
    })

    if (!entry || entry.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // Handle upload completion -> trigger processing
    if (status === "UPLOADED") {
      const updatedEntry = await prisma.journalEntry.update({
        where: { id: params.entryId },
        data: {
          status: "UPLOADED",
          duration: duration || null,
        },
      })

      // Create a job record for tracking
      const job = await prisma.job.create({
        data: {
          projectId: entry.project.id,
          userId: session.user.id,
          type: "PROCESS_JOURNAL_ENTRY",
          status: "PENDING",
          input: {
            entryId: params.entryId,
            audioFileKey: entry.audioFileKey,
          },
        },
      })

      // Trigger Inngest processing
      await inngest.send({
        name: "journal/entry.process",
        data: {
          entryId: params.entryId,
          audioFileKey: entry.audioFileKey,
          jobId: job.id,
          projectId: entry.project.id,
        },
      })

      return NextResponse.json({ data: updatedEntry })
    }

    return NextResponse.json(
      { error: "Invalid status update" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json(
      { error: "Failed to update journal entry" },
      { status: 500 }
    )
  }
}
