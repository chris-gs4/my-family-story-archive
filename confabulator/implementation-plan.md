# Implementation Plan: Family Story Archive

## Executive Summary

### Core Value Proposition
Family Story Archive enables users to effortlessly capture and preserve family stories by transforming interviews into written narratives and audiobooks using AI-driven technology.

### MVP Scope
The MVP includes AI-guided interview questions, audio transcription, narrative generation, and audiobook creation with voice cloning. These features empower users to document and share family stories seamlessly.

### Success Criteria
- **Feature Completion:** All P0 features from the PRD implemented and tested
- **User Validation:** 10 users successfully complete the core workflow and provide positive feedback
- **Technical Quality:** Core features work reliably with <5% error rate

## Technical Architecture

### Tech Stack Recommendations

**Final Stack for Web/Progressive Web App:**

**Core Framework & Infrastructure:**
- **Frontend Framework:** Next.js 14+ with React 18+ and TypeScript
- **Backend/API:** Next.js API Routes with Server Actions
- **Database:** PostgreSQL (local dev) → Neon (production serverless PostgreSQL)
- **ORM:** Prisma (for MVP rapid development; consider Drizzle ORM post-MVP for performance)
- **Authentication:** NextAuth.js v4 (cost-effective, flexible)
- **Hosting/Deployment:** Vercel (zero-config Next.js hosting)
- **UI Components:** shadcn/ui with Tailwind CSS and Radix UI primitives

**Critical Infrastructure (MVP Requirements):**
- **Job Queue:** Inngest (serverless background jobs, Vercel-optimized)
- **File Storage:** AWS S3 (cost-effective for large audio files, presigned URLs)
- **Email:** Resend (modern API, generous free tier)
- **Payments:** Stripe (industry standard, well-documented)

**Observability & Analytics:**
- **Error Tracking:** Sentry (comprehensive error monitoring)
- **Product Analytics:** PostHog (open-source, privacy-friendly)
- **Performance Monitoring:** Vercel Analytics (built-in)

**AI/ML Services:**
- **Transcription:** OpenAI Whisper API
- **LLM:** OpenAI GPT-4 (question generation, narrative creation)
- **TTS (Phase 2):** OpenAI TTS or ElevenLabs standard voices
- **Voice Cloning (Phase 3):** ElevenLabs Professional Voice Cloning

**Development & Testing:**
- **Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright
- **Code Quality:** ESLint + Prettier + TypeScript strict mode
- **Version Control:** Git + GitHub

### Architecture Patterns
- RESTful API design for backend
- Server-side rendering for SEO and performance
- State management via React context or Zustand for lightweight state

### Data Model

#### Entity Relationship Diagram (Text)
```
[User] 1──────────────M [Project]
  │                        │
  │                        ├─── 1:1 ──→ [Interviewee]
  │                        │
  │                        ├─── 1:M ──→ [InterviewQuestion]
  │                        │
  │                        ├─── 1:M ──→ [InterviewSession]
  │                        │                  │
  │                        │                  └─── 1:1 ──→ [Transcription]
  │                        │
  │                        ├─── 1:1 ──→ [Narrative]
  │                        │                  │
  │                        │                  └─── 1:1 ──→ [Audiobook] (Post-MVP)
  │                        │
  │                        └─── 1:M ──→ [Job]
  │
  └──────────────M [Payment]
```

#### Core Entities

- **User**
  - Fields: id (uuid), email (string, unique), name (string), emailVerified (timestamp), image (string), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: has_many Projects, has_many Payments
  - Indexes: email (unique) for authentication lookup
  - Notes: Using NextAuth.js schema conventions

- **Project**
  - Fields: id (uuid), userId (uuid, FK), title (string), status (enum), createdAt (timestamp), updatedAt (timestamp)
  - Status Enum: 'draft', 'recording_info', 'questions_generated', 'audio_uploaded', 'transcribing', 'transcription_complete', 'generating_narrative', 'narrative_complete', 'complete', 'error'
  - Relationships: belongs_to User, has_one Interviewee, has_many InterviewQuestions, has_many InterviewSessions, has_one Narrative, has_many Jobs
  - Indexes: userId, status, (userId, status) composite for dashboard queries
  - Constraints: Status transitions must follow state machine rules

- **Interviewee**
  - Fields: id (uuid), projectId (uuid, FK, unique), name (string), relationship (string), birthYear (int), generation (string), topics (json), notes (text), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: belongs_to Project
  - Indexes: projectId (unique)
  - Notes: Topics stored as JSON array (e.g., ["childhood", "career", "family"])

- **InterviewQuestion**
  - Fields: id (uuid), projectId (uuid, FK), question (text), category (string), order (int), isFollowUp (boolean), parentQuestionId (uuid, FK nullable), response (text nullable), createdAt (timestamp)
  - Relationships: belongs_to Project, belongs_to InterviewQuestion (self-referential for follow-ups)
  - Indexes: projectId, (projectId, order), parentQuestionId
  - Notes: Supports hierarchical question structure with follow-ups

- **InterviewSession**
  - Fields: id (uuid), projectId (uuid, FK), audioUrl (string), audioFileKey (string), duration (int), fileSize (int), status (enum), uploadedAt (timestamp), createdAt (timestamp), updatedAt (timestamp)
  - Status Enum: 'uploading', 'uploaded', 'processing', 'complete', 'error'
  - Relationships: belongs_to Project, has_one Transcription
  - Indexes: projectId, status
  - Notes: MVP supports single session; Phase 3 adds multi-session support

- **Transcription**
  - Fields: id (uuid), sessionId (uuid, FK, unique), text (text), wordTimings (json nullable), accuracy (float), speakerLabels (json nullable), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: belongs_to InterviewSession
  - Indexes: sessionId (unique)
  - Notes: wordTimings for future features; speakerLabels for Phase 3 multi-speaker support

- **Narrative**
  - Fields: id (uuid), projectId (uuid, FK, unique), content (text), structure (json), version (int), status (enum), wordCount (int), createdAt (timestamp), updatedAt (timestamp)
  - Status Enum: 'generating', 'draft', 'final', 'error'
  - Relationships: belongs_to Project, has_one Audiobook (Post-MVP)
  - Indexes: projectId (unique), status
  - Notes: structure stores chapter/section metadata; version for future edit history

- **Audiobook** (Post-MVP)
  - Fields: id (uuid), narrativeId (uuid, FK, unique), audioUrl (string), audioFileKey (string), voiceId (string nullable), voiceProvider (string), duration (int), isVoiceCloned (boolean), createdAt (timestamp), updatedAt (timestamp)
  - Relationships: belongs_to Narrative
  - Indexes: narrativeId (unique)
  - Notes: voiceId for ElevenLabs voice cloning; voiceProvider supports multiple TTS providers

- **Job**
  - Fields: id (uuid), projectId (uuid, FK), userId (uuid, FK), type (enum), status (enum), input (json), output (json nullable), progress (int), error (text nullable), startedAt (timestamp nullable), completedAt (timestamp nullable), createdAt (timestamp), updatedAt (timestamp)
  - Type Enum: 'transcribe_audio', 'generate_narrative', 'generate_questions', 'create_audiobook', 'send_notification'
  - Status Enum: 'pending', 'running', 'completed', 'failed', 'cancelled'
  - Relationships: belongs_to Project, belongs_to User
  - Indexes: projectId, userId, status, type, (projectId, type, status) composite
  - Notes: Tracks all async operations; integrated with Inngest

- **Payment**
  - Fields: id (uuid), userId (uuid, FK), projectId (uuid, FK nullable), amount (int), currency (string), status (enum), stripePaymentIntentId (string unique), metadata (json), createdAt (timestamp), updatedAt (timestamp)
  - Status Enum: 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  - Relationships: belongs_to User, belongs_to Project (optional for subscription payments)
  - Indexes: userId, stripePaymentIntentId (unique), status
  - Notes: Amount in cents; metadata stores Stripe webhook data

### API Routes / Endpoints

#### Authentication Routes (NextAuth.js)
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js dynamic route handler
  - Handles: signin, signout, callback, session, providers
  - Automatically managed by NextAuth.js

