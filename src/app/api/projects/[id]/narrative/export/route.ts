import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generatePDF, generateDOCX, generateTXT } from "@/lib/services/documentGenerator"
import type { NarrativeData } from "@/lib/services/documentGenerator"

/**
 * GET /api/projects/:id/narrative/export?format=pdf|docx|txt
 *
 * Exports the project narrative in the specified format
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

    // Get format from query params (default to txt)
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format')?.toLowerCase() || 'txt'

    // Validate format
    if (!['pdf', 'docx', 'txt'].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Supported formats: pdf, docx, txt" },
        { status: 400 }
      )
    }

    // Fetch project with narrative and interviewee data
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        narrative: true,
        interviewee: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (!project.narrative) {
      return NextResponse.json(
        { error: "No narrative found for this project" },
        { status: 404 }
      )
    }

    // Prepare narrative data
    const narrativeData: NarrativeData = {
      title: project.title || 'Family Story',
      content: project.narrative.content,
      intervieweeName: project.interviewee?.name,
      wordCount: project.narrative.wordCount || undefined,
      createdAt: project.narrative.createdAt,
      structure: project.narrative.structure as { chapters: Array<{ title: string; startPage?: number }> },
    }

    // Generate document in requested format
    let result;

    try {
      switch (format) {
        case 'pdf':
          result = await generatePDF(narrativeData)
          break
        case 'docx':
          result = await generateDOCX(narrativeData)
          break
        case 'txt':
          result = generateTXT(narrativeData)
          break
        default:
          return NextResponse.json(
            { error: "Unsupported format" },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error)
      return NextResponse.json(
        { error: `Failed to generate ${format.toUpperCase()} document` },
        { status: 500 }
      )
    }

    // Return the file as a download
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("Error exporting narrative:", error)
    return NextResponse.json(
      { error: "Failed to export narrative" },
      { status: 500 }
    )
  }
}
