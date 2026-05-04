# Mabel — Get Unstuck: 6-Week Plan

## How to use this file

This is your living checklist for getting Mabel back on track. It's in the repo so it's visible on GitHub and gets versioned alongside your code.

**At the start of every session:**
- Open this file (on GitHub, Cursor, or Xcode).
- Find the next unchecked `- [ ]` task.
- Work on exactly that. Don't drift.
- When done, change `- [ ]` to `- [x]` and add a date in parens like `(2026-05-11)`. Commit. The git history becomes your progress log.

**One unchecked task at a time.** If you catch yourself doing something not on the list, either add it as a new `- [ ]` or stop. The plan is the contract with yourself; ignoring it for "just one more thing" is exactly how the last 10 weeks happened.

A handy session-opener prompt for Claude Code: *"Read `Mabel/decisions/development-schedule.md`, tell me the next unchecked task, and let's start it."*

---

## Context

Mabel's functional MVP was completed on **2026-02-25**. Since then, every commit has been branding/design work — color palette overhauls, dual-font system, screen-by-screen design uplifts, mascot redesign, landing page. The last code commit was **2026-04-16** (design uplift). It is now **2026-05-04**: 18 days of dormancy, 10 weeks since the last functional change.

You confirmed:
- **Goal:** personal/family use only — no App Store, no TestFlight beta
- **Capacity:** 5–15 hrs/week (~10 hrs/week assumed)
- **Branding:** paused entirely; functionality only
- **Big bet:** Dynamic AI questions (PRD Feature 3)

The audit also surfaced something important: most of what felt missing is already in the codebase. The dynamic-questions API and chapter-regeneration flow already exist — they just need persistence, profile-context, and visible error/progress UX. The scope is *finishing* and *hardening*, not greenfield building.

This plan is intentionally short and prioritized. Each phase is a self-contained chunk you can tackle in one or two sittings.

---

## What's already built (don't redo)

| Capability | Status | Where |
|---|---|---|
| Whisper transcription | ✅ Wired | `OpenAIService.transcribeAudio()` line 27 |
| GPT-4o narrative generation | ✅ Wired | `OpenAIService.generateNarrative()` line 82, `generateChapterNarrative()` line 148 |
| Context-aware prompts (uses `previousMemories`) | ✅ Wired | `OpenAIService.generatePrompts()` line 217, called from `RecordingSetupView.loadPrompts()` line 421 |
| Chapter regeneration with feedback | ✅ Wired | `OpenAIService.regenerateChapterNarrative()` line 312 + `ChapterReviewView.regenerateNarrative()` line 205 |
| Local persistence | ✅ | `AppState` saves chapters.json + userProfile.json |
| PDF export | ✅ | `PDFExportService` |
| Static prompt fallback | ✅ | `ChapterPrompts.swift` — keep as offline path |

---

## Phase 0 — Reality-check the existing code (Week 1, ~3 hrs)

Before adding anything, confirm what already works in your hands:

