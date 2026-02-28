import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { s3Service } from "@/lib/services/s3"
import { openAIService } from "@/lib/services/openai"
import { mockOpenAI } from "@/lib/services/mock/openai"
import { z } from "zod"

const answerSchema = z.object({
  response: z.string().min(1, "Response cannot be empty").max(10000, "Response too long"),
})

const startRecordingSchema = z.object({
  action: z.literal("start-recording"),
  audioFormat: z.enum(["aac", "webm"]).default("webm"),
})

const uploadCompleteSchema = z.object({
  action: z.literal("upload-complete"),
  duration: z.number().int().min(1).optional(),
})

/**
 * Process a module question's audio inline (transcribe -> narrative -> save)
 */
async function processQuestionAudio(
  questionId: string,
  moduleId: string,
  audioFileKey: string
) {
  try {
    // Mark as processing
    await prisma.moduleQuestion.update({
      where: { id: questionId },
      data: { processingStatus: "PROCESSING" },
    })

    const useRealAPIs = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.OPENAI_API_KEY

    // Transcribe
    let transcription
    if (useRealAPIs) {
      const buffer = await s3Service.getFileBuffer(audioFileKey)
      transcription = await openAIService.transcribeAudioFile(buffer)
    } else {
      transcription = await mockOpenAI.transcribeAudio(audioFileKey, 180)
    }

    // Generate narrative snippet
    let narrativeText: string
    if (useRealAPIs) {
      const result = await openAIService.generateJournalNarrative(transcription.text)
      narrativeText = result.narrativeText
    } else {
      const mockResult = await mockOpenAI.generateNarrative(transcription.text)
      narrativeText = mockResult.content
    }

    // Save results — response gets the transcript so chapter generation can read it
    await prisma.moduleQuestion.update({
      where: { id: questionId },
      data: {
        response: transcription.text,
        rawTranscript: transcription.text,
        narrativeText,
        processingStatus: "COMPLETE",
        respondedAt: new Date(),
        duration: transcription.duration,
      },
    })

    // Update module status to IN_PROGRESS if it was in QUESTIONS_GENERATED
    const storyModule = await prisma.module.findUnique({
      where: { id: moduleId },
    })
    if (storyModule && storyModule.status === "QUESTIONS_GENERATED") {
      await prisma.module.update({
        where: { id: moduleId },
        data: { status: "IN_PROGRESS" },
      })
    }

    console.log(`[Inline] Module question processed: ${questionId}`)
  } catch (error) {
    console.error(`[Inline] Failed to process question ${questionId}:`, error)
    await prisma.moduleQuestion.update({
      where: { id: questionId },
      data: {
        processingStatus: "ERROR",
        errorMessage: error instanceof Error ? error.message : "Processing failed",
      },
    })
  }
}

/**
 * Helper: verify project ownership and return project
 */
async function verifyProjectOwnership(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
  })
}

/**
 * PATCH /api/projects/:id/modules/:moduleId/questions/:questionId
 * Submit answer to a question (text or voice)
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

    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Discriminate on action field
    if (body.action === "start-recording") {
      const validation = startRecordingSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        )
      }

      const { audioFormat } = validation.data
      const extension = audioFormat === "aac" ? "m4a" : "webm"
      const contentType = audioFormat === "aac" ? "audio/aac" : "audio/webm"
      const fileName = `module-q-${params.questionId}.${extension}`

      const uploadResult = await s3Service.getUploadUrl(fileName, contentType)

      // Update question with file key and recording status
      await prisma.moduleQuestion.update({
        where: { id: params.questionId },
        data: {
          audioFileKey: uploadResult.fileKey,
          processingStatus: "RECORDING",
          // Clear any previous response/error
          errorMessage: null,
        },
      })

      return NextResponse.json({
        data: {
          uploadUrl: uploadResult.uploadUrl,
          fileKey: uploadResult.fileKey,
        },
      })
    }

    if (body.action === "upload-complete") {
      const validation = uploadCompleteSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        )
      }

      const question = await prisma.moduleQuestion.findUnique({
        where: { id: params.questionId },
      })

      if (!question || !question.audioFileKey) {
        return NextResponse.json(
          { error: "No recording found for this question" },
          { status: 400 }
        )
      }

      // Mark as uploading then trigger processing
      await prisma.moduleQuestion.update({
        where: { id: params.questionId },
        data: {
          processingStatus: "UPLOADING",
          duration: validation.data.duration || null,
        },
      })

      // Process inline (fire and forget)
      processQuestionAudio(
        params.questionId,
        params.moduleId,
        question.audioFileKey
      )

      return NextResponse.json({
        data: { status: "processing" },
        message: "Upload complete, processing started",
      })
    }

    // Default: text response
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
    const storyModule = await prisma.module.findUnique({
      where: { id: params.moduleId },
    })

    if (storyModule && storyModule.status === "QUESTIONS_GENERATED") {
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

    const project = await verifyProjectOwnership(params.id, session.user.id)
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

/**
 * DELETE /api/projects/:id/modules/:moduleId/questions/:questionId
 * Clear a voice recording from a question
 */
export async function DELETE(
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

    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const question = await prisma.moduleQuestion.findUnique({
      where: { id: params.questionId },
    })

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    // Delete S3 file if exists
    if (question.audioFileKey) {
      try {
        await s3Service.deleteFile(question.audioFileKey)
      } catch (err) {
        console.error("Failed to delete S3 file:", err)
        // Continue anyway
      }
    }

    // Reset all audio/response fields
    const updated = await prisma.moduleQuestion.update({
      where: { id: params.questionId },
      data: {
        response: null,
        respondedAt: null,
        audioFileKey: null,
        rawTranscript: null,
        narrativeText: null,
        processingStatus: null,
        errorMessage: null,
        duration: null,
      },
    })

    return NextResponse.json({
      data: updated,
      message: "Recording cleared",
    })

  } catch (error) {
    console.error("Error deleting recording:", error)
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    )
  }
}
