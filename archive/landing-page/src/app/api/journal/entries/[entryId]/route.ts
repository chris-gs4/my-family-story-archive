import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inngest } from "@/lib/inngest/client"
import { openAIService } from "@/lib/services/openai"
import { mockOpenAI } from "@/lib/services/mock/openai"
import { s3Service } from "@/lib/services/s3"

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

/**
 * Process a journal entry inline (fallback when Inngest is unavailable)
 */
async function processEntryInline(entryId: string, audioFileKey: string, jobId: string) {
  try {
    // Mark as processing
    await prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: "PROCESSING" },
    })
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "RUNNING", startedAt: new Date(), progress: 10 },
    })

    // Use real APIs only when both S3 and OpenAI are configured
    const useRealAPIs = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.OPENAI_API_KEY

    // Transcribe
    let transcription;
    if (useRealAPIs) {
      const buffer = await s3Service.getFileBuffer(audioFileKey)
      transcription = await openAIService.transcribeAudioFile(buffer)
    } else {
      transcription = await mockOpenAI.transcribeAudio(audioFileKey, 180)
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { progress: 50 },
    })

    // Generate narrative
    let narrative;
    if (useRealAPIs) {
      narrative = await openAIService.generateJournalNarrative(transcription.text)
    } else {
      const mockResult = await mockOpenAI.generateNarrative(transcription.text)
      narrative = {
        title: "A Memory Unfolds",
        narrativeText: mockResult.content,
        wordCount: mockResult.wordCount,
      }
    }

    // Save results
    await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        rawTranscript: transcription.text,
        title: narrative.title,
        narrativeText: narrative.narrativeText,
        wordCount: narrative.wordCount,
        duration: transcription.duration,
        status: "COMPLETE",
      },
    })

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        output: {
          title: narrative.title,
          wordCount: narrative.wordCount,
          duration: transcription.duration,
        },
      },
    })

    console.log(`[Inline] Journal entry processed: ${entryId} - "${narrative.title}"`)
  } catch (error) {
    console.error(`[Inline] Failed to process entry ${entryId}:`, error)
    await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        status: "ERROR",
        errorMessage: error instanceof Error ? error.message : "Processing failed",
      },
    })
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Processing failed",
      },
    })
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

      // In development, always process inline (Inngest dev server may not be running)
      // In production, use Inngest for background processing
      const useInline = process.env.NODE_ENV !== "production"
      if (useInline) {
        console.log("[Journal] Processing inline (development mode)")
        processEntryInline(params.entryId, entry.audioFileKey || "", job.id)
      } else {
        try {
          await inngest.send({
            name: "journal/entry.process",
            data: {
              entryId: params.entryId,
              audioFileKey: entry.audioFileKey,
              jobId: job.id,
              projectId: entry.project.id,
            },
          })
        } catch (inngestError) {
          console.log("[Journal] Inngest send failed, falling back to inline")
          processEntryInline(params.entryId, entry.audioFileKey || "", job.id)
        }
      }

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