- [x] Run the app in the simulator with debug seed data (2026-05-04 — verified `xcodebuild` + `simctl` loop works end-to-end on iPhone 17 Pro / iOS 26.2)
- [x] Open Chapter 3 → tap "REQUEST CHANGES" → type "Make it shorter and add more emotion" → "REGENERATE". Confirmed narrative changes — round-trip works end-to-end. (2026-05-04)
- [ ] Disable simulator network → record a 5-second memory → note exactly what you see (or don't) when it fails. This drives Phase 1 scope.
- [ ] Open `RecordingSetupView` for a chapter with 1–2 prior memories → confirm AI-generated prompts reference earlier content. If they don't, the issue is prompt construction, not missing wiring.

### Findings journal

- **2026-05-04 — `SetupView` text-field freeze (FIXED, commit `87160c2`).** Tapping the "Enter a name" TextField in Setup froze the entire app — scrolling and tapping stopped responding. Root cause confirmed via `sample` against the running process: 100% main-thread time in `_UIHostingView.layoutSubviews` → `CA::Layer::layout_and_display_if_needed`. SwiftUI was caught in an infinite layout loop because `.animation(MabelAnimation.focusTransition, value: isNameFocused)` wrapped the entire TextField, and keyboard auto-avoidance was concurrently moving the ScrollView. Fix: removed the `.animation()` modifier on the name field and the "Other" relationship field. Focus border color and shadow still change instantly. No other views in the codebase have the same pattern (verified by grep).
- **2026-05-04 — `MyStoriesView` review button opened the wrong chapter (FIXED, commit `eeed2cc`).** Tapping REVIEW & APPROVE on Chapter 3's card opened Chapter 1's review modal. Root cause: `.sheet(isPresented:)` content closure captured `reviewingChapterIndex` from the parent view's last-rendered state — which was the `@State` default of 0. Setting both `reviewingChapterIndex` and `showChapterReview = true` in the same button closure didn't propagate the new index to the sheet's content. Fix: replaced the `(Bool, Int)` pair with `.sheet(item:)` using an `Identifiable` `ReviewingChapter` wrapper, which guarantees the freshly-set value reaches the closure. `RecordingSetupView`'s similar sheet is unaffected because its `chapterIndex` is a stored `let`, not `@State`. **Lesson worth remembering:** any `.sheet(isPresented:)` whose content depends on an additional `@State` is a latent version of this bug. Prefer `.sheet(item:)` whenever the sheet content varies by ID.
- **2026-05-04 — Regeneration progress UX is BETTER than the audit said.** During the regenerate wait the user sees an animated spinner, specific copy *"Rewriting your chapter…"*, the REGENERATE button greyed out and disabled, and a still-tappable Cancel. This is healthy progress feedback. Phase 1.2 should narrow scope: regeneration is fine; focus the spinner/banner work on the *other* long-running paths — per-memory Whisper transcription, GPT-4o memory narrative generation, and the initial chapter generation after the 5th memory.
- **2026-05-04 — "Shorter" feedback ignored across multiple regeneration attempts (reproducible).** First attempt: "Make it shorter and add more emotion" — got more emotion, didn't shorten. Second attempt: "Make it shorter" alone — still didn't shorten. The chapter remains 4 substantial paragraphs.
- **2026-05-04 — Regeneration prompt has three concrete bugs (Phase 2 prompt-engineering targets).** Root cause is the system prompt in `OpenAIService.regenerateChapterNarrative()` line 328–334:
  - **(a) Hardcoded voice.** The prompt says *"Keep writing in first person"* — overrides whatever voice the source narrative was in. Fix: detect or pass the source voice and instruct the model to preserve it. Or align voice to `UserProfile.relationship` (Myself → 1st person, A Parent/Grandparent/Friend → 3rd person biographer).
  - **(b) Conflicting directives.** Same prompt also says *"Maintain all the original details and meaning from the source memories"* — directly conflicts with "shorter" feedback. When the user asks for shorter, "maintain all details" wins. Fix: weight feedback above detail preservation, OR detect length-related feedback and translate it into a target word/sentence count.
  - **(c) No length ceiling.** `max_tokens: 3000` is generous; "shorter" has no hard cap. Fix: when feedback contains length verbs (shorter/longer/concise), inject an explicit target like *"Aim for ~60% of the previous draft's length."*
  These also apply to `generateChapterNarrative` (line 148) which sets the original voice — the seeded data is 3rd person but a live recording with `relationship: "Myself"` should produce 1st person. Voice consistency needs to be a property of the chapter, not regenerated each call.
- **2026-05-04 — Pre-rebrand copy still in `WelcomeView`.** Welcome reads "Your AI-assisted ghost writer. Capture your stories and write a book for future generations. No typing, just talking." The current positioning is "Your memoir companion. Just talk — Mabel writes." Functionality-adjacent (it's the first thing the user sees). Decide in Phase 1 whether to fix now or hold for Phase 4 branding cycle.

---

## Phase 0.5 — Get Mabel on your iPhone (~1–2 hrs)

The simulator can't fully test microphone behavior, audio interruptions (a phone call mid-recording), AVAudioSession state, or the iOS permission flow. For your "record real family stories" goal, you need the app on a real device. Best to do this BEFORE Phase 1 testing so the utility fixes (alerts, progress feedback) get exercised against real-device timing.

**Decision: free Personal Team or paid Apple Developer Program?**
- **Free (Personal Team) is sufficient for Phase 0.5–2 personal use.** 7-day provisioning expiry is fine since you'll rebuild every few days anyway. Microphone + local file I/O + OpenAI network all work.
- **Pay the $99 only when you want family members on THEIR own phones** — that needs TestFlight, which needs the paid program. No need to pay before that trigger fires.

### Setup with Personal Team (free)
- [ ] Open `Mabel/Mabel.xcodeproj` in Xcode.
- [ ] Select the `Mabel` target → **Signing & Capabilities** tab.
- [ ] Under "Team," click the dropdown → **Add an Account…** → sign in with your Apple ID. Once signed in, pick "Christiano (Personal Team)" as the team.
- [ ] If Xcode complains about bundle ID `com.mabel.app` already being taken, change it to something namespaced to you (e.g. `com.cgsqueff.mabel`). Personal Team can't share bundle IDs with anyone else's Personal Team.
- [ ] Connect your iPhone via USB cable. Trust this Mac when prompted on the phone.
- [ ] On the phone: **Settings → Privacy & Security → Developer Mode** → toggle ON, restart phone.
- [ ] Back in Xcode: select your iPhone in the device picker (top toolbar, next to the scheme), then `Cmd+R` to build and install.
- [ ] First launch on the phone: **Settings → General → VPN & Device Management** → tap your Apple ID → **Trust**.
- [ ] Launch Mabel. Grant microphone permission when prompted.
- [ ] Record a 30-second test memory in Chapter 1. Confirm: audio captures cleanly, transcription returns, narrative generates. This is the real eval of the entire pipeline.

### Wi-Fi debugging (one-time setup, then no cable needed)
- [ ] Window → Devices and Simulators → select your iPhone → check "Connect via network"
- [ ] After this, you can deploy from terminal/Xcode without the cable as long as Mac and iPhone are on the same Wi-Fi.

### Upgrade trigger to paid program
Pay the $99 when you want any of:
- Family members on their own phones (TestFlight distribution)
- 1-year provisioning instead of 7-day rebuild cycle
- Eventually, App Store submission (out of scope for personal use)

### Device-only verification
- [ ] Audio interruption test: start recording, then call yourself from another phone. Confirm Mabel handles the interruption gracefully (pauses or stops cleanly — current behavior unknown, possible Phase 1 bug).
- [ ] Background test: start recording, lock the phone for 30s, unlock. Confirm recording state survives.
- [ ] Storage test: record memory, force-quit Mabel from app switcher, relaunch. Confirm the memory is still there (already covered by Phase 1.4 verification, but worth doing on real device too).

---

## Phase 1 — Make personal use safe (Weeks 1–2, ~10 hrs)

Goal: you can record real family stories without losing data or staring at blank screens.

### 1.1 Visible error alerts on AI failures
- [ ] `Mabel/Mabel/Views/RecordingView.swift` — `isProcessing = true` at line 333 is set but never displayed. Add a blocking overlay during `saveMemory()` with the existing `MabelStyle` spinner.
- [ ] On save failure, show `.alert("Couldn't save your memory", ...)` with Retry / Keep buttons. Use design tokens (`MabelColors`, `MabelTypography`).
- [ ] `Mabel/Mabel/Views/ChapterReviewView.swift` — `errorMessage` already displays inline at line 100. Promote to an `.alert()` modifier so a generation failure can't be missed when scrolling. Retry button calls existing `regenerateNarrative()`.

### 1.2 Processing banner during in-progress memories
- [ ] `Mabel/Mabel/Views/RecordingSetupView.swift` — the existing `chapterCompleteView` shows a "Processing your memories..." spinner only when 5/5 are recorded. Surface the same indicator at the top of the memory list whenever ANY memory is `.processing`. Reuse the existing component; don't build new UI.

### 1.3 Verify `MemoryCard` shows `.processing` state
- [ ] Confirm the per-memory card in the list shows a spinner while transcription/generation runs. If it doesn't, add one. (Token: `MabelColors.mabelPrimary`.)

### 1.4 End-to-end verification
- [ ] Wifi off mid-recording → alert with retry → re-enable → retry → succeeds
- [ ] Force-quit during processing → reopen → memory shows `.failed` with retry button (already exists)
- [ ] Record a memory mid-flight → see processing banner at top of memory list, not just on chapter completion

**Out of scope for Phase 1:** copy refinement, animation polish, design uplift, mascot work. These are branding — paused.

---

## Phase 2 — Dynamic AI Questions, properly (Weeks 3–5, ~25 hrs)

The base API is built; the productizing isn't. Five concrete gaps.

### 2.1 Persist generated questions across sessions
Right now `loadPrompts()` regenerates on every chapter open — wasteful, slow, and forgets which questions you've already seen.

- [ ] `Mabel/Mabel/Models/Chapter.swift` — add a `GeneratedQuestion` struct and a `generatedQuestions: [GeneratedQuestion]` array on `Chapter`:
  ```swift
  struct GeneratedQuestion: Codable, Identifiable, Hashable {
      let id: UUID
      let text: String
      let generatedAt: Date
      var wasShown: Bool
      var wasUsed: Bool
  }
  ```
  Use `decodeIfPresent` for backward compat with existing `chapters.json`.
- [ ] `Mabel/Mabel/Views/RecordingSetupView.swift` `loadPrompts()` — rewrite to:
  1. If `chapter.generatedQuestions.filter { !$0.wasUsed }.count >= 3`, use those (no API call).
  2. Else call `generateChapterQuestions()`, passing `previouslyAskedQuestions: chapter.generatedQuestions.map { $0.text }` for de-dup.
  3. Persist results onto `chapter.generatedQuestions`. Trigger AppState save.
  4. On API failure, fall back to `ChapterPrompts` (Phase 2.5 will replace this with StoryCorps-seeded fallbacks).

### 2.2 Use full `UserProfile` context in prompts
- [ ] `Mabel/Mabel/Services/OpenAIService.swift` — rename `generatePrompts()` (line 217) to `generateChapterQuestions()`. Accept the full `UserProfile`. Inject `relationship` and `topicsOfInterest` into the system prompt. (Today only `userName` is used.)
- [ ] Keep the existing `previousMemories` wiring; cap at 8 most recent memories truncated to 200 chars (existing pattern at line 230).
- [ ] Add a `previouslyAskedQuestions: [String]` parameter and a "Avoid repeating these questions: [...]" rule in the system prompt.

### 2.3 Mark questions as shown/used
- [ ] When a `SuggestionCard` is tapped in `RecordingSetupView`, set `wasShown = true` for the matched question and persist.
- [ ] When the recording for that question completes (in `StoryProcessingService` or via a callback), set `wasUsed = true`. Plumb the question ID through `RecordingDestination` (it's `Hashable`; add an optional `UUID`).

### 2.4 Background regeneration after each memory
- [ ] `Mabel/Mabel/Services/StoryProcessingService.swift` — at the end of `processMemory` and `processTypedMemory` (after the narrative saves), kick off a non-throwing `Task` that calls `generateChapterQuestions()` for the same chapter, replacing `generatedQuestions` with a fresh batch that knows about the just-saved memory. Skip if `chapter.completedMemoryCount >= 5`.
- [ ] Add a per-chapter `isGeneratingQuestions: [Int: Bool]` guard in `AppState` to avoid races if the user records twice quickly.

### 2.5 Seed prompt construction with the StoryCorps "Great Questions" canon
This is the most-tested set of memoir interview prompts in existence (StoryCorps has been collecting oral histories since 2003). Use it two ways:

- [ ] **As few-shot examples in the GPT-4o system prompt.** When generating questions for a chapter, sample 5–8 questions from the matched StoryCorps category and inject them into the system prompt as "Examples of well-crafted memoir questions in this style: [...]". This anchors the model's tone (warm, specific, evocative) instead of letting it drift toward generic "Tell me about a time when..." filler.
- [ ] **As an upgraded static fallback.** Replace the generic strings in `ChapterPrompts.swift` with category-matched StoryCorps questions. When the API fails, the user still gets canon-quality prompts, not boilerplate.

**Implementation:**
- [ ] Convert the RTF at `/Users/chrissqueff/Desktop/MABEL/Mabel_Set-of-Questions.rtf` to a structured JSON file. Commit as `Mabel/Mabel/Resources/storycorps-questions.json` so it ships in the app bundle. Schema: `{ category: string, questions: string[] }[]`.
- [ ] Add an attribution comment at the top of the JSON: `// Source: StoryCorps Great Questions, used under fair use for personal memoir prompts. https://storycorps.org/participate/great-questions/`. Mention the source in the app's About/Profile screen as well.
- [ ] Add `Mabel/Mabel/Models/StoryCorpsCategory.swift` enum with the 17 categories (see appendix). Map each `Chapter` to one or more categories. The mapping below is a starting point — refine after Phase 3 use.
- [ ] In `OpenAIService.generateChapterQuestions()`, look up the chapter's primary StoryCorps category, pick 5 random questions, inject as few-shot examples. Re-randomize per call so questions stay fresh across regenerations.

**Chapter → StoryCorps category mapping (starter):**
| Mabel Chapter | StoryCorps category |
|---|---|
| Childhood / Early Memories | GROWING UP, FAMILY HERITAGE |
| School Days | SCHOOL, TEACHERS |
| Coming of Age | GROWING UP, LOVE & RELATIONSHIPS |
| Career / Work | WORKING |
| Marriage / Partnership | MARRIAGE & PARTNERSHIPS, LOVE & RELATIONSHIPS |
| Becoming a Parent | RAISING CHILDREN |
| Family & Heritage | FAMILY HERITAGE, GRANDPARENTS, PARENTS |
| Faith / Beliefs | RELIGION |
| Wisdom / Reflection | GREAT QUESTIONS FOR ANYONE |
| Legacy | GREAT QUESTIONS FOR ANYONE, REMEMBERING A LOVED ONE |

(Adjust based on your actual 10-chapter titles in `Chapter.allChapters`. Verify against current code before mapping.)

### 2.6 End-to-end verification (your ear is the only judge)
- [ ] Record a Chapter 1 memory mentioning a specific person ("my brother Tom"). Wait 30s. Open Chapter 2 → suggestion cards should reference Tom or siblings.
- [ ] Record 3 memories in Ch1. Each batch of suggestions should be visibly different from the prior batch (no repeats).
- [ ] Force-quit and reopen → previously generated questions are still visible without a network call (no spinner on chapter open).
- [ ] Disable wifi → StoryCorps-seeded fallback shown (no generic placeholder text).
- [ ] Read 5 generated questions per chapter aloud. Do they sound like a thoughtful biographer, or like a chatbot? (StoryCorps few-shot examples should pull tone toward the former.)

**Token cost estimate:** ~$0.001 per question batch × ~4 batches/chapter × 10 chapters ≈ **$0.04 per book**. Negligible.

---

## Phase 3 — Use it for real (Week 6 onward, ongoing)

The whole point. Record your own family content. Notes go directly into the codebase as issues or as fixes.

- [ ] Pick one family story you've been meaning to capture. Record it end-to-end through Mabel. Time it. Note every friction point.
- [ ] Repeat with a second story in a different chapter — this is when context-aware questions actually get tested.
- [ ] Start `Mabel/decisions/personal-use-notes.md` (gitignore if you'd rather keep it private). Log what you wanted to do but couldn't, what felt wrong, what felt good. Branding decisions for Phase 4 fall out of this.

There is no "done" checkbox for this phase. The bar is: did Mabel help you capture stories you wouldn't otherwise have captured?

---

## Cleanup (anytime, ~2 hrs total)

These are loose ends from the branding cycle that will create cognitive load if left:

- [ ] `DesignConceptPrototypes.swift` still contains Profile concepts from the last design cycle (scaffolding, not production). Delete or move to `Mabel/archive/`.
- [x] `Mabel/font-comparison/`, `Mabel/screenshots/`, `Mabel/updated_mocks/stoic-app-onboarding-example/` parked on the `branding-paused` branch (commit `20b02c4`). `git checkout branding-paused` brings them back when Phase 4 resumes. (2026-05-04)
- [ ] The OLD pixel-art `MabelMascot` asset is still in use. Per your direction, leave it. The Fiverr swap waits until Phase 4.

---

## Critical files

- `Mabel/Mabel/Services/OpenAIService.swift` — extend `generatePrompts()` (rename to `generateChapterQuestions`) at line 217
- `Mabel/Mabel/Services/StoryProcessingService.swift` — add post-process question regeneration hook
- `Mabel/Mabel/Models/Chapter.swift` — add `GeneratedQuestion` struct + `generatedQuestions` array (with `decodeIfPresent`)
- `Mabel/Mabel/Models/AppState.swift` — add `isGeneratingQuestions: [Int: Bool]` race guard
- `Mabel/Mabel/Views/RecordingSetupView.swift` — rewrite `loadPrompts()` line 421 to read/write `chapter.generatedQuestions`; mark `wasShown`/`wasUsed`
- `Mabel/Mabel/Views/RecordingView.swift` — add `isProcessing` overlay + `.alert()` on save failure (currently `isProcessing` is set at line 333 but never displayed)
- `Mabel/Mabel/Views/ChapterReviewView.swift` — promote inline `errorMessage` (line 100) to `.alert()` modifier with Retry calling existing `regenerateNarrative()` (line 205)

---

## Verification end-to-end

1. **Phase 0 reality check:** journal what already works in seeded data.
2. **Phase 1:** wifi-off recording → visible alert with retry. In-progress memory shows banner.
3. **Phase 2:** record a memory mentioning a specific person/place; close and reopen the next chapter; suggestion cards reference that detail; force-quit and reopen → no spinner on chapter open (questions persisted).
4. **Phase 3:** record one of your own family stories from start to finish.

---

## Risk register

- **Cross-chapter context bloat at chapter 8+** — 30+ prior memories at 200 chars each ≈ 6k tokens. Cap at 8 most-recent across all chapters. Heuristic-only; embedding retrieval is out of scope.
- **Question quality is subjective.** No automated eval. You ARE the evaluator — that's by design for personal-use scope.
- **`completedMemoryCount` includes `.processing`** (Chapter.swift line 15). When memory 5 is still processing, the chapter shows 5/5 and switches to `chapterCompleteView`. Skip question regeneration when `completedMemoryCount >= 5` to avoid wasted calls.
- **Branding drift.** You've now spent 10 weeks in branding mode. Resist the urge to "just polish one thing" mid-functionality work. Phase 4 is when branding resumes — protect that boundary.

---

## Appendix A — StoryCorps "Great Questions" canon (reference for Phase 2.5)

Source: StoryCorps Great Questions, https://storycorps.org/participate/great-questions/ (the source RTF lives on the maintainer's local machine and should be converted to JSON during Phase 2.5). Convert to a structured JSON file and ship at `Mabel/Mabel/Resources/storycorps-questions.json`.

**The 17 categories in the canon:**

1. **GREAT QUESTIONS FOR ANYONE** — universal life-story prompts
2. **FRIENDS OR COLLEAGUES**
3. **GRANDPARENTS**
4. **RAISING CHILDREN**
5. **PARENTS**
6. **GROWING UP**
7. **SCHOOL**
8. **TEACHERS**
9. **LOVE & RELATIONSHIPS**
10. **MARRIAGE & PARTNERSHIPS**
11. **WORKING**
12. **RELIGION**
13. **SERIOUS ILLNESS**
14. **FAMILY HERITAGE**
15. **MILITARY** (largest section, includes "Remembering the Fallen")
16. **REMEMBERING A LOVED ONE**
17. **JUSTICE**

**Representative samples** (not the full canon — the JSON file is the source of truth):

> ### GREAT QUESTIONS FOR ANYONE
> - Can you tell me about the important people in your life?
> - What have been some of the happiest moments in your life? The saddest?
> - Who has been the biggest influence on your life? What lessons did that person teach you?
> - What is your earliest memory?
> - What are you proudest of?
> - How has your life been different than what you'd imagined?
> - For generations listening to this years from now, is there any wisdom you'd want to pass on?
>
> ### GROWING UP
> - When and where were you born?
> - What was your relationship like with your parents?
> - Did you have a nickname? How'd you get it?
> - How would you describe a perfect day when you were young?
> - What did you think your life would be like when you were older?
>
> ### LOVE & RELATIONSHIPS
> - When did you first fall in love?
> - Can you tell me about your first kiss?
> - What lessons have you learned from your relationships?
> - Who were the "ones that got away" in your life?
>
> ### RAISING CHILDREN
> - When did you first find out that you'd be a parent? How did you feel?
> - Can you describe the moment when you saw your child for the first time?
> - How has being a parent changed you?
> - Do you have any favorite stories about your kids?
>
> ### REMEMBERING A LOVED ONE
> - What is your first memory of _____?
> - What is your most vivid memory of _____?
> - What did _____ mean to you?
> - What would you ask _____ if _____ were here today?

**How to use these in the prompt** (sketch — implementation in Phase 2.5):

```
SYSTEM PROMPT (excerpt):
"You are Mabel, a warm interviewer helping {userName} write their memoir.
Generate {count} thoughtful questions for a chapter about '{chapterTopic}'.

Examples of well-crafted memoir questions in this style:
- {randomly sampled question 1 from matched StoryCorps category}
- {randomly sampled question 2}
- {randomly sampled question 3}
- ...

The narrator has previously shared:
- Memory 1: {truncated narrative}
- Memory 2: ...

Reference specific names, places, or relationships from these memories where natural.
Avoid repeating these questions: {previouslyAskedQuestions}

Rules: single question, warm and conversational, under 120 chars, one per line."
```

The few-shot examples anchor tone and specificity. Without them GPT-4o tends toward generic "Tell me about a time when..." filler. With them, the model produces questions in the StoryCorps voice — specific, evocative, emotionally-grounded.

**Attribution:** when you ship the JSON, credit StoryCorps in the file header and on the app's Profile/About screen. Their canon is published for public use under their Open Voices license, but credit is right.
