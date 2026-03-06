# Next Session Guide
**Date Created:** January 20, 2026
**Status:** Paused after Phase 3.2 (Database + API Implementation)

---

## 📋 What Was Accomplished This Session

### ✅ Completed Tasks

1. **UX Improvements (2 rounds of testing)**
   - Fixed dashboard layout and spacing
   - Added project deletion with confirmation modal
   - Implemented user profile dropdown with logout
   - Created profile, settings, and payment pages
   - Added social login buttons (Google, Apple, Facebook)
   - Improved project title inline editing
   - Enhanced project card styling
   - Removed audio references (focusing on text first)
   - Commit: `bd90b40`

2. **AI Architecture Documentation**
   - Created `confabulator/AI-AGENT-ARCHITECTURE.md`
   - 500+ line comprehensive architecture document
   - Detailed module workflow, data model, API specs
   - Edge cases and implementation roadmap

3. **Module System - Database & API**
   - Added 3 new database tables: `Module`, `ModuleQuestion`, `ModuleChapter`
   - Created 13 API endpoints for module operations
   - Implemented 2 Inngest background jobs
   - Applied database migration
   - Commit: `c42f1e6`

---

## 🗂️ Current Project State

### Database Schema
✅ **Ready to use**
- `modules` table - Chapter containers
- `module_questions` table - Questions with responses
- `module_chapters` table - Generated narratives with versioning
- Migration applied successfully

### API Endpoints
✅ **All implemented and ready to test**
- Module CRUD operations
- Question answering flow
- Chapter generation & regeneration
- Module approval workflow

### Background Jobs
✅ **Configured and ready**
- Question generation (with context learning)
- Chapter generation (with narrative settings)
- Both use mock OpenAI (works without API keys)

### UI
⏳ **NOT YET BUILT**
- Still has old non-module UI
- Needs complete rebuild for module workflow

---

## 🎯 Next Steps (In Order)

### Step 1: Test the Module API (Optional but Recommended)

Before building the UI, verify the backend works correctly.

**Testing Options:**

#### Option A: Manual API Testing
Use `curl` or Postman to test the endpoints.

**Example test flow:**
```bash
# 1. Create a project (existing endpoint)
# 2. Add interviewee info (existing endpoint)
# 3. Create first module
curl -X POST http://localhost:3000/api/projects/YOUR_PROJECT_ID/modules \
  -H "Content-Type: application/json" \
  -d '{"theme": "Early Childhood"}'

# 4. Wait for questions to generate (background job runs)
# 5. Check questions
curl http://localhost:3000/api/projects/YOUR_PROJECT_ID/modules/MODULE_ID/questions

# 6. Submit answers
curl -X PATCH http://localhost:3000/api/projects/YOUR_PROJECT_ID/modules/MODULE_ID/questions/QUESTION_ID \
  -H "Content-Type: application/json" \
  -d '{"response": "I grew up in..."}'

# 7. Generate chapter
curl -X POST http://localhost:3000/api/projects/YOUR_PROJECT_ID/modules/MODULE_ID/chapter/generate \
  -H "Content-Type: application/json" \
  -d '{"narrativePerson": "first-person", "narrativeTone": "warm", "narrativeStyle": "descriptive"}'

# 8. Check chapter
curl http://localhost:3000/api/projects/YOUR_PROJECT_ID/modules/MODULE_ID/chapter

# 9. Approve module
curl -X POST http://localhost:3000/api/projects/YOUR_PROJECT_ID/modules/MODULE_ID/approve
```

#### Option B: Skip Testing, Trust Implementation
Move directly to UI implementation.

---

### Step 2: Build Module UI (Major Work)

This is the big phase. You'll need to rebuild significant parts of the UI.

**What needs to be built:**

#### 2.1: Module Dashboard View
**Location:** `/projects/[id]/modules` (new page)

**Features:**
- List all modules (1, 2, 3...)
- Show module status (Draft, In Progress, Approved)
- Progress indicators (7/15 questions answered)
- "Start Module" / "Continue Module" buttons
- Visual chapter indicators
- "Ready to compile book?" prompt (after 3+ modules)

**Reference:** See `confabulator/AI-AGENT-ARCHITECTURE.md` section "User Journey"

---

#### 2.2: Question Answering Interface
**Location:** `/projects/[id]/modules/[moduleId]/questions` (new page)

**Features:**
- Display questions one-by-one or in a list
- Text input for responses (rich text editor?)
- Auto-save drafts
- Progress indicator
- "Generate Chapter" button (enabled at 50%+ answered)
- Navigation between questions

**Design considerations:**
- Should questions appear one at a time, or all at once?
- Should there be a "Skip" option?
- How to handle long responses (word count indicator?)

---

#### 2.3: Chapter Review & Approval Interface
**Location:** `/projects/[id]/modules/[moduleId]/chapter` (new page)

**Features:**
- Display generated chapter (formatted markdown)
- Word count and reading time
- Edit chapter inline (WYSIWYG editor)
- Regenerate options:
  - Change narrative settings (person, tone, style)
  - Provide feedback textarea
  - "Regenerate" button
- "Approve Chapter" button (prominent)
- "Back to Questions" link

**Modal: Regenerate with Feedback**
- Dropdowns for person/tone/style
- Textarea: "What would you like to change?"
- Preview previous settings
- "Regenerate Chapter" button

---

#### 2.4: Update Existing Pages

**Dashboard (`/dashboard`):**
- Add "Modules" section to each project card
- Show: "3 modules completed" or "Module 2 in progress"
- Link to module dashboard

**Project Setup Flow:**
- After interviewee setup, create Module 1 automatically
- Redirect to `/projects/[id]/modules` instead of old questions page

