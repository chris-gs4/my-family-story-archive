# Product Requirements Document

## Document Information
- Product Name: Family Story Archive
- Version: 2.0
- Last Updated: 2026-01-25
- Status: Active

## Product Overview

Family Story Archive is an innovative web and mobile application designed to help individuals preserve family stories and legacies through AI-driven interviews and narrative generation. Using a unique **module-based approach**, users build their family story incrementally - answering questions one module at a time, with each module becoming a chapter in the final book.

The platform addresses the common problem of lost family histories by making story preservation accessible, non-overwhelming, and deeply personal. Unlike traditional methods that require interviewing expertise or significant time commitment upfront, our module system allows users to:
- **Build stories gradually** over weeks or months at their own pace
- **Leverage AI that learns** from previous answers to ask smarter follow-up questions
- **Create chapter-by-chapter** written narratives that compile into a complete book
- **Preserve stories in text form** (MVP), with audio features planned for future phases

The target market includes adult children aged 30-50 who desire to capture and preserve the life stories of their parents, relatives, or friends. This demographic is typically motivated by sentimental reasons, such as preserving family history for future generations, creating meaningful gifts, or celebrating family milestones.

This product matters because it democratizes the storytelling process through innovation in user experience - the module architecture prevents overwhelm while the context-learning AI creates richer, more connected narratives. Family Story Archive ensures that invaluable personal stories are preserved for posterity.

## Objectives & Success Metrics

### Primary Objectives
1. Enable seamless capture and preservation of family stories through AI technology.
2. Ensure high user satisfaction by providing a smooth and intuitive user experience.
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

### Persona 1: Sarah, The Family Historian
- **Demographics:** 45-year-old, married, two children, works as a high school teacher.
- **Background:** Sarah values family traditions and seeks to preserve her parents' stories for her children and future generations.
- **Goals and Motivations:** Wants to create a lasting family narrative that captures her parents' experiences and wisdom.
- **Pain Points and Frustrations:** Lacks the skills to conduct interviews or convert them into engaging narratives.
- **Success Scenario:** Uses Family Story Archive to easily record and transform her parents' stories into a professional-quality audiobook that she can share with her family.

## Core Features

### Feature 1: Module-Based Story Building ⭐ NEW
- **Description:** Users build their family story through discrete modules, each focusing on a specific theme or life stage. Each completed module becomes a chapter in the final book.
- **User Story:** As a user, I want to build my family story in manageable chunks so that I don't feel overwhelmed and can work on it over time.
- **Acceptance Criteria:**
  - Users can create new modules with custom themes or topics.
  - Each module tracks progress through states (draft → questions generated → in progress → chapter generated → approved).
  - Users can see all modules and their completion status in a dashboard view.
  - Modules can be completed in any order and over any timeframe.
- **Priority:** P0

### Feature 2: Context-Learning AI Questions ⭐ ENHANCED
- **Description:** AI generates personalized interview questions for each module. **Module 1** uses interviewee profile to generate foundational questions. **Subsequent modules** analyze previous answers to generate follow-up questions that dive deeper, explore connections, and fill narrative gaps.
- **User Story:** As a user, I want the AI to ask increasingly relevant questions based on what I've already shared so that the interview feels natural and builds on itself.
- **Acceptance Criteria:**
  - Module 1 generates 15-20 questions based on interviewee profile (relationship, age, topics).
  - Modules 2+ analyze all previous responses to extract themes and keywords.
  - Questions in later modules reference and build upon earlier answers.
  - Users can answer questions over multiple sessions.
- **Priority:** P0

### Feature 3: Text-Based Response Collection
- **Description:** Users answer interview questions by typing responses directly in the interface, one question at a time.
- **User Story:** As a user, I want to type my answers to interview questions so that I can capture stories at my own pace without needing recording equipment.
- **Acceptance Criteria:**
  - Users can view one question at a time with clear navigation.
  - Responses are auto-saved as users type.
  - Users can edit previous answers at any time.
  - Progress indicator shows how many questions have been answered.
- **Priority:** P0

### Feature 4: Chapter Generation from Q&A
- **Description:** AI converts question-and-answer pairs into cohesive narrative chapters with customizable tone and perspective.
- **User Story:** As a user, I want my Q&A responses transformed into a polished narrative chapter so that the story reads naturally.
- **Acceptance Criteria:**
  - Users can generate a chapter once 50%+ of module questions are answered.
  - Chapter generation supports person (1st/3rd), tone (warm/formal/conversational), and style (descriptive/concise/poetic).
  - Generated chapters maintain emotional depth and authentic voice.
  - Users can regenerate chapters with feedback ("make more emotional", "add more details").
  - System supports multiple chapter versions.
