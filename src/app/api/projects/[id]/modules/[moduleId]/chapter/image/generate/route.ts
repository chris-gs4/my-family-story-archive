// API Route: Generate AI illustration for chapter
// Uses DALL-E 3 to create hand-drawn sketch style images

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openAIService } from '@/lib/services/openai';

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
      include: {
        interviewee: true,
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

    // 4. Extract theme from chapter content for image generation
    const theme = extractThemeFromChapter(chapter.content, storyModule.title);

    // 5. Build DALL-E prompt for minimalist hand-drawn sketch
    const imagePrompt = buildSketchPrompt(theme, project.interviewee?.name);

    console.log('[Image Generation] Generated prompt:', imagePrompt);

    // 6. Generate image using DALL-E 3
    const { url, revisedPrompt } = await openAIService.generateImage(imagePrompt, {
      size: '1024x1024',
      quality: 'standard',
      style: 'natural', // Natural style works better for sketches than vivid
    });

    // 7. Save image URL to chapter
    const updatedChapter = await prisma.moduleChapter.update({
      where: { id: chapter.id },
      data: {
        illustrationUrl: url,
        illustrationPrompt: revisedPrompt,
        illustrationGeneratedAt: new Date(),
      },
    });

    // 8. Auto-copy illustration to module cover (if module doesn't have one)
    if (!storyModule.coverImageUrl) {
      await prisma.module.update({
        where: { id: moduleId },
        data: {
          coverImageUrl: url,
          coverImagePrompt: revisedPrompt,
          coverImageGeneratedAt: new Date(),
        },
      });

      console.log('[Image Generation] Auto-copied illustration to module cover');
    }

    console.log('[Image Generation] Successfully generated and saved illustration');

    return NextResponse.json({
      success: true,
      imageUrl: url,
      prompt: revisedPrompt,
      chapter: updatedChapter,
    });
  } catch (error: any) {
    console.error('[Image Generation] Error:', error);

    // Handle specific OpenAI errors
    if (error.message?.includes('quota')) {
      return NextResponse.json(
        {
          error: 'OpenAI quota exceeded. Please check your API key billing.',
          type: 'quota_exceeded',
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again in a moment.',
          type: 'rate_limit',
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('authentication') || error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'OpenAI API authentication failed. Please check configuration.',
          type: 'auth_error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract key theme/subject from chapter content
 * Returns a brief description suitable for image generation
 */
function extractThemeFromChapter(content: string, moduleTitle?: string | null): string {
  // Get first 500 characters for analysis
  const excerpt = content.substring(0, 500);

  // Extract key phrases (simple heuristic - could be enhanced with AI)
  // Look for memorable moments, places, activities mentioned early in the chapter
  const sentences = excerpt.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const firstSentence = sentences[0] || '';

  // Use module title as context if available
  const titleContext = moduleTitle ? `${moduleTitle}: ` : '';

  // Extract subject matter (very simplified - could use GPT for better extraction)
  // Common patterns: "I remember...", "My childhood...", "We lived...", etc.
  if (firstSentence.toLowerCase().includes('childhood') || firstSentence.toLowerCase().includes('growing up')) {
    return `${titleContext}childhood memories and early life`;
  }

  if (firstSentence.toLowerCase().includes('school') || firstSentence.toLowerCase().includes('education')) {
    return `${titleContext}school days and education`;
  }

  if (firstSentence.toLowerCase().includes('family') || firstSentence.toLowerCase().includes('parents')) {
    return `${titleContext}family life and relationships`;
  }

  if (firstSentence.toLowerCase().includes('work') || firstSentence.toLowerCase().includes('career') || firstSentence.toLowerCase().includes('job')) {
    return `${titleContext}work and career journey`;
  }

  if (firstSentence.toLowerCase().includes('love') || firstSentence.toLowerCase().includes('marriage') || firstSentence.toLowerCase().includes('partner')) {
    return `${titleContext}love and relationships`;
  }

  // Default: use module title or generic
  return moduleTitle || 'life memories and experiences';
}

/**
 * Build DALL-E prompt for minimalist hand-drawn sketch
 */
function buildSketchPrompt(theme: string, intervieweeName?: string | null): string {
  const name = intervieweeName ? `for ${intervieweeName}'s story about ` : 'depicting ';

  return `Minimalist black and white line drawing sketch ${name}${theme}.
Hand-drawn illustration style with clean, simple lines.
Like a thoughtful book illustration - not detailed or realistic, just capturing the essence.
No shading, no background clutter, just elegant linework on white background.
Warm and nostalgic feeling, suitable for a family memoir.`;
}
