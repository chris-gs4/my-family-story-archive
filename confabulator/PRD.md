# Product Requirements Document

## Document Information
- Product Name: Mabel
- Tagline: Your Stories, Written with Care
- Version: 4.0
- Last Updated: 2026-02-28
- Status: Active

## Product Overview

Mabel is an AI-powered journaling app that helps people capture and preserve their life stories through guided voice recording and narrative generation. Named after its pixel-art grandmother mascot, Mabel acts as a warm, interactive companion — asking thoughtful questions, recording spoken answers, and transforming them into polished written narratives.

Using a unique **voice-first, module-based approach**, users build their personal story incrementally — speaking their answers one module at a time, with each module becoming a chapter in their story. The platform handles transcription, narrative writing, and compilation automatically.

The platform addresses a universal problem: everyone has a life story worth preserving, but few people ever write it down. Traditional journaling lacks structure, and the idea of "writing a book" feels overwhelming. Mabel reframes the experience from formal memoir-writing into **fun, guided voice journaling with a friendly AI companion**. Users simply:
- **Speak naturally** instead of writing — just tap record and talk
- **Build stories gradually** over weeks or months at their own pace
- **Let Mabel guide them** with AI questions that learn from previous answers
- **Rediscover memories** they'd forgotten through smart follow-up questions
- **Create chapter-by-chapter** written narratives that compile into a complete story
- **Preserve stories as text and audio**, with voice-cloned audiobooks planned for future phases

The target market includes anyone who wants to capture their personal life story — people approaching milestone ages, parents wanting to leave something for their children, individuals processing life experiences through reflection, or anyone who simply enjoys rediscovering old memories. A secondary market includes people gifting Mabel to loved ones via the Family Plan.

Mabel matters because it makes story preservation accessible and fun. The module architecture prevents overwhelm, the voice-first approach removes the barrier of writing, the gamification keeps users engaged, and the context-learning AI creates richer, more connected narratives than any blank journal could.

## Brand Identity

- **Name:** Mabel
- **Tagline:** Your Stories, Written with Care
- **Mascot:** Pixel-art grandmother character named Mabel — warm, encouraging, interactive
- **Brand assets location:** `wireframes/mabel assets/` (logo, square app icon, tagline)
- **Tone:** Warm, caring, approachable — like sitting down with a grandmother who genuinely wants to hear your story. Fun over formal.

## Objectives & Success Metrics

### Primary Objectives
1. Enable seamless capture and preservation of personal life stories through AI-guided voice journaling.
2. Ensure high user engagement through gamification and a delightful experience.
3. Validate product-market fit with early adopters through measurable engagement metrics.

### Key Performance Indicators (KPIs)
- **MVP Phase:** 50-100 completed written narratives within the first 6 months.
- **Revenue Target:** $10-20K from early adopters in the first year.
- **User Satisfaction:** Testimonials highlighting emotional impact and satisfaction with narrative quality.
- **Engagement:** Average time from project creation to completion <7 days.
- **Technical Quality:** <5% error rate in transcription and narrative generation.
- **Growth:** A growing waitlist driven by word-of-mouth referrals.
- **Post-MVP:** Number of audiobooks generated (standard TTS and voice cloning).

### Success Criteria for MVP Launch
- Successful completion and delivery of at least 50-100 paid projects.
- Positive user feedback on ease of use and emotional resonance.
- Achieving a repeat usage rate of 30% or more.

## User Personas

### Persona 1: Maya, The Memory Explorer
- **Demographics:** 38-year-old, married, two children, works as a product designer.
- **Background:** Maya has been thinking about writing down her life story for years but never starts because it feels like too big a project.
- **Goals and Motivations:** Wants to capture her childhood memories, career journey, and life lessons before they fade — both for herself and to pass on to her kids someday.
- **Pain Points and Frustrations:** Blank journals are intimidating. She doesn't know where to start. Writing feels like a chore. She'd rather just talk about her memories.
- **Success Scenario:** Uses Mabel to record her stories by voice during her commute. Mabel's questions help her remember things she'd forgotten. After a few weeks, she has a beautifully written personal memoir that she gifts to her parents on their anniversary.

### Persona 2: David, The Gift Giver
- **Demographics:** 52-year-old, wants to give his mom something meaningful for her 80th birthday.
- **Background:** David buys his mom a Mabel subscription so she can record her own life story at her own pace.
- **Goals and Motivations:** Give a meaningful, personal gift that produces a lasting keepsake for the whole family.
- **Pain Points and Frustrations:** Doesn't have the time or skills to interview his mom himself. Wants something she can do independently.
- **Success Scenario:** His mom uses the Family Plan, records her stories with Mabel's guidance over a couple months, and the family receives a beautiful written narrative of her life at the birthday celebration.

