// API Route: Save Interviewee Information
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { name, relationship, birthYear, generation, topics, notes } = body;

    // Validate required fields
    if (!name || !relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    // Create or update interviewee
    const interviewee = await prisma.interviewee.upsert({
      where: { projectId: params.id },
      update: {
        name,
        relationship,
        birthYear: birthYear || null,
        generation: generation || null,
        topics: topics || [],
        notes: notes || null,
      },
      create: {
        projectId: params.id,
        name,
        relationship,
        birthYear: birthYear || null,
        generation: generation || null,
        topics: topics || [],
        notes: notes || null,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'RECORDING_INFO' },
    });

    console.log(`[API] Interviewee information saved for project: ${params.id}`);

    return NextResponse.json({
      data: interviewee,
      message: 'Interviewee information saved successfully',
    });
  } catch (error) {
    console.error('[API] Error saving interviewee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
