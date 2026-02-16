import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateChapterPDF } from "@/lib/services/documentGenerator"
import type { ModuleChapterData } from "@/lib/services/documentGenerator"

/**
 * GET /api/projects/:id/modules/:moduleId/chapter/export
 *
 * Exports a single module chapter as PDF
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
      include: {
        interviewee: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Get module with latest chapter
    const storyModule = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        projectId: params.id,
      },
      include: {
        chapters: {
          orderBy: {
            version: "desc",
          },
          take: 1,
        },
      },
    })

    if (!storyModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      )
    }

    const chapter = storyModule.chapters[0]

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found. Please generate a chapter first." },
        { status: 404 }
      )
    }

    // Fetch illustration and convert to base64 if available
    let illustrationBase64: string | undefined = undefined;
    if (chapter.illustrationUrl) {
      try {
        console.log('Fetching illustration from URL...');
        const imageResponse = await fetch(chapter.illustrationUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          illustrationBase64 = `data:image/png;base64,${base64}`;
          console.log('Illustration fetched and converted to base64');
        }
      } catch (imageError) {
        console.warn('Failed to fetch illustration, PDF will not include image:', imageError);
      }
    }

    // Prepare chapter data for PDF generation
    const chapterData: ModuleChapterData = {
      moduleNumber: storyModule.moduleNumber,
      title: storyModule.title || undefined,
      content: chapter.content,
      wordCount: chapter.wordCount || undefined,
      illustrationUrl: illustrationBase64,
    }

    // Generate PDF
    let result;
    try {
      console.log('Generating PDF for chapter:', {
        moduleNumber: chapterData.moduleNumber,
        title: chapterData.title,
        contentLength: chapterData.content.length,
        intervieweeName: project.interviewee?.name,
        projectTitle: project.title
      });

      result = await generateChapterPDF(
        chapterData,
        project.interviewee?.name,
        project.title
      )

      console.log('PDF generated successfully:', {
        bufferSize: result.buffer.length,
        filename: result.filename
      });
    } catch (error) {
      console.error("Error generating chapter PDF:", error)
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      return NextResponse.json(
        { error: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
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
    console.error("Error exporting chapter:", error)
    return NextResponse.json(
      { error: "Failed to export chapter" },
      { status: 500 }
    )
  }
}
