// API Route: Upload custom image for chapter
// Accepts base64 encoded images for MVP (S3 integration for production)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const moduleId = params.moduleId;

    // 2. Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: { email: session.user.email },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 3. Get module and chapter
    const storyModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId: projectId,
      },
      include: {
        chapters: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!storyModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const chapter = storyModule.chapters[0];
    if (!chapter) {
      return NextResponse.json(
        { error: 'No chapter found for this module' },
        { status: 404 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const { imageData, mimeType } = body;

    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // 5. Validate image data
    if (!mimeType || !ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Check if it's base64 or data URL
    let base64Data = imageData;
    if (imageData.startsWith('data:')) {
      // Extract base64 from data URL
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
      }
      base64Data = matches[2];
    }

    // Validate base64 and size
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Image too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
    }

    // 6. Store image as data URL (MVP approach)
    // For production: Upload to S3 and store URL instead
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // 7. Update chapter with custom image
    const updatedChapter = await prisma.moduleChapter.update({
      where: { id: chapter.id },
      data: {
        illustrationUrl: dataUrl,
        illustrationPrompt: 'User-uploaded custom image',
        illustrationGeneratedAt: new Date(),
      },
    });

    // 8. Auto-copy to module cover if not set
    if (!storyModule.coverImageUrl) {
      await prisma.module.update({
        where: { id: moduleId },
        data: {
          coverImageUrl: dataUrl,
          coverImagePrompt: 'User-uploaded custom image',
          coverImageGeneratedAt: new Date(),
        },
      });

      console.log('[Image Upload] Auto-copied uploaded image to module cover');
    }

    console.log('[Image Upload] Successfully uploaded and saved custom image');

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      chapter: updatedChapter,
    });
  } catch (error: any) {
    console.error('[Image Upload] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