#### Project Management Routes

**Project Routes:**
- `GET /api/projects`
  - List all projects for authenticated user
  - Query params: `page` (default: 1), `limit` (default: 20), `status` (filter by status)
  - Response: `{ data: Project[], total: number, page: number, limit: number }`

- `POST /api/projects`
  - Create a new project
  - Body: `{ title: string }`
  - Response: `{ data: Project, message: string }`
  - Side effect: Creates project with status='draft'

- `GET /api/projects/:id`
  - Get single project with all related data
  - Response: `{ data: Project & { interviewee, questions, sessions, narrative, jobs } }`

- `PATCH /api/projects/:id`
  - Update project details
  - Body: `{ title?: string }`
  - Response: `{ data: Project, message: string }`

- `PATCH /api/projects/:id/status`
  - Transition project to new status
  - Body: `{ status: ProjectStatus }`
  - Validates state machine transitions
  - Response: `{ data: Project, message: string }`

- `DELETE /api/projects/:id`
  - Soft delete a project (mark as deleted, cleanup async)
  - Response: `{ message: string }`

#### Interviewee Routes

- `POST /api/projects/:id/interviewee`
  - Create/update interviewee information
  - Body: `{ name: string, relationship: string, birthYear?: number, topics: string[] }`
  - Response: `{ data: Interviewee }`
  - Side effect: Transitions project status to 'recording_info'

#### Interview Question Routes

- `POST /api/projects/:id/questions/generate`
  - Generate AI interview questions based on interviewee profile
  - Body: `{ questionCount?: number }` (default: 20)
  - Response: `{ jobId: string, message: string }`
  - Side effect: Creates job, returns immediately (async processing)

- `GET /api/projects/:id/questions`
  - Get all generated questions for project
  - Response: `{ data: InterviewQuestion[] }`

#### Audio Upload & Session Routes