- **Priority:** P0

### Feature 5: Chapter Review & Editing
- **Description:** Users can review generated chapters, provide feedback for regeneration, or approve chapters for the final book.
- **User Story:** As a user, I want to review and refine each chapter before finalizing so that the narrative perfectly captures the story I want to tell.
- **Acceptance Criteria:**
  - Users can read the full generated chapter.
  - Users can request regeneration with specific feedback.
  - Users can approve chapters to mark modules as complete.
  - Approved chapters are locked from further AI regeneration (manual editing only).
- **Priority:** P0

### Feature 6: Audio Transcription (Phase 2)
- **Description:** Utilizes Whisper API to transcribe recorded audio interviews into text, which can then be used alongside or instead of typed responses.
- **User Story:** As a user, I want to record audio interviews and have them transcribed so that I can capture stories verbally when that's more comfortable.
- **Acceptance Criteria:**
  - Users can upload audio files up to 500MB.
  - Transcription accuracy >95% for clear audio.
  - Transcribed text is editable before use in narrative generation.
- **Priority:** P1 (Post-MVP)

### Feature 7: Module & Chapter State Management
- **Description:** Track each module's progress through defined workflow states to guide users through the story-building process.
- **User Story:** As a user, I want to see where each module is in the process so that I know what to do next.
- **Acceptance Criteria:**
  - Each module displays clear state: draft → questions_generated → in_progress → generating_chapter → chapter_generated → approved.
  - Visual indicators show module completion status.
  - Users can only perform actions valid for the current module state.
  - Dashboard shows overall project progress (X of Y modules completed).
- **Priority:** P0

### Feature 8: Async Job Processing
- **Description:** Handle long-running operations (question generation, chapter creation) asynchronously with progress tracking.
- **User Story:** As a user, I want to see real-time progress updates for long-running tasks so that I know the system is working and can come back later if needed.
- **Acceptance Criteria:**
  - Jobs process in the background without blocking the UI.
  - Users receive progress updates (e.g., "Generating chapter... 65% complete").
  - Failed jobs provide clear error messages and retry options.
  - Email notifications when long-running jobs complete (Phase 2).
- **Priority:** P0

### Feature 9: Interviewee Information Management
- **Description:** Collect and store information about the person being interviewed to personalize questions and narratives.
- **User Story:** As a user, I want to provide context about my interviewee so that the AI can generate more relevant questions and a more personalized narrative.
- **Acceptance Criteria:**
  - Capture name, relationship, approximate age/generation, and key topics.
  - Information is used to customize interview questions for Module 1.
  - Information influences narrative tone and style across all modules.
- **Priority:** P0

### Feature 10: PDF Book Export
- **Description:** Compile all approved chapters into a downloadable PDF book.
- **User Story:** As a user, I want to download my completed family story as a PDF so that I can print, share, or keep it digitally.
- **Acceptance Criteria:**
  - Users can export individual chapters as PDF.
  - Users can compile all approved chapters into a single PDF book.
  - PDF includes cover page with interviewee information and project details.
  - Professional formatting with chapters, page numbers, and table of contents.
- **Priority:** P0

### Feature 11: Voice Cloning and Audiobook Creation (Phase 3)
- **Description:** Uses ElevenLabs technology to create audiobooks with voice cloning.
- **User Story:** As a user, I want to create an audiobook with my interviewee's voice so that the story feels personal and authentic.
- **Acceptance Criteria:**
  - Voice cloning accurately replicates the interviewee's voice.
  - Audiobook is generated without noticeable audio artifacts.
  - Completed audiobook is shareable via multiple platforms.
- **Priority:** P2 (Phase 3)
- **Notes:** Voice cloning adds significant complexity and cost. MVP focuses on written narratives. Standard TTS audiobook generation can be added in Phase 2, with voice cloning as a premium feature in Phase 3.

## User Flows

### Primary User Journey: Creating a Family Story Project (MVP - Module-Based Workflow) ⭐ UPDATED

#### Initial Setup
1. **Entry Point:** User logs into the web application and creates a new project.
2. **Interviewee Setup:** User inputs basic information about the interviewee (name, relationship, age/generation, topics of interest).