## Core Features

### Feature 1: Voice-First Guided Journaling
- **Description:** Users answer AI-generated questions by speaking into their device. Mabel records the audio, transcribes it, and transforms spoken answers into polished narrative prose. On iOS, native AAC recording provides high-quality audio; on web, WebM recording is used.
- **User Story:** As a user, I want to speak my answers instead of typing so that capturing my story feels natural and effortless.
- **Acceptance Criteria:**
  - Users can record audio answers by tapping a single button.
  - Recordings are automatically transcribed via Whisper API.
  - Transcripts are transformed into polished first-person narratives.
  - Native iOS recording uses AAC format; web uses WebM.
  - Haptic feedback on iOS for record start/stop.
- **Priority:** P0

### Feature 2: Module-Based Story Building
- **Description:** Users build their life story through discrete modules, each focusing on a specific theme or life stage. Each completed module becomes a chapter in the final story.
- **User Story:** As a user, I want to build my story in manageable chunks so that I don't feel overwhelmed and can work on it over time.
- **Acceptance Criteria:**
  - Users can create new modules with custom themes or topics.
  - Each module tracks progress through states (draft -> questions generated -> in progress -> chapter generated -> approved).
  - Users can see all modules and their completion status in a dashboard view.
  - Modules can be completed in any order and over any timeframe.
- **Priority:** P0

### Feature 3: Context-Learning AI Questions
- **Description:** Mabel generates personalized questions for each module. **Module 1** uses the user's life profile to generate foundational questions. **Subsequent modules** analyze previous answers to generate follow-up questions that dive deeper, explore connections, and fill narrative gaps.
- **User Story:** As a user, I want Mabel to ask increasingly relevant questions based on what I've already shared so that the conversation feels natural and helps me remember more.
- **Acceptance Criteria:**
  - Module 1 generates 15-20 questions based on user profile (life stage, topics of interest).
  - Modules 2+ analyze all previous responses to extract themes and keywords.
  - Questions in later modules reference and build upon earlier answers.
  - Users can answer questions over multiple sessions.
- **Priority:** P0

### Feature 4: Chapter Generation from Q&A
- **Description:** AI converts question-and-answer pairs (from transcribed audio or typed text) into cohesive narrative chapters with customizable tone and perspective.
- **User Story:** As a user, I want my responses transformed into a polished narrative chapter so that my story reads naturally.
- **Acceptance Criteria:**
  - Users can generate a chapter once 50%+ of module questions are answered.
  - Chapter generation supports person (1st/3rd), tone (warm/formal/conversational), and style (descriptive/concise/poetic).
  - Generated chapters maintain emotional depth and authentic voice.
  - Users can regenerate chapters with feedback ("make more emotional", "add more details").
  - System supports multiple chapter versions.
- **Priority:** P0

### Feature 5: Chapter Review & Editing
- **Description:** Users can review generated chapters, provide feedback for regeneration, or approve chapters for the final story.
- **User Story:** As a user, I want to review and refine each chapter before finalizing so that the narrative perfectly captures my story.
- **Acceptance Criteria:**
  - Users can read the full generated chapter.
  - Users can request regeneration with specific feedback.
  - Users can approve chapters to mark modules as complete.
  - Approved chapters are locked from further AI regeneration (manual editing only).
- **Priority:** P0

### Feature 6: Text-Based Response Collection
- **Description:** Users can also answer questions by typing responses directly, as an alternative to voice recording.
- **User Story:** As a user, I want the option to type my answers so that I can capture stories in quiet environments or when I prefer writing.
- **Acceptance Criteria:**
  - Users can view one question at a time with clear navigation.
  - Responses are auto-saved as users type.
  - Users can edit previous answers at any time.
  - Progress indicator shows how many questions have been answered.
- **Priority:** P0

### Feature 7: Module & Chapter State Management
- **Description:** Track each module's progress through defined workflow states to guide users through the story-building process.
- **User Story:** As a user, I want to see where each module is in the process so that I know what to do next.
- **Acceptance Criteria:**
  - Each module displays clear state: draft -> questions_generated -> in_progress -> generating_chapter -> chapter_generated -> approved.
  - Visual indicators show module completion status.
  - Users can only perform actions valid for the current module state.
  - Dashboard shows overall project progress (X of Y modules completed).
