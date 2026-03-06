# Demo Night: Your Journey Building Mabel

## Quick Pitch (1 minute)

"I started with Family Story Archive — a tool to help families interview older generations. But I discovered people didn't want to be interviewers; they wanted to capture **their own** stories.

So I pivoted to personal voice journaling. But free-form journaling led to abandonment — 'write your life story' felt overwhelming.

The breakthrough: **module-based storytelling**. Instead of a blank page, users answer 15-20 AI-generated questions per chapter. Voice-first. Mabel transforms spoken memories into polished narratives.

StoryWorth proved this market with a $100M+ acquisition, but they're still writing-first. **Mabel is voice-first** — that's the unlock. We're 50% cheaper at $4.99/month, and positioning as a 'journaling habit' vs. 'memoir project' opens up a 10x larger market."

---

## The Evolution Timeline

### Phase 1: Family Story Archive (January 2026)
**Problem:** Everyone has a life story worth preserving, but few capture it.

**Initial concept:** Help families interview and document stories from older generations.

**Tech foundation established:**
- Next.js + React + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js for authentication
- OpenAI for AI-generated questions
- AWS S3 for file storage
- Stripe for payments
- Inngest for background jobs
- Capacitor for iOS native

---

### Phase 2: Audio-First Personal Journaling (Mid-February 2026)

**Discovery:** The "family interview" format felt intimidating. People wanted to capture *their own* stories.

**Pivot:** Repositioned as personal voice journaling app.

**What I built:**
- `JournalEntry` model with processing pipeline (RECORDING → UPLOADED → PROCESSING → COMPLETE)
- S3 integration with presigned URLs for secure uploads
- **Whisper API integration** for audio transcription
- **OpenAI integration** for narrative transformation
- `AudioRecorder` component using Web Audio API
- Random prompt suggestions
- Redesigned setup flow for solo journaling

**Key insight:** Shifting from "interview format" to "personal voice journaling" made the product more accessible and emotionally resonant.

---

### Phase 3: Module-Based Architecture (Late February 2026)

**Discovery:** Free-form journaling led to user abandonment. People didn't know what to write about and felt overwhelmed by "write your whole life story."

**Solution:** **Module-based storytelling** — structure the book into chapters organized by life themes (Childhood, School Years, Career, Love & Relationships, etc.).

**How it works:**
1. Each **module** contains 15-20 AI-generated questions focused on a specific theme
2. Users answer questions through voice recording (transcribed → polished)
3. AI generates a complete narrative chapter from all answers
4. Users can regenerate chapters with feedback
5. Once approved, the module is locked and the next begins

**Database architecture:**
- `Module` table (DRAFT → QUESTIONS_GENERATED → IN_PROGRESS → GENERATING_CHAPTER → CHAPTER_GENERATED → APPROVED)
- `ModuleQuestion` table (voice recording, transcription, narrative)
- `ModuleChapter` table (with versioning for regenerations)
- Job queue for async generation

**API routes:**
- `POST /api/projects/:id/modules` - Create module & auto-generate questions
- `PATCH /api/projects/:id/modules/:moduleId/questions/:questionId` - Submit voice answer
- `POST /api/projects/:id/modules/:moduleId/chapter/generate` - Generate narrative
- `POST /api/projects/:id/modules/:moduleId/chapter/regenerate` - Regenerate with feedback
- `POST /api/projects/:id/modules/:moduleId/approve` - Lock chapter & advance

**Why this was transformational:**
- Users work in **manageable "bite-sized" chunks** (one module at a time)
- Prevents overwhelm compared to "write your whole memoir"
- **Context-learning AI**: each module analyzes previous responses for smarter follow-ups
- Higher completion rates

---

### Phase 4: Rebrand to "Mabel" (Late February 2026)

**Discovery:** "Family Story Archive" sounded formal and project-based. Positioning as "journaling" felt more accessible.

**Solution:** Full rebrand to **"Mabel"** with warm pixel-art grandmother mascot.

**Strategic repositioning:**
- From "preserve family stories" → **"capture your personal life story"**
- From "memoir project" → **"journaling habit"**
- Family Plan became secondary (gift to loved ones)
- Messaging: "fun, interactive journaling" not "formal memoir writing"

**Deliverables:**
- Landing page: "Your Stories, Written with Care"
- Business plan PDF for demo night
- Brand assets (logo, mascot, tagline)
- Updated ALL documentation

**Key insight:** Positioning as personal journaling (vs. memoir writing) opened up a much larger addressable market.

---

### Phase 5: Journaling-First Landing Page (March 2, 2026)

**Discovery:** Landing page still felt too "memoir-focused" and didn't clearly differentiate from StoryWorth.

**Solution:** Complete redesign with **journaling-first positioning**.

**What changed:**
- New tagline: **"Journal Freely. Share Beautifully."**
- Front-loaded problem statement: "raw journal entries are messy and unpublishable"
- Added **StoryWorth comparison table**
- Repositioned as **journaling habit** vs. memoir project
- Updated pricing to **$4.99/month (10 chapters) + $49.99/year (unlimited)**
- Added QR code with mailto link for demo night audience capture
- Added profile photo and contact info
- Applied gradient background

**Key differentiators vs. StoryWorth:**