- `POST /api/projects/:id/sessions/upload-url`
  - Get presigned S3 URL for audio upload
  - Body: `{ fileName: string, fileSize: number, contentType: string }`
  - Validates file size (<500MB) and type (audio/*)
  - Response: `{ uploadUrl: string, sessionId: string, fileKey: string }`

- `POST /api/projects/:id/sessions/:sessionId/confirm`
  - Confirm successful upload to S3
  - Body: `{ duration?: number }`
  - Response: `{ data: InterviewSession }`
  - Side effect: Updates session status to 'uploaded', transitions project to 'audio_uploaded'

- `POST /api/projects/:id/sessions/:sessionId/transcribe`
  - Trigger transcription job
  - Response: `{ jobId: string, message: string }`
  - Side effect: Creates transcription job, transitions project to 'transcribing'

- `GET /api/projects/:id/sessions/:sessionId/transcription`
  - Get transcription for a session
  - Response: `{ data: Transcription | null }`

#### Narrative Routes

- `POST /api/projects/:id/narrative/generate`
  - Generate narrative from transcription
  - Body: `{ style?: string }` (e.g., "first-person", "third-person")
  - Response: `{ jobId: string, message: string }`
  - Side effect: Creates narrative generation job, transitions project to 'generating_narrative'

- `GET /api/projects/:id/narrative`
  - Get current narrative
  - Response: `{ data: Narrative | null }`

- `PATCH /api/projects/:id/narrative`
  - Update narrative content (user edits)
  - Body: `{ content: string, status?: 'draft' | 'final' }`
  - Response: `{ data: Narrative }`
  - Side effect: Increments version, updates wordCount

#### Audiobook Routes (Post-MVP)

- `POST /api/projects/:id/audiobook/generate`
  - Generate audiobook from narrative
  - Body: `{ voiceId?: string, useVoiceCloning?: boolean }`
  - Response: `{ jobId: string, message: string }`
  - Side effect: Creates audiobook generation job

- `GET /api/projects/:id/audiobook`
  - Get audiobook details and download URL
  - Response: `{ data: Audiobook | null }`

#### Job Management Routes

- `GET /api/jobs/:id`
  - Get job status and progress
  - Response: `{ data: Job }`

- `GET /api/projects/:id/jobs`
  - Get all jobs for a project
  - Query params: `type`, `status`
  - Response: `{ data: Job[] }`

- `GET /api/projects/:id/events`
  - Server-Sent Events endpoint for real-time job updates
  - Streams: `{ type: 'progress' | 'complete' | 'error', jobId, data }`
  - Keep-alive connection for real-time UI updates

#### Webhook Routes

- `POST /api/webhooks/stripe`
  - Stripe webhook handler
  - Validates webhook signature
  - Handles: payment_intent.succeeded, payment_intent.failed

- `POST /api/webhooks/inngest`
  - Inngest webhook endpoint (if using Inngest Cloud)
  - Handles job status updates from Inngest

#### Utility Routes

- `GET /api/health`
  - Health check endpoint
  - Response: `{ status: 'ok', timestamp: string }`

## Interview Question Strategy

### Overview
The interview question system generates structured, contextually relevant questions based on the interviewee's profile. Questions are generated **upfront** (not in real-time during the interview) to provide a clear roadmap for conducting the interview.

### Question Generation Approach

**MVP Approach (Post-Recording Adaptation):**
1. User provides interviewee context (name, relationship, age/generation, topics)
2. System generates 15-25 questions organized by category
3. User conducts interview using questions as a guide
4. After interview, system can analyze transcription and suggest additional follow-up questions for future sessions (Phase 3)

**Post-MVP Enhancement (Phase 2):**
- Real-time question adaptation during live interviews
- Dynamic follow-up generation based on responses
- Sentiment analysis to adjust question tone

### Question Categories

Questions are organized into thematic categories that create a comprehensive life narrative:

1. **Early Life & Childhood (4-5 questions)**
   - Birth, family background, early memories
   - Childhood home, neighborhood, siblings
   - School experiences, friends, formative events
   - Example: "Can you describe the home you grew up in? What do you remember most about it?"

2. **Adolescence & Education (3-4 questions)**
   - High school experiences, challenges
   - Significant relationships, mentors
   - Aspirations, dreams, turning points
   - Example: "What did you want to be when you grew up? How did that change over time?"

3. **Career & Work Life (3-4 questions)**
   - First job, career path, major decisions
   - Achievements, challenges, failures
   - Work-life lessons, professional relationships
   - Example: "Tell me about your first real job. What did you learn from that experience?"

4. **Relationships & Family (4-5 questions)**
   - Meeting spouse/partner, courtship, marriage
   - Parenting experiences, family dynamics
   - Important friendships, community ties
   - Example: "How did you meet [spouse]? What attracted you to them?"

5. **Values & Beliefs (2-3 questions)**
   - Core values, what matters most
   - How values have evolved over time
   - Lessons learned, wisdom to pass on
   - Example: "What principles have guided your decisions throughout your life?"

6. **Legacy & Reflection (2-3 questions)**
   - Proudest moments, regrets
   - Advice for future generations
   - Hopes, dreams for the future
   - Example: "What do you hope your grandchildren remember about you?"

### Question Personalization

Questions are customized based on:
- **Relationship**: Parent, grandparent, friend, mentor (affects tone and intimacy)
- **Generation**: Greatest Generation, Silent, Boomer, Gen X (historical context)
- **Topics**: User-specified interests (e.g., "military service", "immigration story")
- **Age**: Adjusts life stage questions appropriately

### Follow-Up Question Logic

Each primary question has 2-3 potential follow-ups stored as metadata:
- **Depth follow-ups**: "Can you tell me more about that?"
- **Emotion follow-ups**: "How did that make you feel?"
- **Detail follow-ups**: "What specific details do you remember?"
- **Connection follow-ups**: "How did that experience shape who you are today?"

Example structure:
```typescript
{
  question: "Tell me about your first real job.",
  category: "career",
  order: 8,
  followUps: [
    "What was the most challenging part of that job?",
    "What did that experience teach you?",
    "How did that job influence your career path?"
  ]
}
```

### Question Generation Prompt Template

```
You are helping create a personalized interview guide for capturing [RELATIONSHIP]'s life story.

Interviewee Profile:
- Name: [NAME]
- Relationship to interviewer: [RELATIONSHIP]
- Generation: [GENERATION] (born ~[BIRTH_YEAR])
- Topics of interest: [TOPICS]

Generate [QUESTION_COUNT] interview questions organized by these categories:
- Early Life & Childhood
- Adolescence & Education
- Career & Work Life
- Relationships & Family
- Values & Beliefs
- Legacy & Reflection

Requirements:
1. Questions should be open-ended and invite storytelling
2. Use warm, conversational tone appropriate for [RELATIONSHIP]
3. Include specific historical/cultural context for [GENERATION]
4. Emphasize [TOPICS] where relevant
5. Order questions chronologically within each category
6. For each question, suggest 2-3 follow-up questions

Output format: JSON array of question objects with category, order, question text, and followUps array.
```

### Implementation Notes

- Questions generated via GPT-4 (better context understanding than 3.5)
- Cost: ~$0.10-0.20 per question set generation
- Cache frequently used question templates by relationship + generation
- Allow users to edit, reorder, or add custom questions
- Track which questions were actually asked (for future analytics)

### Future Enhancements (Phase 3+)
- Multi-session interview support with progressive questioning
- Adaptive questioning based on previous session transcripts
- Photo/artifact integration ("Tell me about this photo...")
- Collaborative question building (family members suggest questions)

## Job Queue Architecture

### Why Job Queue is Critical

Audio transcription, narrative generation, and audiobook creation are **long-running operations** (30 seconds to 5+ minutes) that **cannot** be handled synchronously. A job queue system is essential for:

1. **Preventing timeout errors** - API routes typically timeout after 10-30 seconds
2. **User experience** - Users can navigate away and be notified when jobs complete
3. **Reliability** - Automatic retries on failure, error handling
4. **Scalability** - Process multiple jobs concurrently
5. **Cost management** - Track and optimize expensive AI API calls

### Technology Choice: Inngest

**Why Inngest over alternatives:**
- **Vercel-optimized**: Built specifically for serverless Next.js deployments
- **Zero infrastructure**: No separate queue server to manage
- **Built-in retries**: Automatic exponential backoff
- **Type-safe**: Full TypeScript support
- **Local dev**: Works in development without cloud services
- **Free tier**: 1000 hours/month (enough for MVP)

**Alternatives considered:**
- BullMQ: Requires Redis (additional infrastructure cost)
- Trigger.dev: Similar to Inngest, but less mature
- AWS SQS: More complex setup, not serverless-friendly

### Job Types

```typescript
// Job type definitions
enum JobType {
  GENERATE_QUESTIONS = 'generate_questions',
  TRANSCRIBE_AUDIO = 'transcribe_audio',
  GENERATE_NARRATIVE = 'generate_narrative',
  CREATE_AUDIOBOOK = 'create_audiobook', // Post-MVP
  SEND_NOTIFICATION = 'send_notification'
}
```

### Job Implementations

#### 1. Generate Questions Job

```typescript
export const generateQuestions = inngest.createFunction(
  { id: 'generate-questions', retries: 2 },
  { event: 'interview/questions.generate' },
  async ({ event, step }) => {
    const { projectId, intervieweeData } = event.data;

    // Step 1: Generate questions via GPT-4
    const questions = await step.run('generate-questions', async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [/* prompt template */],
      });
    });

    // Step 2: Save to database
    await step.run('save-questions', async () => {
      return await db.interviewQuestion.createMany({
        data: questions.map((q, i) => ({
          projectId,
          question: q.question,
          category: q.category,
          order: i,
          // ...
        }))
      });
    });

    // Step 3: Update project status
    await step.run('update-project', async () => {
      return await db.project.update({
        where: { id: projectId },
        data: { status: 'questions_generated' }
      });
    });

    // Step 4: Send notification
    await step.sendEvent('send-notification', {
      name: 'notification/email.send',
      data: { projectId, type: 'questions_ready' }
    });
  }
);
```

#### 2. Transcribe Audio Job

```typescript
export const transcribeAudio = inngest.createFunction(
  { id: 'transcribe-audio', retries: 3 },
  { event: 'interview/audio.transcribe' },
  async ({ event, step }) => {
    const { sessionId, audioFileKey } = event.data;

    // Step 1: Download audio from S3 (if needed) or get URL
    const audioUrl = await step.run('get-audio-url', async () => {
      return await s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: audioFileKey,
        Expires: 3600
      });
    });

    // Step 2: Chunk large files if >25MB
    const chunks = await step.run('chunk-audio', async () => {
      const fileSize = await getFileSize(audioFileKey);
      if (fileSize > 25 * 1024 * 1024) {
        return await chunkAudioFile(audioUrl);
      }
      return [audioUrl];
    });

    // Step 3: Transcribe each chunk
    const transcriptions = await step.run('transcribe-chunks', async () => {
      return await Promise.all(
        chunks.map(chunk =>
          openai.audio.transcriptions.create({
            file: chunk,
            model: 'whisper-1',
            response_format: 'verbose_json'
          })
        )
      );
    });

    // Step 4: Combine and save transcription
    await step.run('save-transcription', async () => {
      const fullText = transcriptions.map(t => t.text).join('\n');
      return await db.transcription.create({
        data: {
          sessionId,
          text: fullText,
          accuracy: calculateAccuracy(transcriptions),
          wordTimings: combineWordTimings(transcriptions)
        }
      });
    });

    // Step 5: Update project status
    await step.run('update-project', async () => {
      const session = await db.interviewSession.findUnique({
        where: { id: sessionId },
        select: { projectId: true }
      });
      return await db.project.update({
        where: { id: session.projectId },
        data: { status: 'transcription_complete' }
      });
    });

    // Step 6: Send notification
    await step.sendEvent('send-notification', {
      name: 'notification/email.send',
      data: { sessionId, type: 'transcription_ready' }
    });
  }
);
```

#### 3. Generate Narrative Job

```typescript
export const generateNarrative = inngest.createFunction(
  { id: 'generate-narrative', retries: 2 },
  { event: 'interview/narrative.generate' },
  async ({ event, step }) => {
    const { projectId, style } = event.data;

    // Step 1: Get transcription
    const transcription = await step.run('get-transcription', async () => {
      return await db.transcription.findFirst({
        where: {
          session: { projectId }
        }
      });
    });

    // Step 2: Cleanup transcription (remove filler words)
    const cleanedText = await step.run('cleanup-text', async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'Remove filler words and fix grammar while preserving meaning and voice.'
        }, {
          role: 'user',
          content: transcription.text
        }]
      });
    });

    // Step 3: Structure narrative (identify themes/chapters)
    const structure = await step.run('structure-narrative', async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'Identify key themes and create chapter structure from this life story interview.'
        }, {
          role: 'user',
          content: cleanedText.choices[0].message.content
        }]
      });
    });

    // Step 4: Generate final narrative
    const narrative = await step.run('generate-narrative', async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `Convert this interview into a ${style} narrative while maintaining the speaker's authentic voice.`
        }, {
          role: 'user',
          content: cleanedText.choices[0].message.content
        }],
        temperature: 0.7
      });
    });

    // Step 5: Save narrative
    await step.run('save-narrative', async () => {
      const content = narrative.choices[0].message.content;
      return await db.narrative.create({
        data: {
          projectId,
          content,
          structure: JSON.parse(structure.choices[0].message.content),
          wordCount: content.split(/\s+/).length,
          version: 1,
          status: 'draft'
        }
      });
    });

    // Step 6: Update project status
    await step.run('update-project', async () => {
      return await db.project.update({
        where: { id: projectId },
        data: { status: 'narrative_complete' }
      });
    });

    // Step 7: Send notification
    await step.sendEvent('send-notification', {
      name: 'notification/email.send',
      data: { projectId, type: 'narrative_ready' }
    });
  }
);
```

### Progress Tracking

Jobs emit progress events for real-time UI updates:

```typescript
// In job function:
await step.run('transcribe', async () => {
  for (let i = 0; i < chunks.length; i++) {
    // Update progress
    await inngest.send({
      name: 'job/progress.update',
      data: {
        jobId,
        progress: Math.round((i / chunks.length) * 100),
        message: `Processing chunk ${i + 1} of ${chunks.length}`
      }
    });

    // Process chunk
    await transcribeChunk(chunks[i]);
  }
});
```

### Error Handling & Retries

**Retry Strategy:**
- Exponential backoff: 1s, 2s, 4s delays
- Max 3 retries for API calls
- Permanent failures logged to Sentry

**Error Types:**
- **Transient** (retry): Network errors, API rate limits, timeouts
- **Permanent** (fail): Invalid audio format, insufficient credits, malformed data

```typescript
export const transcribeAudio = inngest.createFunction(
  {
    id: 'transcribe-audio',
    retries: 3,
    onFailure: async ({ error, event }) => {
      // Log to Sentry
      Sentry.captureException(error, {
        tags: { jobType: 'transcribe_audio' },
        extra: { sessionId: event.data.sessionId }
      });

      // Update job status
      await db.job.update({
        where: { id: event.data.jobId },
        data: {
          status: 'failed',
          error: error.message
        }
      });

      // Notify user
      await sendErrorNotification(event.data.sessionId, error);
    }
  },
  // ... rest of function
);
```

### Cost Tracking

Track AI API costs per job:

```typescript
await step.run('track-cost', async () => {
  const tokensUsed = response.usage.total_tokens;
  const cost = (tokensUsed / 1000) * 0.01; // GPT-4 pricing

  await db.job.update({
    where: { id: jobId },
    data: {
      output: {
        ...output,
        tokensUsed,
        cost
      }
    }
  });
});
```

### Local Development

Inngest Dev Server for local testing:

```bash
# Terminal 1: Run Inngest dev server
npx inngest-cli@latest dev