- **Priority:** P0

### Feature 8: Async Job Processing
- **Description:** Handle long-running operations (transcription, question generation, chapter creation) asynchronously with progress tracking.
- **User Story:** As a user, I want to see real-time progress updates for long-running tasks so that I know Mabel is working and I can come back later if needed.
- **Acceptance Criteria:**
  - Jobs process in the background without blocking the UI.
  - Users receive progress updates (e.g., "Writing your story... 65% complete").
  - Failed jobs provide clear error messages and retry options.
  - Email notifications when long-running jobs complete (Phase 2).
- **Priority:** P0

### Feature 9: Story Profile Setup
- **Description:** Collect basic information about the storyteller to personalize questions and narratives.
- **User Story:** As a user, I want to provide some context about myself so that Mabel can generate more relevant questions and a more personalized narrative.
- **Acceptance Criteria:**
  - Capture name, approximate age/generation, and key topics of interest.
  - Information is used to customize questions for Module 1.
  - Information influences narrative tone and style across all modules.
- **Priority:** P0

### Feature 10: PDF Story Export
- **Description:** Compile all approved chapters into a downloadable PDF story book.
- **User Story:** As a user, I want to download my completed story as a PDF so that I can print, share, or keep it digitally.
- **Acceptance Criteria:**
  - Users can export individual chapters as PDF.
  - Users can compile all approved chapters into a single PDF.
  - PDF includes cover page with project details.
  - Professional formatting with chapters, page numbers, and table of contents.
- **Priority:** P0

### Feature 11: Gamification & Engagement (Phase 2)
- **Description:** Keep users engaged and motivated through gamification elements.
- **User Story:** As a user, I want to feel motivated to keep recording my stories through fun rewards and milestones.
- **Acceptance Criteria:**
  - Recording streaks with visual tracking (daily/weekly).
  - Milestone celebrations (first recording, first chapter, halfway point, completion).
  - Surprise prompts from Mabel ("I was just thinking... do you remember your first day of school?").
  - Progress badges and achievements.
- **Priority:** P1 (Phase 2)

### Feature 12: Family Plan & Gifting (Phase 2)
- **Description:** Allow users to gift Mabel to loved ones and manage a shared family archive.
- **User Story:** As a user, I want to gift Mabel to my parents/grandparents so they can record their own stories and we can build a family archive together.
- **Acceptance Criteria:**
  - Gift purchase flow with personalized message.
  - Family Plan with discounted rate for additional family members.
  - Shared family archive where members can read each other's published stories.
  - Privacy controls for what to share vs. keep private.
- **Priority:** P1 (Phase 2)

### Feature 13: Voice Cloning and Audiobook Creation (Phase 3)
- **Description:** Uses ElevenLabs technology to create audiobooks narrated in the user's own cloned voice.
- **User Story:** As a user, I want to create an audiobook in my own voice so that my story feels truly personal and authentic.
- **Acceptance Criteria:**
  - Voice cloning accurately replicates the user's voice.
  - Audiobook is generated without noticeable audio artifacts.
  - Completed audiobook is shareable via multiple platforms.
- **Priority:** P2 (Phase 3)
- **Notes:** Voice cloning adds significant complexity and cost. MVP focuses on written narratives. Standard TTS audiobook generation can be added in Phase 2, with voice cloning as a premium feature in Phase 3.

## User Flows

### Primary User Journey: Capturing Your Life Story with Mabel (Voice-First Module Workflow)

#### Initial Setup
1. **Entry Point:** User opens Mabel (web or iOS app) and creates a new project ("My Life Story").
2. **Profile Setup:** User inputs basic information (name, age/generation, topics they want to explore).

#### Module 1: Foundational Chapter
3. **Create Module 1:** User creates first module (e.g., "Childhood") or system auto-creates it.
4. **Question Generation:** Mabel generates 15-20 foundational questions based on user profile (async job, ~30 seconds).
5. **Record Answers:** User taps the mic button and speaks their answer. Mabel records, transcribes, and generates a narrative snippet in the background. Can record over multiple sessions.
6. **Generate Chapter:** Once 50%+ of questions answered, user triggers chapter generation (async job, ~2 minutes).
7. **Review & Refine:** User reviews the generated chapter, can request regeneration with feedback or approve.
8. **Approve Chapter 1:** User approves the chapter, marking Module 1 complete.