| Feature | Mabel | StoryWorth |
|---------|-------|------------|
| Mental Model | Journaling habit | Memoir project |
| Time Commitment | Journal anytime | 52 weeks, 1 prompt/week |
| Input Method | Voice-first (or text) | Email prompts → typing |
| AI Polish | Narrative transformation | Basic formatting |
| Pace | Your schedule | Weekly deadline |
| Output | Export anytime (PDF/audiobook) | Hardcover book after 1 year |
| Best For | Active journalers & beginners | Family gift projects |

**Key insight:** Mabel says "journal your life, and let AI polish it into something shareable." StoryWorth says "commit to 52 weeks of memoir writing."

---

## Key Challenges Overcome

### 1. Product-Market Fit Evolution
**Challenge:** Started with "family interview tool" but positioning was too narrow.

**Solution:** Pivoted to personal voice journaling → module-based storytelling → journaling habit. Each iteration got closer to genuine product-market fit.

### 2. The Overwhelm Problem
**Challenge:** Free-form journaling led to user abandonment.

**Solution:** Module-based architecture broke the task into manageable chunks. Users think in chapters, not "entire memoir."

### 3. Voice vs. Writing
**Challenge:** Most competitors are writing-first. Voice recording felt risky.

**Solution:** Voice-first became the competitive advantage. Removing the "blank page" barrier unlocked a larger market.

### 4. Integration Complexity
**Challenge:** Coordinating Whisper, OpenAI, S3, Stripe, Inngest APIs with proper error handling.

**Solution:** Built robust async job processing with Inngest. Proper state management ensured reliability.

### 5. Context-Learning AI
**Challenge:** Generic interview questions felt robotic.

**Solution:** Each module analyzes previous responses to generate smarter follow-up questions. Required careful prompt engineering and passing full conversation history.

### 6. Multi-Platform Audio
**Challenge:** iOS requires AAC, web uses WebM. Different recording APIs on each platform.

**Solution:** Capacitor Voice Recorder plugin for iOS, MediaRecorder API for web. Backend handles both formats.

### 7. Positioning & Messaging
**Challenge:** "Memoir writing" sounds intimidating.

**Solution:** Repositioned as "journaling" with Mabel mascot as warm, encouraging companion. Fun over formal.

---

## What I Learned Through the AI Cohort

1. **Product pivots are essential** - Don't fall in love with your first idea. Listen to user signals and iterate.

2. **Architecture enables product strategy** - The module system wasn't just engineering — it was the key to solving the overwhelm problem.

3. **AI is a feature, not magic** - Context-learning questions required careful prompt engineering, not just "ask ChatGPT."

4. **Multi-platform is complex** - Native iOS + web required careful orchestration (different audio formats, APIs, build processes).

5. **Positioning is everything** - "Journaling habit" > "memoir project" opened up a 10x larger market.

6. **Demo-driven development** - Keeping landing page and messaging clear throughout helped validate assumptions early.

7. **Voice-first is differentiated** - Most competitors are still writing-first. Voice removes the biggest barrier (blank page anxiety).

---

## Current MVP Status (Ready for Demo)

### Core Features Implemented:
- ✅ **Authentication** - NextAuth.js with email/password and OAuth
- ✅ **Module-Based Storytelling** - Full workflow from creation → approval
- ✅ **Voice Recording** - Web (WebM) + iOS native (AAC via Capacitor)
- ✅ **AI Processing Pipeline:**
  - Whisper API for transcription
  - OpenAI for question generation (context-aware, learns from previous modules)
  - OpenAI for narrative generation (transforms Q&A into polished prose)
- ✅ **Chapter Regeneration** - Users can request revisions with feedback
- ✅ **PDF Export** - Download individual chapters or compiled books
- ✅ **Async Job Processing** - Inngest handles long-running tasks
- ✅ **Dashboard** - View all projects and modules
- ✅ **Auto-save** - Responses auto-save as users work

### Platform Support:
- ✅ Web (Next.js, fully responsive)
- ✅ iOS native (Capacitor shell with native audio)

### Testing:
- ✅ 21 unit tests with seed data
- ✅ Developer tools UI
- ✅ E2E test infrastructure (Playwright)

---

## Timeline Summary

| Phase | Key Change | Why It Mattered |
|-------|-----------|-----------------|
| **Jan 2026** | Family Story Archive MVP | Validated core tech stack and AI integration |
| **Mid-Feb** | Audio-first personal journaling | Shifted from family interview → personal storytelling |
| **Late Feb** | Module-based architecture | Solved the overwhelm problem with bite-sized chapters |
| **Late Feb** | Rebrand to "Mabel" | Positioned as journaling (accessible) vs. memoir (intimidating) |
| **Mar 2** | Journaling-first landing page | Clear differentiation vs. StoryWorth, $4.99 pricing |

---

## Demo Night Talking Points

**"What's your biggest learning from the cohort?"**
> "Positioning is everything. The technical product barely changed, but repositioning from 'memoir project' to 'journaling habit' opened up a 10x larger addressable market. That one pivot unlocked genuine product-market fit."

**"How did you validate the problem?"**
> "StoryWorth proved this market with a $100M+ acquisition. But they're still writing-first — users have to type email responses. I validated that voice-first removes the biggest barrier: blank page anxiety. People will talk when they won't write."

**"What's your unfair advantage?"**
> "I built the module-based architecture from scratch. Most competitors use free-form journaling, which leads to abandonment. My context-learning AI means each chapter gets smarter based on what you've already shared. That's proprietary tech that would take competitors months to replicate."

**"What would you do differently?"**
> "I'd validate pricing earlier. I spent weeks building features before testing whether users would actually pay $4.99/month. Could have saved time with landing page experiments and pre-orders."