# Terminal 2: Run Next.js
npm run dev
```

### Production Deployment

1. Sign up for Inngest Cloud (free tier)
2. Add webhook URL to Vercel environment variables
3. Deploy - Inngest automatically discovers functions

**Environment Variables:**
```
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key
```

## State Machine & Workflow

### Project Status States

```typescript
enum ProjectStatus {
  DRAFT = 'draft',
  RECORDING_INFO = 'recording_info',
  QUESTIONS_GENERATED = 'questions_generated',
  AUDIO_UPLOADED = 'audio_uploaded',
  TRANSCRIBING = 'transcribing',
  TRANSCRIPTION_COMPLETE = 'transcription_complete',
  GENERATING_NARRATIVE = 'generating_narrative',
  NARRATIVE_COMPLETE = 'narrative_complete',
  COMPLETE = 'complete',
  ERROR = 'error'
}
```

### State Transition Diagram

```
DRAFT
  ↓ (user adds interviewee info)
RECORDING_INFO
  ↓ (AI generates questions)
QUESTIONS_GENERATED
  ↓ (user uploads audio)
AUDIO_UPLOADED
  ↓ (transcription job starts)
TRANSCRIBING
  ↓ (transcription completes)
TRANSCRIPTION_COMPLETE
  ↓ (narrative generation starts)
GENERATING_NARRATIVE
  ↓ (narrative ready)
NARRATIVE_COMPLETE
  ↓ (user finalizes)
COMPLETE

(any state) → ERROR (on failure)
ERROR → (previous state) (on retry)
```

### Valid State Transitions

```typescript
const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [
    ProjectStatus.RECORDING_INFO,
    ProjectStatus.ERROR
  ],
  [ProjectStatus.RECORDING_INFO]: [
    ProjectStatus.DRAFT, // allow going back to edit
    ProjectStatus.QUESTIONS_GENERATED,
    ProjectStatus.ERROR
  ],
  [ProjectStatus.QUESTIONS_GENERATED]: [
    ProjectStatus.RECORDING_INFO, // allow regenerating questions
    ProjectStatus.AUDIO_UPLOADED,
    ProjectStatus.ERROR
  ],
  [ProjectStatus.AUDIO_UPLOADED]: [
    ProjectStatus.TRANSCRIBING,
    ProjectStatus.ERROR
  ],
  [ProjectStatus.TRANSCRIBING]: [
    ProjectStatus.TRANSCRIPTION_COMPLETE,
    ProjectStatus.ERROR
  ],
  [ProjectStatus.TRANSCRIPTION_COMPLETE]: [
    ProjectStatus.GENERATING_NARRATIVE,
    ProjectStatus.AUDIO_UPLOADED, // allow re-upload
    ProjectStatus.ERROR
  ],
  [ProjectStatus.GENERATING_NARRATIVE]: [
    ProjectStatus.NARRATIVE_COMPLETE,
    ProjectStatus.ERROR
  ],
  [ProjectStatus.NARRATIVE_COMPLETE]: [
    ProjectStatus.COMPLETE,
    ProjectStatus.GENERATING_NARRATIVE, // allow regeneration
    ProjectStatus.ERROR
  ],
  [ProjectStatus.COMPLETE]: [
    ProjectStatus.NARRATIVE_COMPLETE, // allow edits after completion
  ],
  [ProjectStatus.ERROR]: [
    // Can retry from error to previous state
    // Determined dynamically based on error context
  ]
};
```

### Transition Validation

```typescript
// Middleware to validate state transitions
export async function validateStatusTransition(
  projectId: string,
  newStatus: ProjectStatus
): Promise<{ valid: boolean; error?: string }> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { status: true }
  });

  if (!project) {
    return { valid: false, error: 'Project not found' };
  }

  const currentStatus = project.status as ProjectStatus;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid transition from ${currentStatus} to ${newStatus}`
    };
  }

  return { valid: true };
}

// API route usage
export async function PATCH_updateProjectStatus(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { status } = req.body;

  const validation = await validateStatusTransition(id as string, status);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const updated = await db.project.update({
    where: { id: id as string },
    data: { status }
  });

  return res.status(200).json({ data: updated });
}
```

### UI Implications

**Status-based UI rendering:**

```typescript
// What user can do based on current status
function getAvailableActions(status: ProjectStatus): Action[] {
  switch (status) {
    case ProjectStatus.DRAFT:
      return [{ label: 'Add Interviewee Info', action: 'addInterviewee' }];

    case ProjectStatus.RECORDING_INFO:
      return [
        { label: 'Generate Questions', action: 'generateQuestions' },
        { label: 'Edit Info', action: 'editInterviewee' }
      ];

    case ProjectStatus.QUESTIONS_GENERATED:
      return [
        { label: 'Upload Audio', action: 'uploadAudio' },
        { label: 'Edit Questions', action: 'editQuestions' },
        { label: 'Regenerate Questions', action: 'regenerateQuestions' }
      ];

    case ProjectStatus.AUDIO_UPLOADED:
      return [{ label: 'Start Transcription', action: 'startTranscription' }];

    case ProjectStatus.TRANSCRIBING:
      return []; // No actions during processing

    case ProjectStatus.TRANSCRIPTION_COMPLETE:
      return [
        { label: 'Generate Narrative', action: 'generateNarrative' },
        { label: 'View Transcription', action: 'viewTranscription' },
        { label: 'Re-upload Audio', action: 'reuploadAudio' }
      ];

    case ProjectStatus.GENERATING_NARRATIVE:
      return []; // No actions during processing

    case ProjectStatus.NARRATIVE_COMPLETE:
      return [
        { label: 'Edit Narrative', action: 'editNarrative' },
        { label: 'Download PDF', action: 'downloadPDF' },
        { label: 'Finalize Project', action: 'finalizeProject' },
        { label: 'Regenerate Narrative', action: 'regenerateNarrative' }
      ];

    case ProjectStatus.COMPLETE:
      return [
        { label: 'Download PDF', action: 'downloadPDF' },
        { label: 'Share', action: 'share' },
        { label: 'Edit Narrative', action: 'editNarrative' }
      ];

    case ProjectStatus.ERROR:
      return [
        { label: 'View Error Details', action: 'viewError' },
        { label: 'Retry', action: 'retry' },
        { label: 'Contact Support', action: 'support' }
      ];

    default:
      return [];
  }
}
```

### Progress Indicator

**Visual progress tracking:**

