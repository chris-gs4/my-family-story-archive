# AI Agent Architecture for Mabel

**Version:** 1.0
**Date:** January 20, 2026
**Purpose:** Define the Module-based story creation system and AI agent behavior

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concept: Module-Based Story Creation](#core-concept-module-based-story-creation)
3. [User Journey](#user-journey)
4. [Data Model](#data-model)
5. [AI Agent Capabilities](#ai-agent-capabilities)
6. [API Endpoints](#api-endpoints)
7. [Module Workflow](#module-workflow)
8. [Book Compilation](#book-compilation)
9. [Edge Cases & Error Handling](#edge-cases--error-handling)
10. [Future Enhancements](#future-enhancements)

---

## Overview

Mabel uses a **Module-based approach** to break down the overwhelming task of creating a life story book into manageable, chapter-sized pieces. Each module represents one chapter of the final book.

### Key Principle

**Progressive disclosure with contextual intelligence**: The AI learns from each completed module to generate increasingly personalized and relevant questions for subsequent modules.

---

## Core Concept: Module-Based Story Creation

### What is a Module?

A **Module** is a self-contained unit of story creation that includes:

1. **15-20 AI-generated interview questions** (contextual to the module theme)
2. **User text responses** to those questions
3. **AI-generated narrative chapter** (based on responses)
4. **User approval/rejection** of the chapter

### Module Progression

```
Project Created
    ↓
Module 1: Setup & Generate Questions
    ↓
User Answers Questions (text input)
    ↓
User Generates Chapter from Responses
    ↓
User Reviews/Edits Chapter
    ↓
User Approves Module 1 ✓
    ↓
[AI analyzes Module 1 context]
    ↓
Module 2: Generate NEW Questions (informed by Module 1)
    ↓
User Answers Questions
    ↓
... repeat ...
    ↓
After 3-8 Modules Complete
    ↓
AI asks: "Ready to launch your book?"
    ↓
Book Compilation & Export (PDF)
```

---

## User Journey

### Phase 1: Project Setup

1. User creates a new project
2. User fills in interviewee information:
   - Name
   - Relationship
   - Birth year
   - Generation
   - Topics of interest

### Phase 2: Module Creation Loop

**For Each Module (1 through N):**

#### Step 2.1: Question Generation
- AI generates 15-20 questions for this module
- Questions are informed by:
  - Interviewee context (from setup)
  - All previous module responses (if any)
  - Module theme/focus area
  - Natural story progression

#### Step 2.2: Question Answering
- User sees questions one-by-one or in batches
- User types text responses
- Progress indicator: "7 of 15 questions answered"
- Can save draft and return later
- Once sufficient questions answered (minimum ~10), "Generate Chapter" button enables

#### Step 2.3: Narrative Generation
- User selects narrative preferences:
  - **Person:** First Person ("I") or Third Person ("They")
  - **Tone:** Warm/Nostalgic, Formal, Conversational
  - **Style:** Descriptive, Concise, Poetic
- User clicks "Generate Chapter"
- AI creates narrative chapter (15-30 seconds)
- User previews chapter

#### Step 2.4: Chapter Review & Approval
- User can:
  - **Edit** chapter directly (inline text editor)
  - **Regenerate** with feedback:
    - Change tone/person/style
    - Provide specific feedback ("Add more detail about...")
  - **Approve** chapter ✓
- Once approved, module is marked COMPLETE

#### Step 2.5: Next Module
- After approval, AI:
  - Analyzes completed module content
  - Identifies themes, people, events mentioned
  - Generates questions for next module that build on this context
- User is prompted: "Module 1 complete! Ready to start Module 2?"

### Phase 3: Book Completion

After **3-8 modules** are complete:

1. AI suggests: "You have enough content for a book! Ready to launch?"
2. User reviews all modules/chapters
3. User clicks "Launch Book"
4. AI compiles all chapters into cohesive book:
   - Adds introduction
   - Smooths transitions between chapters
   - Generates book title (based on content)
   - Formats as PDF/DOCX
5. User downloads final book

---

## Data Model

### Module Table

```typescript
interface Module {
  id: string;
  projectId: string;
  moduleNumber: number; // 1, 2, 3...
  title: string; // e.g., "Early Childhood", "First Job"
  status: ModuleStatus; // DRAFT, QUESTIONS_GENERATED, IN_PROGRESS, CHAPTER_GENERATED, APPROVED
  theme?: string; // Optional theme/focus for this module

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

enum ModuleStatus {
  DRAFT = "DRAFT", // Module created, no questions yet
  QUESTIONS_GENERATED = "QUESTIONS_GENERATED", // Questions ready
  IN_PROGRESS = "IN_PROGRESS", // User answering questions
  CHAPTER_GENERATED = "CHAPTER_GENERATED", // Chapter created, awaiting approval
  APPROVED = "APPROVED", // User approved, module complete
}
```

### ModuleQuestion Table

```typescript
interface ModuleQuestion {
  id: string;
  moduleId: string;
  question: string;
  category: string; // "Early Life", "Career", "Relationships", etc.
  order: number;

  // User response
  response?: string;
  respondedAt?: Date;

  // Context tracking
  contextSource?: string; // "initial" or "module_1", "module_2", etc.
  contextKeywords?: string[]; // Keywords from previous modules that informed this question

  createdAt: Date;
  updatedAt: Date;
}
```

### ModuleChapter Table

```typescript
interface ModuleChapter {
  id: string;
  moduleId: string;
  content: string; // The narrative text
  wordCount: number;
  version: number; // 1, 2, 3... (for regenerations)

  // Generation settings
  narrativePerson: "first-person" | "third-person";
  narrativeTone: "warm" | "formal" | "conversational";
  narrativeStyle: "descriptive" | "concise" | "poetic";

  // Metadata
  structure?: {
    sections: Array<{ title: string; startParagraph: number }>;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### Updated Project Table

```typescript
interface Project {
  id: string;
  userId: string;
  title: string;
  status: ProjectStatus;

  // Module tracking
  currentModuleNumber: number; // Which module user is on
  totalModulesCompleted: number;

  // Book compilation
  bookTitle?: string; // AI-generated or user-edited
  bookStatus?: "DRAFT" | "COMPILING" | "COMPLETE";
  compiledBookUrl?: string; // URL to final PDF

  createdAt: Date;
  updatedAt: Date;
}
```

---

## AI Agent Capabilities

### 1. Contextual Question Generation

**Goal:** Generate questions that feel personal and build a cohesive narrative.

**Inputs:**
- Interviewee profile (name, relationship, birth year, topics)
- All previous module questions & responses
- Current module number
- Optional theme/focus for this module

**Process:**

```
For Module 1 (First Module):
  - Generate broad foundational questions
  - Cover: early life, family background, formative experiences
  - Questions: 15-20

For Module N (N > 1):
  1. Analyze previous modules:
     - Extract key people mentioned
     - Extract key events/locations
     - Extract themes (work, family, challenges, joy, etc.)
     - Identify gaps (areas not explored yet)

  2. Generate follow-up questions:
     - Deep-dive questions on themes from previous modules
     - Questions that reference specific details from past responses
     - Questions that naturally progress the story chronologically or thematically

  3. Balance:
     - 60% contextual questions (building on previous modules)
     - 40% exploratory questions (new territory)
```

**Output:**
- 15-20 questions with:
  - Question text
  - Category
  - Order/priority
  - Context source (which module informed this question)

**Example:**

**Module 1 Question:**
> "Tell me about your childhood home. Where was it? What do you remember about it?"

**User Response (Module 1):**
> "We lived in a small house on Maple Street in Cleveland. I remember the big oak tree in the backyard where we built a treehouse..."

**Module 2 Question (contextual):**
> "You mentioned the treehouse on Maple Street. Who built it with you? What memories do you have of playing there?"

### 2. Narrative Chapter Generation

**Goal:** Transform Q&A responses into a flowing, readable narrative.

**Inputs:**
- Module questions & user responses
- Narrative preferences (person, tone, style)
- Previous chapter content (for consistency)
- Interviewee profile

**Process:**

```
1. Content Analysis:
   - Parse all responses for this module
   - Identify themes, people, places, events
   - Determine chronological vs. thematic organization

2. Story Structure:
   - Create chapter outline (3-5 sections)
   - Determine narrative flow
   - Plan opening hook and closing transition

3. Narrative Generation:
   - Write in specified person/tone/style
   - Weave responses into cohesive paragraphs
   - Add transitions between ideas
   - Maintain voice consistency with previous chapters
   - Target: 1,500-2,500 words per chapter

4. Polish:
   - Ensure factual accuracy to responses
   - Add emotional resonance
   - Check for flow and readability
```

**Output:**
- Chapter narrative (Markdown formatted)
- Chapter metadata:
  - Word count
  - Section structure
  - Key themes covered

**Quality Checks:**
- All important details from responses are included
- No hallucinations (don't invent facts not in responses)
- Consistent tone throughout
- Natural transitions between paragraphs

### 3. Context Learning

**Goal:** Build cumulative knowledge as modules progress.

**After Each Module Approval:**

```
1. Extract Context:
   - Named entities (people, places, organizations)
   - Time periods and dates
   - Themes and topics
   - Emotional tone
   - Significant events

2. Build Context Graph:
   - Connect related concepts
   - Track narrative threads across modules
   - Identify unexplored areas

3. Store Context:
   - Save to Project metadata as JSON
   - Use for next module's question generation

4. Progress Tracking:
   - Assess story completeness
   - Determine if ready for book compilation (3-8 modules)
   - Suggest next module theme if needed
```

**Context Structure:**

```json
{
  "people": ["Mary (mother)", "Tom (brother)", "Mrs. Henderson (teacher)"],
  "places": ["Cleveland", "Maple Street", "Lincoln Elementary"],
  "time_periods": ["1960s", "childhood", "school years"],
  "themes": ["family", "education", "neighborhood", "simple times"],
  "narrative_threads": {
    "family_dynamics": ["mother's roses", "father's work ethic", "siblings"],
    "education": ["Mrs. Henderson", "love of learning"],
    "community": ["safe neighborhood", "kids playing outside"]
  },
  "gaps_to_explore": ["teenage years", "first job", "relationships"]
}
```

### 4. Book Compilation

**Goal:** Transform approved modules into a complete book.

**Inputs:**
- All approved modules (3-8)
- Module chapters
- Project metadata
- Interviewee profile

**Process:**

```
1. Generate Book Title:
   - Analyze all chapters
   - Generate 3-5 title options
   - User selects or edits

2. Create Introduction:
   - Brief overview of person's life
   - Context for the book
   - 200-300 words

3. Compile Chapters:
   - Arrange modules in order
   - Add chapter titles/numbers
   - Smooth transitions between chapters
   - Ensure consistent voice/tense throughout

4. Add Closing:
   - Reflection or looking-forward section
   - 150-200 words

5. Format Book:
   - Table of contents
   - Page numbers
   - Professional formatting
   - Generate PDF and DOCX versions

6. Metadata:
   - Total word count
   - Page count
   - Completion date
```

**Output:**
- PDF file (formatted book)
- DOCX file (editable)
- Book metadata

---

## API Endpoints

### Module Management

#### `POST /api/projects/:projectId/modules`
Create a new module and generate questions

**Request:**
```json
{
  "theme": "Early Childhood" // Optional
}
```

**Response:**
```json
{
  "data": {
    "module": {
      "id": "mod_123",
      "projectId": "proj_456",
      "moduleNumber": 1,
      "status": "QUESTIONS_GENERATED",
      "theme": "Early Childhood"
    },
    "questions": [
      {
        "id": "q_1",
        "question": "What are your earliest memories?",
        "category": "Early Life",
        "order": 1
      }
      // ... 14-19 more questions
    ]
  }
}
```

#### `GET /api/projects/:projectId/modules`
Get all modules for a project

**Response:**
```json
{
  "data": {
    "modules": [
      {
        "id": "mod_123",
        "moduleNumber": 1,
        "title": "Early Childhood",
        "status": "APPROVED",
        "completedQuestions": 15,
        "totalQuestions": 18,
        "hasChapter": true,
        "approvedAt": "2026-01-20T10:30:00Z"
      }
    ],
    "currentModule": 2,
    "totalCompleted": 1
  }
}
```

#### `GET /api/projects/:projectId/modules/:moduleId`
Get single module with all questions and chapter

**Response:**
```json
{
  "data": {
    "module": { /* module details */ },
    "questions": [ /* questions with responses */ ],
    "chapter": { /* chapter if generated */ }
  }
}
```

### Question Management

#### `PATCH /api/projects/:projectId/modules/:moduleId/questions/:questionId`
Submit answer to a question

**Request:**
```json
{
  "response": "I grew up in Cleveland..."
}
```

#### `GET /api/projects/:projectId/modules/:moduleId/questions`
Get all questions for a module with response status

### Chapter Management

#### `POST /api/projects/:projectId/modules/:moduleId/chapter/generate`
Generate narrative chapter from responses

**Request:**
```json
{
  "narrativePerson": "first-person",
  "narrativeTone": "warm",
  "narrativeStyle": "descriptive"
}
```

**Response:**
```json
{
  "data": {
    "chapter": {
      "id": "chap_789",
      "content": "# Early Childhood\n\nI remember...",
      "wordCount": 1847,
      "version": 1
    },
    "jobId": "job_abc" // For progress tracking
  }
}
```

#### `POST /api/projects/:projectId/modules/:moduleId/chapter/regenerate`
Regenerate chapter with feedback

**Request:**
```json
{
  "narrativePerson": "third-person",
  "narrativeTone": "conversational",
  "narrativeStyle": "concise",
  "feedback": "Add more details about the treehouse"
}
```

#### `PATCH /api/projects/:projectId/modules/:moduleId/chapter`
Update chapter content (manual edit)

**Request:**
```json
{
  "content": "Updated chapter text..."
}
```

#### `POST /api/projects/:projectId/modules/:moduleId/approve`
Approve module (marks as complete, triggers next module)

**Response:**
```json
{
  "data": {
    "approvedModule": { /* module details */ },
    "nextModule": {
      "id": "mod_124",
      "moduleNumber": 2,
      "status": "DRAFT",
      "suggestedTheme": "School Years"
    }
  }
}
```

### Book Compilation

#### `POST /api/projects/:projectId/book/compile`
Compile all approved modules into final book

**Response:**
```json
{
  "data": {
    "jobId": "job_xyz",
    "estimatedTime": 30 // seconds
  }
}
```

#### `GET /api/projects/:projectId/book`
Get compiled book status and download URL

**Response:**
```json
{
  "data": {
    "bookStatus": "COMPLETE",
    "bookTitle": "A Life Well Lived: The Story of Roberto",
    "pdfUrl": "https://s3.../book.pdf",
    "docxUrl": "https://s3.../book.docx",
    "wordCount": 12450,
    "pageCount": 42,
    "compiledAt": "2026-01-20T15:00:00Z"
  }
}
```

---

## Module Workflow

### State Machine

```
Module States:

DRAFT
  ↓ [Generate Questions]
QUESTIONS_GENERATED
  ↓ [User answers questions]
IN_PROGRESS
  ↓ [User clicks "Generate Chapter"]
GENERATING_CHAPTER (background job)
  ↓ [Chapter complete]
CHAPTER_GENERATED
  ↓ [User edits/regenerates] ←→ CHAPTER_GENERATED
  ↓ [User approves]
APPROVED ✓
  ↓ [Auto-create next module]
Next Module: DRAFT
```

### Minimum Viable Module

**To generate a chapter, user must:**
- Answer at least 10 out of 15-20 questions (50%+)
- Responses should total at least 500 words

**Quality gate:**
- Warn user if responses are too short ("Add more detail to generate a better chapter")

### Module Limits

- **Minimum:** 3 modules required to compile book
- **Maximum:** 8 modules per project (can be extended)
- **Recommended:** 5-6 modules for a well-rounded story

---

## Book Compilation

### When to Compile

System prompts user to compile book when:
1. **At least 3 modules approved**, OR
2. **User manually requests compilation**

### Compilation Process

```
1. Validate:
   ✓ At least 3 approved modules
   ✓ All modules have chapters

2. Generate Book Title:
   - Analyze all chapters
   - Generate 3 options based on themes
   - User selects or edits

3. Create Introduction:
   - Use interviewee profile
   - Summarize key themes from all chapters
   - Set the stage for the story

4. Compile Chapters:
   - Order modules sequentially
   - Add chapter numbers and titles
   - Ensure consistent voice/tense
   - Add transitions between chapters if needed

5. Add Conclusion:
   - Reflective ending
   - Looking forward or legacy statement

6. Format & Export:
   - Generate PDF (print-quality)
   - Generate DOCX (editable)
   - Upload to S3
   - Return download URLs

7. Update Project:
   - Set bookStatus to COMPLETE
   - Store book metadata
```

---

## Edge Cases & Error Handling

### Scenario 1: User Abandons Module Mid-Way

**Problem:** User answers 5 questions, then leaves.

**Solution:**
- Auto-save responses as user types
- Module stays in IN_PROGRESS
- User can return anytime
- Show progress on dashboard: "Module 2: 5 of 18 questions answered"

### Scenario 2: User Skips Many Questions

**Problem:** User only answers 6 out of 20 questions.

**Solution:**
- Don't allow chapter generation until minimum threshold (10 questions)
- Show message: "Answer at least 10 questions to generate a chapter"
- Highlight unanswered questions

### Scenario 3: User Deletes a Module

**Problem:** User approves 4 modules, then deletes Module 2.

**Solution:**
- Mark module as DELETED (soft delete)
- Renumber remaining modules (1, 2, 3 instead of 1, 3, 4)
- Recompile book without deleted module
- Warn: "Deleting this module will affect your book. Continue?"

### Scenario 4: Chapter Generation Fails

**Problem:** AI fails to generate chapter (API error, timeout, etc.)

**Solution:**
- Retry up to 3 times automatically
- If still fails: show error, allow user to retry manually
- Save user responses (never lose data)
- Provide fallback: "Try regenerating in a few minutes"

### Scenario 5: User Never Approves Chapter

**Problem:** User generates chapter but never approves it.

**Solution:**
- Chapter stays in CHAPTER_GENERATED state
- User can still edit/regenerate
- Dashboard shows: "Module 3: Review chapter"
- Can't start next module until current one approved

### Scenario 6: AI Hallucination

**Problem:** AI adds details not in user responses.

**Solution:**
- Implement fact-checking:
  - Cross-reference chapter content with source responses
  - Flag any information not present in responses
- User can edit and fix hallucinations
- System learns from edits (future improvement)

---

## Future Enhancements

### Phase 2 (Post-MVP)

1. **Audio Input**
   - Replace text responses with audio recording
   - Transcribe with Whisper API
   - Generate chapter from transcription
   - (Architecture already supports this - just change input method)

2. **Collaborative Modules**
   - Multiple people answer same questions
   - AI merges perspectives into single narrative
   - Tag different viewpoints

3. **Smart Module Themes**
   - AI suggests themes for next module based on gaps
   - "I notice we haven't covered your career yet. Would you like Module 3 to focus on that?"

4. **Interactive Preview**
   - Show chapter preview as user answers questions
   - Real-time narrative building

### Phase 3 (Advanced)

1. **Voice Cloning**
   - Generate audiobook using interviewee's voice
   - Requires voice samples from interviews

2. **Photo Integration**
   - Upload photos for each module
   - AI generates photo captions based on chapter content
   - Include photos in compiled book

3. **Timeline Visualization**
   - Interactive timeline of person's life
   - Navigate between modules via timeline

4. **Multi-Project Books**
   - Combine multiple people's stories
   - Family history book with multiple perspectives

---

## Implementation Priority

### Sprint 1: Core Module System
1. Database schema for modules, questions, chapters
2. Module CRUD API endpoints
3. Question answering API
4. Basic module workflow (create → answer → generate)

### Sprint 2: AI Integration
1. Question generation AI agent
2. Contextual learning between modules
3. Chapter generation AI agent
4. Regeneration with feedback

### Sprint 3: UI & UX
1. Module dashboard view
2. Question answering interface
3. Chapter review/edit interface
4. Module approval flow

### Sprint 4: Book Compilation
1. Book compilation logic
2. PDF/DOCX generation
3. Book download & storage
4. Book metadata & preview

### Sprint 5: Polish & Optimization
1. Loading states & progress indicators
2. Error handling & retries
3. Performance optimization
4. Edge case handling

---

## Success Metrics

### User Metrics
- **Completion Rate:** % of users who complete at least 3 modules
- **Time to First Module:** How long to complete Module 1
- **Module Approval Rate:** % of generated chapters approved without edits
- **Average Modules per Book:** Mean number of modules in completed books

### AI Metrics
- **Question Relevance:** User feedback on question quality
- **Chapter Quality:** User ratings of generated narratives
- **Regeneration Rate:** % of chapters that need regeneration
- **Context Accuracy:** How well follow-up questions reference previous modules

### Technical Metrics
- **Generation Time:** AI processing time for questions/chapters
- **API Success Rate:** % of successful API calls
- **Error Recovery:** % of failures that recover via retry

---

**Document Status:** Ready for Implementation
**Next Steps:** Begin Sprint 1 - Core Module System
**Questions/Clarifications:** Contact product owner

---

*Generated for Mabel project*
*Author: Claude Code Assistant*
*Date: January 20, 2026*
