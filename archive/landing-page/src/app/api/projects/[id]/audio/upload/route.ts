import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mockS3 } from "@/lib/services/mock/s3"
import { inngest } from "@/lib/inngest/client"
import { z } from "zod"

// Validation schema
const uploadSchema = z.object({
  useDummyData: z.boolean().default(false),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  duration: z.number().optional(), // Duration in seconds
})

/**
 * POST /api/projects/:id/audio/upload
 *
 * Handles audio upload for interview sessions.
 * For MVP: supports dummy data mode for testing without real audio files.
 *
 * Body:
 * - useDummyData: boolean (if true, creates a session with mock data)
 * - fileName: string (optional, for dummy data)
 * - fileSize: number (optional, for dummy data in bytes)
 * - duration: number (optional, for dummy data in seconds)
 */
export async function POST(
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = uploadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { useDummyData, fileName, fileSize, duration } = validation.data

    // Handle dummy data mode (for MVP testing)
    if (useDummyData) {
      const dummyFileName = fileName || "dummy-interview-audio.mp3"
      const dummyFileSize = fileSize || 5242880 // 5 MB
      const dummyDuration = duration || 180 // 3 minutes

      // Generate mock S3 upload URL
      const uploadResult = await mockS3.getUploadUrl(
        dummyFileName,
        dummyFileSize,
        "audio/mpeg"
      )

      // Create interview session
      const interviewSession = await prisma.interviewSession.create({
        data: {
          projectId: params.id,
          audioFileKey: uploadResult.fileKey,
          audioUrl: uploadResult.downloadUrl,
          fileSize: dummyFileSize,
          duration: dummyDuration,
          status: "UPLOADED",
          uploadedAt: new Date(),
        },
      })

      // Update project status
      await prisma.project.update({
        where: { id: params.id },
        data: { status: "AUDIO_UPLOADED" },
      })

      // Create transcription job
      const job = await prisma.job.create({
        data: {
          projectId: params.id,
          userId: session.user.id,
          type: "TRANSCRIBE_AUDIO",
          status: "PENDING",
          progress: 0,
          input: {
            sessionId: interviewSession.id,
            audioFileKey: uploadResult.fileKey,
            duration: dummyDuration,
          },
        },
      })

      // Trigger Inngest job to transcribe audio
      await inngest.send({
        name: "interview/audio.transcribe",
        data: {
          sessionId: interviewSession.id,
          audioFileKey: uploadResult.fileKey,
          duration: dummyDuration,
        },
      })

      // Update job status to running
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "RUNNING" },
      })

      // Update project status to transcribing
      await prisma.project.update({
        where: { id: params.id },
        data: { status: "TRANSCRIBING" },
      })

      return NextResponse.json({
        data: {
          sessionId: interviewSession.id,
          jobId: job.id,
          status: "TRANSCRIBING",
          message: "Dummy audio uploaded successfully. Transcription started.",
        },
      })
    }

    // TODO: Real file upload support (Phase 2)
    // This will involve:
    // 1. Getting presigned S3 URL for client-side upload
    // 2. Returning upload URL to client
    // 3. Client uploads directly to S3
    // 4. Client confirms upload completion
    // 5. Trigger transcription job

    return NextResponse.json(
      { error: "Real file upload not yet implemented. Use useDummyData: true for testing." },
      { status: 501 }
    )

  } catch (error) {
    console.error("Error uploading audio:", error)
    return NextResponse.json(
      { error: "Failed to upload audio" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/:id/audio/upload
 *
 * Get upload status for a project's interview sessions
 */
export async function GET(
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
        sessions: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            transcription: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        sessions: project.sessions,
        projectStatus: project.status,
      },
    })

  } catch (error) {
    console.error("Error fetching upload status:", error)
    return NextResponse.json(
      { error: "Failed to fetch upload status" },
      { status: 500 }
    )
  }
}