```typescript
const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  [ProjectStatus.DRAFT]: 0,
  [ProjectStatus.RECORDING_INFO]: 10,
  [ProjectStatus.QUESTIONS_GENERATED]: 25,
  [ProjectStatus.AUDIO_UPLOADED]: 40,
  [ProjectStatus.TRANSCRIBING]: 50,
  [ProjectStatus.TRANSCRIPTION_COMPLETE]: 65,
  [ProjectStatus.GENERATING_NARRATIVE]: 75,
  [ProjectStatus.NARRATIVE_COMPLETE]: 90,
  [ProjectStatus.COMPLETE]: 100,
  [ProjectStatus.ERROR]: -1 // Special handling
};

// Component
function ProjectProgressBar({ status }: { status: ProjectStatus }) {
  const progress = STATUS_PROGRESS[status];

  if (progress === -1) {
    return <ErrorIndicator />;
  }

  return (
    <ProgressBar
      value={progress}
      label={getStatusLabel(status)}
      showPercentage
    />
  );
}
```

### Error State Handling

```typescript
// Store error context for recovery
interface ProjectError {
  status: ProjectStatus; // Status when error occurred
  previousStatus: ProjectStatus; // Where to return on retry
  errorType: 'transient' | 'permanent';
  errorMessage: string;
  errorDetails: Record<string, any>;
  occurredAt: Date;
}

// Example: Handling transcription failure
async function handleTranscriptionError(
  projectId: string,
  error: Error
) {
  await db.project.update({
    where: { id: projectId },
    data: {
      status: ProjectStatus.ERROR,
      errorContext: {
        status: ProjectStatus.TRANSCRIBING,
        previousStatus: ProjectStatus.AUDIO_UPLOADED,
        errorType: isTransientError(error) ? 'transient' : 'permanent',
        errorMessage: error.message,
        errorDetails: { /* ... */ },
        occurredAt: new Date()
      }
    }
  });
}

// Retry logic
async function retryFromError(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId }
  });

  const { previousStatus } = project.errorContext as ProjectError;

  // Return to previous status and retry operation
  await db.project.update({
    where: { id: projectId },
    data: { status: previousStatus }
  });

  // Trigger appropriate job based on previousStatus
  if (previousStatus === ProjectStatus.AUDIO_UPLOADED) {
    await triggerTranscriptionJob(projectId);
  }
  // ... etc
}
```

### Time Estimates by Status

Provide users with realistic completion time estimates:

```typescript
const ESTIMATED_DURATION: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Just getting started',
  [ProjectStatus.RECORDING_INFO]: '2-3 minutes to complete',
  [ProjectStatus.QUESTIONS_GENERATED]: 'Ready to upload audio',
  [ProjectStatus.AUDIO_UPLOADED]: 'Ready to start processing',
  [ProjectStatus.TRANSCRIBING]: '3-5 minutes remaining',
  [ProjectStatus.TRANSCRIPTION_COMPLETE]: 'Ready to generate narrative',
  [ProjectStatus.GENERATING_NARRATIVE]: '2-3 minutes remaining',
  [ProjectStatus.NARRATIVE_COMPLETE]: 'Almost done!',
  [ProjectStatus.COMPLETE]: 'Project complete',
  [ProjectStatus.ERROR]: 'Needs attention'
};
```

## Security & Privacy

Family stories contain highly personal and sensitive information. Security and privacy are paramount.

### Data Protection Requirements

#### 1. Encryption

**At Rest:**
- Database encryption via Neon (AES-256)
- S3 server-side encryption (SSE-S3 or SSE-KMS)
- Encrypted database backups

```typescript
// S3 upload with encryption
const s3 = new S3Client({
  region: process.env.AWS_REGION
});

const presignedUrl = await getSignedUrl(s3, new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: fileKey,
  ServerSideEncryption: 'AES256', // Enable encryption
  ContentType: 'audio/*'
}), { expiresIn: 3600 });
```

**In Transit:**
- HTTPS only (enforce SSL/TLS)
- Secure WebSocket connections (WSS) for real-time updates
- Certificate pinning for API calls

```typescript
// Next.js middleware to enforce HTTPS
export function middleware(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto');

  if (proto !== 'https' && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(
      `https://${req.headers.get('host')}${req.nextUrl.pathname}`,
      301
    );
  }

  return NextResponse.next();
}
```

#### 2. Authentication & Authorization

**User Authentication:**
- NextAuth.js with secure session management
- Email/password with bcrypt hashing (cost factor: 12)
- Optional: OAuth providers (Google, GitHub) for Phase 2
- Session tokens with 30-day expiration
- Secure cookie attributes (httpOnly, secure, sameSite)

**Authorization:**
- Row-level security: Users can only access their own projects
- API route protection middleware
- Admin roles for future support features

```typescript
// Authorization middleware
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = session.user;
  next();
}

// Project ownership verification
export async function requireProjectOwnership(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const { id } = req.query;
  const project = await db.project.findUnique({
    where: { id: id as string },
    select: { userId: true }
  });

  if (!project || project.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}
```

#### 3. Data Retention & Deletion

**Retention Policy:**
- Active projects: Retained indefinitely while user account active
- Completed projects: Available for download for 90 days
- Audio files: Deleted 30 days after transcription completes (user can opt to keep)
- Deleted projects: Soft delete with 30-day recovery window, then permanent deletion

**User Rights (GDPR/CCPA Compliance):**
- **Right to access**: Export all user data as JSON
- **Right to deletion**: Permanent deletion of all user data
- **Right to portability**: Download projects as ZIP (narrative PDF + audio files)

```typescript
// Data export
export async function exportUserData(userId: string) {
  const data = await db.user.findUnique({
    where: { id: userId },
    include: {
      projects: {
        include: {
          interviewee: true,
          questions: true,
          sessions: {
            include: { transcription: true }
          },
          narrative: true,
          jobs: true
        }
      },
      payments: true
    }
  });

  return {
    format: 'json',
    data,
    generatedAt: new Date().toISOString()
  };
}

// Permanent deletion
export async function deleteUserData(userId: string) {
  await db.$transaction(async (tx) => {
    // Delete S3 files
    const projects = await tx.project.findMany({
      where: { userId },
      include: { sessions: true, narrative: { include: { audiobook: true } } }
    });

    for (const project of projects) {
      for (const session of project.sessions) {
        await deleteFromS3(session.audioFileKey);
      }
      if (project.narrative?.audiobook) {
        await deleteFromS3(project.narrative.audiobook.audioFileKey);
      }
    }

    // Delete database records (cascade delete)
    await tx.user.delete({ where: { id: userId } });
  });

  // Log deletion for audit trail
  await logAuditEvent({
    action: 'USER_DATA_DELETED',
    userId,
    timestamp: new Date()
  });
}
```

#### 4. Access Control for Audio Files

**S3 Security:**
- Private buckets (no public access)
- Presigned URLs with short expiration (1 hour)
- CORS configuration for Next.js domain only
- Bucket policies restrict access to authorized API roles

```typescript
// S3 bucket policy (Terraform/CloudFormation)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::family-stories-audio/*",
      "Condition": {
        "Bool": { "aws:SecureTransport": "false" }
      }
    }
  ]
}

// Generate download URL
export async function getAudioDownloadUrl(
  sessionId: string,
  userId: string
): Promise<string> {
  // Verify ownership
  const session = await db.interviewSession.findFirst({
    where: {
      id: sessionId,
      project: { userId }
    }
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  // Generate presigned URL (1 hour expiration)
  return await getSignedUrl(s3, new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: session.audioFileKey
  }), { expiresIn: 3600 });
}
```

### Privacy Compliance

#### GDPR (EU Users)

**Requirements:**
- Cookie consent banner (for analytics cookies)
- Privacy policy clearly stating data usage
- Terms of service with data processing agreements
- DPA (Data Processing Agreement) for B2B customers

**Implementation:**
```typescript
// Cookie consent component
export function CookieConsent() {
  const [consent, setConsent] = useLocalStorage('cookie-consent', null);

  if (consent !== null) return null;

  return (
    <Banner>
      <p>We use cookies for analytics and to improve your experience.</p>
      <Button onClick={() => {
        setConsent(true);
        initializeAnalytics(); // Only after consent
      }}>
        Accept
      </Button>
      <Button onClick={() => setConsent(false)}>
        Decline
      </Button>
    </Banner>
  );
}
```

#### CCPA (California Users)

**Requirements:**
- "Do Not Sell My Personal Information" link
- Right to know what data is collected
- Right to delete data
- Non-discrimination for exercising rights

### Security Best Practices

#### 1. Input Validation & Sanitization

```typescript
import { z } from 'zod';