#### Module 1: Foundational Chapter
3. **Create Module 1:** User creates first module (or system auto-creates it).
4. **Question Generation:** AI generates 15-20 foundational questions based on interviewee profile (async job, ~30 seconds).
5. **Answer Questions:** User answers questions one at a time, typing responses directly in the interface. Can answer over multiple sessions.
6. **Generate Chapter:** Once 50%+ of questions answered, user triggers chapter generation (async job, ~2 minutes).
7. **Review & Refine:** User reviews the generated chapter, can request regeneration with feedback or approve.
8. **Approve Chapter 1:** User approves the chapter, marking Module 1 complete.

#### Module 2+: Building the Story
9. **Create Module 2:** User creates a new module for the next chapter.
10. **Context-Aware Questions:** AI analyzes all previous module responses, extracts themes/keywords, and generates follow-up questions that build on what's been shared.
11. **Answer Questions:** User continues answering, now with questions that reference and expand on earlier responses.
12. **Generate Chapter:** Same process - user generates chapter from responses.
13. **Review & Approve:** User reviews and approves Chapter 2.
14. **Repeat:** User continues creating modules (typically 3-8 total) until the full story is captured.

#### Final Compilation
15. **Export PDF:** User can export individual chapters or compile all approved chapters into a complete PDF book.
16. **Share:** User downloads the book for printing, digital sharing with family, or archiving.

### Module Workflow States
Each module progresses through these states:
```
DRAFT → QUESTIONS_GENERATED → IN_PROGRESS → GENERATING_CHAPTER → CHAPTER_GENERATED → APPROVED
```

### Post-MVP User Journey Extensions
- **Phase 2:** After chapter approval, option to generate standard TTS audiobook narration.
- **Phase 2:** Audio interview support - users can upload recordings to supplement or replace typed responses.
- **Phase 3:** Option to upgrade to voice-cloned audiobook using interviewee's voice ($50-100 premium feature).

## Technical Considerations

- **Platform Requirements:** Must be accessible via web browsers on desktop and mobile devices (responsive web design), and as a native iOS app via Capacitor.
- **Integration Needs:**
  - Whisper API for audio transcription
  - OpenAI API for AI-guided questions and narrative generation
  - S3 for secure file storage
  - Inngest for async job queue management
  - Stripe for payment processing
  - NextAuth.js for authentication
  - (Post-MVP) ElevenLabs for voice cloning
- **Scalability Considerations:**
  - Job queue system (Inngest) to handle simultaneous transcription and generation requests
  - S3 for cost-effective storage of large audio files
  - Database indexes for efficient project and user lookups
- **Performance Requirements:**
  - Question generation: <30 seconds for 15-20 questions
  - Chapter generation: <2 minutes for typical responses
  - API response time: <500ms for 95th percentile
  - Uptime: 99.5% target
  - Auto-save response delay: <2 seconds
- **State Management:**
  - Project-level: Tracks overall progress (X modules created, Y modules completed)
  - Module workflow state machine: DRAFT → QUESTIONS_GENERATED → IN_PROGRESS → GENERATING_CHAPTER → CHAPTER_GENERATED → APPROVED
  - Valid state transitions enforced at API level
  - Async job tracking for question generation and chapter creation
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
- Number of completed projects and audiobooks generated.
- Revenue growth from early adopters.

## Out of Scope (for MVP)

### Deferred to Phase 2
- Audio upload and transcription features
- Standard TTS audiobook generation (non-voice-cloned)
- Email notifications for job completion
- Real-time progress updates via Server-Sent Events
- Rich text editor for manual chapter editing
- Payment integration UI (Stripe backend ready, UI pending)

### Deferred to Phase 3
- Voice cloning and voice-cloned audiobook creation
- Mixed audio/text responses within same module
- Speaker diarization (identifying who said what in multi-person interviews)
- Photo/artifact integration ("Tell me about this photo...")
- Advanced narrative styling and formatting options

### Future Considerations
- Native mobile application development
- Integration with genealogy platforms (Ancestry.com, FamilySearch)
- Multi-language support for non-English interviews
- Collaborative editing (multiple family members contributing)
- Physical book printing service
- Professional storyteller/journalist white-label version
- AI-suggested module themes based on completed chapters

---

This PRD outlines the necessary components and considerations for the successful development and launch of Family Story Archive. It provides a structured, actionable plan to guide the development team, ensuring clarity and focus on delivering a high-quality product that meets user needs.