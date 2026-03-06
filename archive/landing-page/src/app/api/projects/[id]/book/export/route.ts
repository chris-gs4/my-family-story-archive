import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateBookPDF } from "@/lib/services/documentGenerator"
import type { BookData, ModuleChapterData } from "@/lib/services/documentGenerator"

/**
 * GET /api/projects/:id/book/export
 *
 * Compiles all approved module chapters into a complete PDF book
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
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

    // Fetch project with approved modules and their chapters
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        interviewee: true,
        modules: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            moduleNumber: "asc",
          },
          include: {
            chapters: {
              orderBy: {
                version: "desc",
              },
              take: 1, // Get latest chapter version
            },
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

    if (project.modules.length === 0) {
      return NextResponse.json(
        { error: "No approved chapters found. Please approve at least one chapter first." },
        { status: 400 }
      )
    }

    // Prepare book data
    const chapters: ModuleChapterData[] = project.modules
      .filter(module => module.chapters.length > 0)
      .map(module => ({
        moduleNumber: module.moduleNumber,
        title: module.title || undefined,
        content: module.chapters[0].content,
        wordCount: module.chapters[0].wordCount || undefined,
      }))

    if (chapters.length === 0) {
      return NextResponse.json(
        { error: "No chapters found in approved modules" },
        { status: 400 }
      )
    }

    const bookData: BookData = {
      title: project.bookTitle || project.title || "Family Story",
      intervieweeName: project.interviewee?.name,
      chapters,
      createdAt: new Date(),
      projectCreatedAt: project.createdAt,
    }

    // Generate PDF
    let result;
    try {
      result = await generateBookPDF(bookData)
    } catch (error) {
      console.error("Error generating book PDF:", error)
      return NextResponse.json(
        { error: "Failed to generate PDF book" },
        { status: 500 }
      )
    }

    // Update project book status
    try {
      await prisma.project.update({
        where: { id: params.id },
        data: {
          bookStatus: "COMPLETE",
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      // Non-critical, log but continue
      console.error("Failed to update book status:", error)
    }

    // Return the file as a download
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("Error exporting book:", error)
    return NextResponse.json(
      { error: "Failed to export book" },
      { status: 500 }
    )
  }
}