// Validate all API inputs
const createProjectSchema = z.object({
  title: z.string().min(1).max(200).trim(),
});

const createIntervieweeSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  relationship: z.enum(['parent', 'grandparent', 'friend', 'other']),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  topics: z.array(z.string()).max(10)
});

// Use in API routes
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = createProjectSchema.parse(body); // Throws if invalid
  // ... proceed with validated data
}
```

#### 2. Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... process request
}
```

#### 3. SQL Injection Prevention

Prisma ORM provides protection by default via parameterized queries:

```typescript
// SAFE - Prisma handles escaping
await db.project.findMany({
  where: { userId: userId } // Automatically parameterized
});

// UNSAFE - Never do this
await db.$queryRaw(`SELECT * FROM projects WHERE userId = ${userId}`); // ❌

// SAFE alternative if raw SQL needed
await db.$queryRaw`SELECT * FROM projects WHERE userId = ${userId}`; // ✅
```

#### 4. XSS Prevention

- React automatically escapes output (XSS protection by default)
- Use `dangerouslySetInnerHTML` only with sanitized content
- Sanitize user-generated narrative content before rendering

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user-edited narrative
const sanitized = DOMPurify.sanitize(userContent, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: []
});
```

#### 5. CSRF Protection

NextAuth.js provides built-in CSRF protection. For custom forms:

```typescript
// Next.js automatically includes CSRF tokens in forms
<form method="post" action="/api/projects">
  {/* CSRF token auto-included by Next.js */}
</form>
```

### Audit Logging

Log security-relevant events for compliance and debugging:

```typescript
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

async function logAuditEvent(event: Omit<AuditLog, 'timestamp'>) {
  await db.auditLog.create({
    data: {
      ...event,
      timestamp: new Date()
    }
  });
}

// Usage examples
await logAuditEvent({
  userId: user.id,
  action: 'PROJECT_CREATED',
  resource: 'project',
  resourceId: project.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});

await logAuditEvent({
  userId: user.id,
  action: 'DATA_EXPORTED',
  resource: 'user_data',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

### Third-Party Service Security

**OpenAI API:**
- Never log full prompts/responses (may contain PII)
- Use API key rotation
- Monitor usage for anomalies

**Stripe:**
- Never store raw credit card numbers
- Use Stripe's hosted checkout or Elements
- Webhook signature verification

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    // Process event
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

## Cost Analysis

### Per-Project Cost Breakdown (MVP)

| Service | Operation | Unit Cost | Typical Usage | Project Cost |
|---------|-----------|-----------|---------------|--------------|
| **OpenAI Whisper** | Audio transcription | $0.006/min | 60 min interview | $0.36 |
| **OpenAI GPT-4** | Question generation | $0.01/1K input + $0.03/1K output | ~5K tokens | $0.20 |
| **OpenAI GPT-4** | Transcription cleanup | $0.01/1K input + $0.03/1K output | ~15K tokens | $0.60 |
| **OpenAI GPT-4** | Narrative structuring | $0.01/1K input + $0.03/1K output | ~15K tokens | $0.60 |
| **OpenAI GPT-4** | Narrative generation | $0.01/1K input + $0.03/1K output | ~20K tokens | $0.80 |
| **AWS S3** | Storage (audio + backups) | $0.023/GB/month | 500MB × 1 month | $0.01 |
| **AWS S3** | Data transfer | $0.09/GB | 500MB upload + download | $0.09 |
| **Resend** | Email notifications | $0.001/email | 5 emails | $0.01 |
| **Inngest** | Job execution time | Free tier | ~15 min total | $0.00 |
| **Vercel** | Hosting/bandwidth | Hobby plan | N/A | $0.00 |
| **Neon** | Database | Free tier | N/A | $0.00 |
| **Total MVP Cost** | | | | **$2.67** |

### Post-MVP Costs (Phase 2-3)

| Service | Operation | Unit Cost | Typical Usage | Project Cost |
|---------|-----------|-----------|---------------|--------------|
| **OpenAI TTS** | Standard audiobook | $0.015/1K chars | 20K words = ~120K chars | $1.80 |
| **ElevenLabs** | Voice cloning setup | $5.00 | One-time per voice | $5.00 |
| **ElevenLabs** | Voice-cloned audiobook | $0.30/1K chars | 20K words = ~120K chars | $36.00 |
| **Total with Standard TTS** | | | | **$4.47** |
| **Total with Voice Cloning** | | | | **$43.67** |

### Revenue Model vs. COGS

**MVP Pricing:**
- Written narrative only: **$49-99** → Margin: **$46-96** (94-97%)
- With standard TTS audiobook: **$79-129** → Margin: **$75-125** (95-97%)

**Post-MVP Pricing:**
- Voice-cloned audiobook upgrade: **+$50-100** → Margin: **$6-56** (12-56%)

**Target Metrics:**
- MVP: 50-100 projects × $75 avg = **$3,750-7,500 revenue**
- COGS: 75 projects × $2.67 = **$200**
- Gross margin: **97%**
- Other costs: Vercel Pro ($20/mo), Neon Pro ($19/mo), Inngest Pro ($20/mo if exceeded), Stripe fees (2.9% + $0.30)

### Cost Optimization Strategies

1. **Batch processing**: Combine multiple API calls where possible
2. **Caching**: Cache question templates by relationship + generation
3. **Model selection**: Use GPT-3.5-Turbo for simpler tasks (4x cheaper)
4. **Compression**: Compress audio before upload (reduce S3 costs)
5. **Lifecycle policies**: S3 auto-delete old audio after 30 days
6. **Token optimization**: Trim whitespace, use concise prompts

### Scaling Costs (Year 1 Projection)

| Month | Projects | COGS | Infrastructure | Stripe Fees | Total Costs | Revenue | Profit |
|-------|----------|------|----------------|-------------|-------------|---------|---------|
| 1-2 | 10 | $27 | $60 | $25 | $112 | $750 | $638 |
| 3-4 | 25 | $67 | $60 | $65 | $192 | $1,875 | $1,683 |
| 5-6 | 50 | $134 | $60 | $131 | $325 | $3,750 | $3,425 |
| 7-12 | 100/mo | $267/mo | $60 | $262 | $589/mo | $7,500/mo | $6,911/mo |
| **Year 1 Total** | **~500** | **$1,869** | **$720** | **$1,310** | **$3,899** | **$37,500** | **$33,601** |

*Assumes $75 average project price, 90% margin maintained*

## Performance Requirements

### Service Level Objectives (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | <500ms (p95) | 95th percentile of all API calls |
| **Uptime** | 99.5% | Monthly uptime percentage |
| **Transcription Time** | <5 min for 60min audio | Time from job start to completion |
| **Narrative Generation** | <2 min | Time from job start to completion |
| **Page Load Time** | <2s (p95) | Time to interactive on 4G connection |
| **Error Rate** | <5% | Percentage of failed requests |

### Performance Benchmarks by Operation

#### 1. Audio Upload
- **Target**: 500MB upload in <5 minutes on 10 Mbps connection
- **Implementation**: Direct S3 upload with presigned URLs
- **Monitoring**: Track upload failures, retry rates

#### 2. Transcription (Whisper API)
- **Whisper API**: ~1:1 processing ratio (60min audio = ~60sec processing)
- **With chunking**: +30% overhead for large files
- **Target**: 60min audio transcribed in <3 minutes
- **Bottleneck**: API rate limits (50 requests/min)

```typescript
// Parallel chunking for large files
async function transcribeLargeFile(audioUrl: string) {
  const chunks = await splitAudio(audioUrl, 25 * 1024 * 1024); // 25MB chunks

  // Process chunks in parallel (respecting rate limits)
  const transcriptions = await pMap(
    chunks,
    async (chunk) => await whisper.transcribe(chunk),
    { concurrency: 3 } // Max 3 concurrent requests
  );

  return combineTranscriptions(transcriptions);
}
```

#### 3. Narrative Generation (GPT-4)
- **GPT-4 latency**: ~20-60 seconds for 20K tokens
- **Multi-phase approach**: 3 LLM calls = ~3 minutes total
- **Target**: <2 minutes end-to-end
- **Optimization**: Use streaming for real-time updates

```typescript
// Stream narrative generation
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [/* ... */],
  stream: true
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || '';
  await updateNarrativeProgress(projectId, delta); // Real-time UI update
}
```

#### 4. Database Query Performance
- **Target**: <100ms for 95% of queries
- **Indexes**: Critical paths (userId, projectId, status)
- **Connection pooling**: Prisma connection pool (10-20 connections)

```typescript
// Optimized project fetch with includes
const project = await db.project.findUnique({
  where: { id: projectId },
  include: {
    interviewee: true,
    questions: { orderBy: { order: 'asc' } },
    sessions: {
      include: { transcription: true },
      orderBy: { createdAt: 'desc' }
    },
    narrative: true,
    jobs: {
      where: { status: { in: ['pending', 'running'] } },
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

### Caching Strategy

```typescript
// Next.js Route Handlers with caching
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  // Cache project data for 60 seconds
  const project = await unstable_cache(
    async () => await getProject(id),
    [`project-${id}`],
    { revalidate: 60, tags: [`project-${id}`] }
  )();

  return NextResponse.json({ data: project });
}

// Invalidate cache on update
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();

  await updateProject(id);

  // Invalidate cache
  revalidateTag(`project-${id}`);

  return NextResponse.json({ success: true });
}
```

### Monitoring & Alerts

**Sentry Configuration:**
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1, // 10% of profiling
  beforeSend(event) {
    // Remove PII from error reports
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    return event;
  }
});
```

