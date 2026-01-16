// Inngest Job Functions
import { inngest } from './client';
import { prisma } from '@/lib/prisma';
import { mockOpenAI } from '@/lib/services/mock/openai';
import type { ProjectStatus } from '@prisma/client';

/**
 * Job 1: Generate Interview Questions
 */
export const generateQuestionsJob = inngest.createFunction(
  {
    id: 'generate-questions',
    name: 'Generate Interview Questions',
    retries: 2,
  },
  { event: 'interview/questions.generate' },
  async ({ event, step }) => {
    const { projectId } = event.data;

    console.log(`[Inngest] Starting question generation for project: ${projectId}`);

    // Step 1: Get interviewee data
    const project = await step.run('fetch-project-data', async () => {
      return await prisma.project.findUnique({
        where: { id: projectId },
        include: { interviewee: true },
      });
    });

    if (!project || !project.interviewee) {
      throw new Error('Project or interviewee not found');
    }

    // Step 2: Generate questions using mock OpenAI
    const questions = await step.run('generate-questions', async () => {
      return await mockOpenAI.generateQuestions(
        {
          name: project.interviewee.name,
          relationship: project.interviewee.relationship,
          birthYear: project.interviewee.birthYear || undefined,
          generation: project.interviewee.generation || undefined,
          topics: project.interviewee.topics as string[],
        },
        20
      );
    });

    // Step 3: Save questions to database
    await step.run('save-questions', async () => {
      await prisma.interviewQuestion.createMany({
        data: questions.map((q) => ({
          projectId,
          question: q.question,
          category: q.category,
          order: q.order,
          isFollowUp: false,
        })),
      });
    });

    // Step 4: Update project status
    await step.run('update-project-status', async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'QUESTIONS_GENERATED' as ProjectStatus },
      });
    });

    // Step 5: Update job status
    await step.run('complete-job', async () => {
      await prisma.job.updateMany({
        where: {
          projectId,
          type: 'GENERATE_QUESTIONS',
          status: 'RUNNING',
        },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          output: {
            questionsGenerated: questions.length,
          },
        },
      });
    });

    console.log(`[Inngest] Question generation complete for project: ${projectId}`);
    return { success: true, questionsGenerated: questions.length };
  }
);

/**
 * Job 2: Transcribe Audio
 */
export const transcribeAudioJob = inngest.createFunction(
  {
    id: 'transcribe-audio',
    name: 'Transcribe Audio',
    retries: 3,
  },
  { event: 'interview/audio.transcribe' },
  async ({ event, step }) => {
    const { sessionId, audioFileKey, duration } = event.data;

    console.log(`[Inngest] Starting transcription for session: ${sessionId}`);

    // Step 1: Get session data
    const session = await step.run('fetch-session', async () => {
      return await prisma.interviewSession.findUnique({
        where: { id: sessionId },
      });
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Step 2: Update job progress
    await step.run('update-progress-25', async () => {
      await prisma.job.updateMany({
        where: {
          projectId: session.projectId,
          type: 'TRANSCRIBE_AUDIO',
          status: 'RUNNING',
        },
        data: { progress: 25 },
      });
    });

    // Step 3: Transcribe audio using mock OpenAI
    const transcription = await step.run('transcribe-audio', async () => {
      return await mockOpenAI.transcribeAudio(audioFileKey, duration);
    });

    // Step 4: Update progress
    await step.run('update-progress-75', async () => {
      await prisma.job.updateMany({
        where: {
          projectId: session.projectId,
          type: 'TRANSCRIBE_AUDIO',
          status: 'RUNNING',
        },
        data: { progress: 75 },
      });
    });

    // Step 5: Save transcription
    await step.run('save-transcription', async () => {
      await prisma.transcription.create({
        data: {
          sessionId,
          text: transcription.text,
          accuracy: 0.95, // Mock accuracy
          wordTimings: null,
          speakerLabels: null,
        },
      });
    });

    // Step 6: Update session and project status
    await step.run('update-statuses', async () => {
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: 'COMPLETE' },
      });

      await prisma.project.update({
        where: { id: session.projectId },
        data: { status: 'TRANSCRIPTION_COMPLETE' as ProjectStatus },
      });
    });

    // Step 7: Complete job
    await step.run('complete-job', async () => {
      await prisma.job.updateMany({
        where: {
          projectId: session.projectId,
          type: 'TRANSCRIBE_AUDIO',
          status: 'RUNNING',
        },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          output: {
            wordCount: transcription.wordCount,
            duration: transcription.duration,
          },
        },
      });
    });

    console.log(`[Inngest] Transcription complete for session: ${sessionId}`);
    return { success: true, wordCount: transcription.wordCount };
  }
);

/**
 * Job 3: Generate Narrative
 */
export const generateNarrativeJob = inngest.createFunction(
  {
    id: 'generate-narrative',
    name: 'Generate Narrative',
    retries: 2,
  },
  { event: 'interview/narrative.generate' },
  async ({ event, step }) => {
    const { projectId, style } = event.data;

    console.log(`[Inngest] Starting narrative generation for project: ${projectId}`);

    // Step 1: Get transcription
    const transcription = await step.run('fetch-transcription', async () => {
      const session = await prisma.interviewSession.findFirst({
        where: { projectId },
        include: { transcription: true },
      });

      if (!session?.transcription) {
        throw new Error('Transcription not found');
      }

      return session.transcription;
    });

    // Step 2: Update progress
    await step.run('update-progress-25', async () => {
      await prisma.job.updateMany({
        where: {
          projectId,
          type: 'GENERATE_NARRATIVE',
          status: 'RUNNING',
        },
        data: { progress: 25 },
      });
    });

    // Step 3: Generate narrative
    const narrative = await step.run('generate-narrative', async () => {
      return await mockOpenAI.generateNarrative(transcription.text, style);
    });

    // Step 4: Update progress
    await step.run('update-progress-75', async () => {
      await prisma.job.updateMany({
        where: {
          projectId,
          type: 'GENERATE_NARRATIVE',
          status: 'RUNNING',
        },
        data: { progress: 75 },
      });
    });

    // Step 5: Save narrative
    await step.run('save-narrative', async () => {
      await prisma.narrative.create({
        data: {
          projectId,
          content: narrative.content,
          structure: narrative.structure,
          wordCount: narrative.wordCount,
          version: 1,
          status: 'DRAFT',
        },
      });
    });

    // Step 6: Update project status
    await step.run('update-project-status', async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'NARRATIVE_COMPLETE' as ProjectStatus },
      });
    });

    // Step 7: Complete job
    await step.run('complete-job', async () => {
      await prisma.job.updateMany({
        where: {
          projectId,
          type: 'GENERATE_NARRATIVE',
          status: 'RUNNING',
        },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          output: {
            wordCount: narrative.wordCount,
            chapters: narrative.structure.chapters.length,
          },
        },
      });
    });

    console.log(`[Inngest] Narrative generation complete for project: ${projectId}`);
    return { success: true, wordCount: narrative.wordCount };
  }
);

// Export all functions as an array
export const functions = [
  generateQuestionsJob,
  transcribeAudioJob,
  generateNarrativeJob,
];