#### Module 2+: Building Your Story
9. **Create Module 2:** User creates a new module for the next chapter (e.g., "School Days").
10. **Context-Aware Questions:** Mabel analyzes all previous responses, extracts themes/keywords, and generates follow-up questions that build on what's been shared.
11. **Record Answers:** User continues speaking answers, now to questions that reference and expand on earlier responses.
12. **Generate Chapter:** Same process — user generates chapter from responses.
13. **Review & Approve:** User reviews and approves Chapter 2.
14. **Repeat:** User continues creating modules (typically 3-8 total) until satisfied with their story.

#### Final Compilation
15. **Export PDF:** User can export individual chapters or compile all approved chapters into a complete PDF story.
16. **Share:** User downloads for printing, digital sharing with family, or archiving.

### Module Workflow States
Each module progresses through these states:
```
DRAFT -> QUESTIONS_GENERATED -> IN_PROGRESS -> GENERATING_CHAPTER -> CHAPTER_GENERATED -> APPROVED
```

### Post-MVP User Journey Extensions
- **Phase 2:** Gamification (streaks, milestones, surprise prompts), Family Plan gifting, standard TTS audiobook.
- **Phase 3:** Voice cloning for personalized audiobook narrated in the user's own voice.

## Technical Considerations

- **Platform Requirements:** Must be accessible via web browsers on desktop and mobile devices (responsive web design), and as a native iOS app via Capacitor.
- **Integration Needs:**
  - Whisper API for audio transcription
  - OpenAI API for AI-guided questions and narrative generation
  - S3 for secure file storage
  - Inngest for async job queue management
  - Stripe for payment processing
  - NextAuth.js for authentication
  - Capacitor for iOS native shell (audio recording, haptics)
  - (Post-MVP) ElevenLabs for voice cloning
- **Scalability Considerations:**
  - Job queue system (Inngest) to handle simultaneous transcription and generation requests
  - S3 for cost-effective storage of large audio files
  - Database indexes for efficient project and user lookups
- **Performance Requirements:**
  - Question generation: <30 seconds for 15-20 questions
  - Audio transcription + narrative: <60 seconds for a 3-5 minute recording
  - Chapter generation: <2 minutes for typical responses
  - API response time: <500ms for 95th percentile
  - Uptime: 99.5% target
  - Auto-save response delay: <2 seconds
- **State Management:**
  - Project-level: Tracks overall progress (X modules created, Y modules completed)
  - Module workflow state machine: DRAFT -> QUESTIONS_GENERATED -> IN_PROGRESS -> GENERATING_CHAPTER -> CHAPTER_GENERATED -> APPROVED
  - Valid state transitions enforced at API level
  - Async job tracking for transcription, question generation, and chapter creation
- **Security & Privacy:**
  - Database encryption at rest
  - HTTPS only (encryption in transit)
  - Secure file upload via presigned S3 URLs
  - GDPR and CCPA compliance requirements
  - Clear data retention and deletion policies

## Success Criteria

### MVP Completion Criteria
- All core features are functional and meet acceptance criteria.
- Initial feedback from test users is positive and highlights ease of use and emotional impact.

### Launch Readiness Checklist
- Comprehensive QA testing completed.
- Marketing and onboarding materials prepared.
- Support resources available for initial users.

### Key Metrics to Track Post-Launch
- User engagement and satisfaction levels.
- Number of completed projects and stories generated.
- Revenue growth from early adopters.

## Out of Scope (for MVP)

### Deferred to Phase 2
- Gamification features (streaks, milestones, celebrations)
- Family Plan and gifting
- Standard TTS audiobook generation (non-voice-cloned)
- Email notifications for job completion
- Real-time progress updates via Server-Sent Events
- Rich text editor for manual chapter editing
- Payment integration UI (Stripe backend ready, UI pending)

### Deferred to Phase 3
- Voice cloning and voice-cloned audiobook creation
- Photo/artifact integration ("Tell me about this photo...")
- Advanced narrative styling and formatting options
- Shared family archive with privacy controls

### Future Considerations
- Android native application (Capacitor already supports this)
- Multi-language support for non-English stories
- Collaborative editing (family members contributing to each other's stories)
- Physical book printing service
- Integration with wellness and mindfulness platforms
- AI-suggested module themes based on completed chapters
- Partnership with legacy and estate planning services

---

This PRD outlines the necessary components and considerations for the successful development and launch of Mabel. It provides a structured, actionable plan to guide the development team, ensuring clarity and focus on delivering a high-quality product that meets user needs.