**PostHog Analytics:**
```typescript
// Track key user actions
posthog.capture('project_created', {
  userId: user.id,
  projectId: project.id
});

posthog.capture('transcription_completed', {
  projectId: project.id,
  duration: session.duration,
  processingTime: job.completedAt - job.startedAt
});

posthog.capture('narrative_generated', {
  projectId: project.id,
  wordCount: narrative.wordCount,
  generationTime: job.completedAt - job.startedAt
});
```

**Custom Performance Monitoring:**
```typescript
// Track job performance
async function trackJobPerformance(
  jobId: string,
  fn: () => Promise<any>
) {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    await db.job.update({
      where: { id: jobId },
      data: {
        completedAt: new Date(),
        output: {
          ...result,
          performanceMs: duration
        }
      }
    });

    // Log to analytics
    posthog.capture('job_completed', {
      jobId,
      duration,
      type: job.type
    });

    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { jobId, jobType: job.type }
    });
    throw error;
  }
}
```

## User Stories
**Story:** As a user, I want the AI to guide me with structured questions so that I can conduct meaningful interviews without prior experience.

**Priority:** P0

**Acceptance Criteria:**
- [ ] System generates initial questions based on user input
- [ ] AI adapts follow-up questions based on conversation tone
- [ ] Questions are contextually relevant and emotionally resonant

**Dependencies:** None

**Estimated Complexity:** Medium

### User Story 2: Audio Transcription
**Story:** As a user, I want my recorded interviews to be accurately transcribed so that I can easily create a written narrative.

**Priority:** P0

**Acceptance Criteria:**
- [ ] Accurate transcription of audio with a high degree of reliability
- [ ] Transcription is completed within a reasonable timeframe
- [ ] Text is formatted for easy narrative generation

**Dependencies:** Completion of audio recording upload

**Estimated Complexity:** Medium

### User Story 3: Narrative Generation
**Story:** As a user, I want the AI to generate a narrative from my interview transcripts so that I can preserve the story in written form.

**Priority:** P0

**Acceptance Criteria:**
- [ ] Narrative maintains coherence and emotional depth
- [ ] Users can edit the narrative post-generation for personal touch
- [ ] System provides a preview of the final narrative

**Dependencies:** Completion of transcription

**Estimated Complexity:** Medium

### User Story 4: Voice Cloning and Audiobook Creation
**Story:** As a user, I want to create an audiobook with my interviewee's voice so that the story feels personal and authentic.

**Priority:** P0

**Acceptance Criteria:**
- [ ] Voice cloning accurately replicates the interviewee's voice
- [ ] Audiobook is generated without noticeable audio artifacts
- [ ] Completed audiobook is shareable via multiple platforms

**Dependencies:** Completion of narrative generation

**Estimated Complexity:** Large

[Continue for all features from PRD - aim for 8-15 user stories total]

## Development Epics

### Epic 1: User Management
**Goal:** Enable user registration, authentication, and profile management

**User Stories Included:** US-1, US-2

**Tasks:**

#### Task 1.1: Implement User Registration
**Description:** Develop user registration feature with email verification

**Acceptance Criteria:**
- [ ] Users can create accounts with email and password
- [ ] Email verification is sent upon registration
- [ ] Successful registration redirects to the user dashboard

**Dependencies:** None

**Estimated Effort:** 8 hours

#### Task 1.2: Implement User Login
**Description:** Develop login functionality with session management

**Acceptance Criteria:**
- [ ] Users can log in with a valid email and password
- [ ] Session is maintained securely
- [ ] Users are redirected to dashboard after login

**Dependencies:** Completion of user registration

**Estimated Effort:** 6 hours

[Continue with all tasks for Epic 1]

### Epic 2: AI-Guided Interviews
**Goal:** Provide AI-driven interview guidance to users

**User Stories Included:** US-3, US-4

**Tasks:**

#### Task 2.1: Develop Question Generation Algorithm
**Description:** Create AI algorithm to generate initial interview questions

**Acceptance Criteria:**
- [ ] Algorithm generates questions based on user input
- [ ] Questions are contextually relevant

**Dependencies:** None

**Estimated Effort:** 12 hours

#### Task 2.2: Implement Real-Time Question Adaptation
**Description:** Enable AI to adapt questions during interviews

**Acceptance Criteria:**
- [ ] AI suggests follow-up questions dynamically
- [ ] Questions reflect the conversation's emotional tone

**Dependencies:** Completion of question generation algorithm

**Estimated Effort:** 10 hours

[Continue with all tasks for Epic 2]

### Epic 3: Transcription and Narrative Generation
**Goal:** Enable accurate transcription of audio and generation of narrative

**User Stories Included:** US-5, US-6

**Tasks:**

#### Task 3.1: Integrate Whisper API for Transcription
**Description:** Use Whisper API to transcribe audio recordings

**Acceptance Criteria:**
- [ ] Audio files are transcribed accurately
- [ ] Transcription results are returned promptly

**Dependencies:** Audio recording feature

**Estimated Effort:** 8 hours

#### Task 3.2: Develop Narrative Generation Module
**Description:** Build module to convert transcriptions into narratives

**Acceptance Criteria:**
- [ ] Narratives are coherent and emotionally engaging
- [ ] Users can preview and edit narratives

**Dependencies:** Completion of transcription tasks

**Estimated Effort:** 12 hours

[Continue with all tasks for Epic 3]

### Epic 4: Audiobook Creation
**Goal:** Enable users to create audiobooks with voice cloning

**User Stories Included:** US-7

**Tasks:**

#### Task 4.1: Integrate ElevenLabs for Voice Cloning
**Description:** Use ElevenLabs technology for voice cloning

**Acceptance Criteria:**
- [ ] Voice cloning replicates interviewee's voice accurately
- [ ] Audiobook quality meets user expectations

**Dependencies:** Completion of narrative generation

**Estimated Effort:** 16 hours

#### Task 4.2: Develop Audiobook Sharing Feature
**Description:** Implement functionality to share audiobooks

**Acceptance Criteria:**
- [ ] Audiobooks can be shared via email and social media
- [ ] Shared links maintain audiobook quality

**Dependencies:** Completion of audiobook creation

**Estimated Effort:** 8 hours