---

### Step 3: Implement Book Compilation (Later)

After modules are working, add:
- Book compilation API endpoint
- Book preview page
- PDF/DOCX generation
- Download functionality

**Reference:** See `confabulator/AI-AGENT-ARCHITECTURE.md` section "Book Compilation"

---

## 📁 Important Files Reference

### Documentation
- `confabulator/AI-AGENT-ARCHITECTURE.md` - Complete module system spec
- `confabulator/PRD.md` - Original product requirements
- `confabulator/wireframes.md` - UI wireframes (may need updating)

### Database
- `prisma/schema.prisma` - Full database schema
- `prisma/migrations/20260120234335_add_module_architecture/migration.sql` - Latest migration

### API Endpoints
- `src/app/api/projects/[id]/modules/route.ts` - Module list & create
- `src/app/api/projects/[id]/modules/[moduleId]/route.ts` - Single module
- `src/app/api/projects/[id]/modules/[moduleId]/questions/[questionId]/route.ts` - Answer questions
- `src/app/api/projects/[id]/modules/[moduleId]/chapter/generate/route.ts` - Generate chapter
- `src/app/api/projects/[id]/modules/[moduleId]/approve/route.ts` - Approve module

### Background Jobs
- `src/lib/inngest/functions.ts` - All Inngest job definitions
- Lines 307-410: `generateModuleQuestionsJob`
- Lines 416-518: `generateModuleChapterJob`

### Services
- `src/lib/services/mock/openai.ts` - Mock AI service (no API key needed)

---

## 🔧 Setup Checklist (For Next Session)

Before starting work:

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies** (if any new ones):
   ```bash
   npm install
   ```

3. **Run migrations** (should already be applied):
   ```bash
   npx prisma migrate dev
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

5. **Start Inngest dev server** (for background jobs):
   ```bash
   npx inngest-cli@latest dev
   ```
   - This runs in a separate terminal
   - Required for question generation and chapter generation
   - Access UI at: http://localhost:8288

6. **Verify database is running:**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql

   # If not running:
   brew services start postgresql@15
   ```

---

## 💡 Recommended Approach for Next Session

### Quick Start (Recommended)
1. Review `confabulator/AI-AGENT-ARCHITECTURE.md` (10-15 minutes)
2. (Optional) Test one API endpoint to verify backend works
3. Start building Module Dashboard UI
4. Work through UI components in order (dashboard → questions → chapter)

### Thorough Start
1. Test full API flow with curl/Postman (30 minutes)
2. Document any bugs found
3. Fix bugs before proceeding to UI
4. Then build UI components

### Aggressive Start
1. Skip testing
2. Jump straight into UI development
3. Debug as you go

---

## 🐛 Known Limitations (To Address Later)

1. **No real AI integration yet** - Using mock OpenAI service
2. **No book compilation** - Not implemented yet
3. **No audio input** - Deliberately deferred
4. **Old UI still exists** - Non-module pages still present
5. **No error recovery UI** - API errors need better user feedback

---

## 📝 Questions to Consider (For UI Design)

When building the UI, you'll need to decide:

1. **Module Dashboard:**
   - Linear progression or allow jumping between modules?
   - Show preview of chapter content in module cards?

2. **Question Interface:**
   - One question per page or scrollable list?
   - Should unanswered questions be highlighted?
   - Minimum response length validation?

3. **Chapter Review:**
   - Allow inline editing or separate edit mode?
   - Show diff when regenerating?
   - Version history accessible?

4. **Navigation:**
   - Breadcrumbs? (Dashboard > Project > Module > Questions)
   - Back buttons behavior?

---

## 🚀 Success Criteria for Next Session

By the end of your next session, you should have:

**Minimum (MVP):**
- [ ] Module dashboard page showing list of modules
- [ ] Question answering interface
- [ ] Chapter review page
- [ ] Basic navigation between pages
- [ ] One complete module workflow working end-to-end

**Stretch Goals:**
- [ ] All visual polish (animations, loading states, etc.)
- [ ] Regeneration modal with feedback
- [ ] Module approval flow
- [ ] Book compilation suggestion UI

---

## 📞 Need Help?

If you encounter issues:

1. **Database issues:**
   - Check migration status: `npx prisma migrate status`
   - Reset database (caution!): `npx prisma migrate reset`

2. **API errors:**
   - Check browser console (F12)
   - Check terminal where dev server is running
   - Check Inngest UI for job failures

3. **TypeScript errors:**
   - Run: `npx tsc --noEmit` to check for type issues
   - Regenerate Prisma client: `npx prisma generate`

4. **Background jobs not running:**
   - Make sure Inngest dev server is running
   - Check http://localhost:8288 for job status

---

## 📊 Progress Tracker

```
✅ Phase 1: UX Improvements
✅ Phase 2: AI Architecture Documentation
✅ Phase 3.1: Database Schema
✅ Phase 3.2: API Implementation
⏳ Phase 3.3: UI Implementation (NEXT)
⏳ Phase 3.4: Book Compilation
⏳ Phase 4: Testing & Polish
⏳ Phase 5: Update Confabulator Docs
```

---

## 🎯 The Big Picture

You're building a **module-based story creation system** where:
- Each module = 1 chapter of the final book
- Users answer 15-20 questions per module
- AI generates a narrative chapter from responses
- After 3-8 modules, compile into a book

**You've completed:** Backend (database + API)
**Next up:** Frontend (UI)

The backend is solid. Now you need to build the user experience on top of it.

---

**Good luck with your next session!** 🚀

*Last updated: January 20, 2026*
*Next session: TBD*