[Continue for all feature categories - typically 4-6 epics total]

### Epic 5: Technical Foundation
**Goal:** Establish technical infrastructure needed to support feature development

**Tasks:**
- Project initialization and framework setup
- Database schema design and migrations
- Authentication implementation
- Deployment pipeline and hosting setup
- Basic error handling and logging
- Environment configuration

[Be specific with tasks and acceptance criteria]

## Implementation Phases

### Phase 1: MVP - Foundation & Core Workflow (Weeks 1-3)

**Goal:** Deliver working end-to-end flow from interview questions to downloadable written narrative

**Epics:**
- User Authentication & Project Management
- Database Schema & API Routes
- File Upload Infrastructure
- Job Queue System (Inngest)

**Key Deliverables:**
- ✅ User registration/login with NextAuth.js
- ✅ Database schema with Prisma migrations
- ✅ Project CRUD operations
- ✅ S3 integration for file storage
- ✅ Inngest job queue setup
- ✅ Basic error handling & logging (Sentry)

**Exit Criteria:**
- [ ] Users can register, login, and create projects
- [ ] Database schema deployed to Neon
- [ ] S3 buckets configured with presigned URL generation
- [ ] Inngest local development working
- [ ] All API routes return appropriate responses

**Estimated Effort:** ~80-100 hours

---

### Phase 2: MVP - AI Features & Processing (Weeks 4-5)

**Goal:** Implement AI-powered question generation, transcription, and narrative creation

**Epics:**
- Interviewee Information Collection
- AI Question Generation
- Audio Transcription Pipeline
- Narrative Generation Pipeline

**Key Deliverables:**
- ✅ Interviewee profile form and storage
- ✅ GPT-4 question generation with templates
- ✅ Whisper API integration for transcription
- ✅ Audio chunking for large files
- ✅ Multi-phase narrative generation (cleanup → structure → narrative)
- ✅ Rich text editor for narrative editing (Tiptap or Lexical)
- ✅ PDF generation for download

**Exit Criteria:**
- [ ] AI generates contextually relevant questions based on interviewee profile
- [ ] 60-minute audio files transcribed in <5 minutes
- [ ] Narrative generation produces coherent, emotionally resonant stories
- [ ] Users can edit narratives and download as PDF
- [ ] Error handling and retries work correctly

**Estimated Effort:** ~100-120 hours

---

### Phase 3: MVP - Polish & Launch Prep (Week 6)

**Goal:** Production-ready application with payments, analytics, and user-facing polish

**Epics:**
- Stripe Payment Integration
- Analytics & Monitoring
- UI/UX Polish
- Security Hardening
- Testing & QA

**Key Deliverables:**
- ✅ Stripe checkout for project purchases
- ✅ PostHog analytics integration
- ✅ Responsive UI with shadcn/ui components
- ✅ Project status tracking UI
- ✅ Real-time progress updates (SSE)
- ✅ Email notifications (Resend)
- ✅ Privacy policy & terms of service
- ✅ GDPR/CCPA compliance features (data export/deletion)
- ✅ Comprehensive error messages
- ✅ Integration tests for critical paths

**Exit Criteria:**
- [ ] Payment flow tested with Stripe test mode
- [ ] Analytics tracking key user actions
- [ ] UI works on desktop and mobile
- [ ] Security audit passed (input validation, auth, HTTPS)
- [ ] 10 beta users complete full workflow successfully
- [ ] <5% error rate in production
- [ ] Privacy policy and ToS pages live

**Estimated Effort:** ~60-80 hours

---

### Phase 4: Post-MVP - Standard TTS Audiobooks (Weeks 7-9)

**Goal:** Add audiobook generation with standard TTS voices

**Features:**
- OpenAI TTS integration
- Audiobook player UI
- Download/share audiobooks
- Voice selection (multiple TTS voices)

**Exit Criteria:**
- [ ] Users can generate audiobooks from narratives
- [ ] Audiobook quality meets user expectations
- [ ] Audiobooks downloadable as MP3
- [ ] 20+ projects successfully generated audiobooks

**Estimated Effort:** ~40-60 hours

---

### Phase 5: Post-MVP - Voice Cloning Premium Feature (Weeks 10-12)

**Goal:** Add voice cloning as premium upgrade

**Features:**
- ElevenLabs voice cloning integration
- Premium pricing tier ($50-100 upgrade)
- Voice sample validation
- High-quality voice-cloned audiobook generation

**Exit Criteria:**
- [ ] Voice cloning produces natural-sounding results
- [ ] Users can preview voice before committing
- [ ] Premium upgrade funnel tested
- [ ] 5+ users successfully purchase voice cloning upgrades

**Estimated Effort:** ~60-80 hours

---

### Phase 6: Future Enhancements (Months 4-6)

**Features Under Consideration:**
- Multi-session interview support (continue where you left off)
- Real-time interview mode (AI suggests questions during recording)
- Collaborative editing (family members can contribute)
- Photo/video integration
- Speaker diarization (identify multiple speakers)
- Mobile app (React Native)
- Integration with genealogy platforms
- White-label solution for professional storytellers/journalists

**Prioritization:** Based on user feedback and engagement metrics from Phases 1-5

---

### Revised Timeline Summary

| Phase | Duration | Cumulative | Deliverable |
|-------|----------|------------|-------------|
| Phase 1 | 3 weeks | 3 weeks | Foundation & infrastructure |
| Phase 2 | 2 weeks | 5 weeks | AI features & processing |
| Phase 3 | 1 week | 6 weeks | **MVP Launch** 🚀 |
| Phase 4 | 3 weeks | 9 weeks | Standard TTS audiobooks |
| Phase 5 | 3 weeks | 12 weeks | Voice cloning premium |
| Phase 6 | Ongoing | - | Feature expansion |

**MVP Launch Target:** 6 weeks from start (vs. original 5 weeks, but with more realistic scope)

**Key Changes from Original Plan:**
- ❌ Removed voice cloning from MVP (moved to Phase 5)
- ✅ Added comprehensive job queue system (Inngest)
- ✅ Added proper security & privacy implementation
- ✅ Added state machine for workflow management
- ✅ Added cost tracking and optimization
- ✅ More realistic time estimates

**Success Metrics Post-MVP (First 3 Months):**
- 50-100 completed written narratives
- $3,750-7,500 in revenue
- 80%+ user satisfaction
- <5% error rate
- Average completion time <7 days
- 30%+ repeat usage rate

## Testing Strategy

### Unit Testing
- Core components like AI algorithms and transcription modules
- Testing framework: Jest with React Testing Library

### Integration Testing
- API endpoints and service integrations
- Verify user flows from interview to audiobook creation

### User Acceptance Testing
- Conduct with beta users to gather feedback
- Ensure ease of use and emotional resonance

## Deployment Plan

### Environments
- **Development:** Local setup for feature development
- **Staging:** Pre-production for integration testing
- **Production:** Live environment for end-users

### Deployment Process
1. Develop feature in local environment
2. Merge to staging for testing
3. Deploy to production after passing QA

### Rollback Plan
- Use Vercel's revert to previous deployment feature if issues occur

## Risk Assessment

### Technical Risks
- **Real-time AI processing challenges:** 
  - *Mitigation:* Prototype and test algorithms early

- **Voice cloning accuracy:**
  - *Mitigation:* Use proven ElevenLabs technology and conduct extensive testing

### Feature Risks
- **Complexity in AI question adaptation:**
  - *Mitigation:* Break down into smaller tasks, iterative testing with users

## Success Metrics

### Feature Adoption
- Number of completed projects per month
- User engagement in storytelling process

### Technical Metrics
- Transcription accuracy rate >95%
- Audiobook generation time <10 minutes

### User Satisfaction
- User testimonials and feedback
- Net promoter score (NPS) above 8

---

**Implementation Principles:**
1. **Feature-First:** Organize work around delivering complete user-facing features
2. **Incremental Delivery:** Build and test features incrementally
3. **User-Centric:** Prioritize user stories that deliver the most value
4. **Quality Bar:** Each feature should meet acceptance criteria before moving on
5. **Adaptability:** Be ready to adjust based on user feedback and technical discoveries