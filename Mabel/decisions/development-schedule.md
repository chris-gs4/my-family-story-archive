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
- [x] Disable network → record a memory → noted what happens. (2026-05-04 — see findings below.)
- [x] Confirmed AI prompts reference earlier content. Chapter 2 prompts pulled "farmhouse," "porch," "backyard bakery," "siblings" directly from Chapter 1 memories. Context-aware generation is wired correctly. (2026-05-04)

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
- **2026-05-04 — Generated prompts are too long (Phase 2.5 target).** Confirmed via Chapter 2 test: GPT-4o produces prompts in the 89–104 char range, technically within the existing "under 120 characters" rule but well above the StoryCorps canon's typical 30–60 chars. Examples from the test: *"What family traditions did you cherish while growing up in the farmhouse with your siblings?"* (92 chars). Phase 2.5 should explicitly add a tighter length constraint (~70 char max) AND lean on StoryCorps few-shot examples to pull tone toward punchy/specific instead of meandering/comprehensive. Few-shot anchoring is the higher-leverage lever — adjusting the char cap alone won't fix the meandering style.
- **2026-05-04 — UX idea (deferred, not in current scope): two-screen recording flow has redundant taps.** Tapping the big green mic on `RecordingSetupView` navigates to `RecordingView`, which shows another big green mic that you tap *again* to actually start recording. Two visually-identical mics across two screens for one action. The setup-screen copy literally says *"Tap the mic and start speaking"* — which now navigates instead of records. Modern voice apps (iOS Voice Memos, WhatsApp) record on touch-down. Worth revisiting during the eventual UX pass — could be: setup-screen mic starts recording inline; or kill the dedicated `RecordingView` and merge into setup; or keep two screens but rename setup-screen copy to *"Tap to begin"*. Not a Phase 1/2 task; consider during Phase 4 design refresh.
- **2026-05-04 — Hero mic button on `RecordingSetupView` had no tap action (FIXED, commit `c7f52a5`).** The big green mic button at the top of every chapter recording screen was a pure visual `ZStack` with no `Button`/`NavigationLink`/`.onTapGesture`. The `.accessibilityHint("Double tap to start recording")` lied — there was no action. Tapping the mic did nothing; users were forced to pick a prompt card to record anything. Wrapped the ZStack in a `NavigationLink` with `prompt: nil` for free-form recording. **This is the kind of regression Phase 0 exists to find** — the UI looked complete but a critical interaction was inert.
- **2026-05-04 — Network-off recording flow has BETTER error UX than the audit suggested.** Tested recording with Wi-Fi off:
  - Audio capture works fine offline (correct — `AVAudioRecorder` is local).
  - On Stop & Save, the memory enters `.failed` state. The `MemoryCard` in the list renders with a **red warning triangle**, the prompt text, the duration, and **retry + delete icons**. Data is preserved on disk; the user can retry when back online.
  - **What's missing:** no `.alert()` or banner appears at the moment of failure to explicitly tell the user "transcription failed because you're offline." The user has to look at the list and decode the red triangle. This is what Phase 1.1 should add — not a from-scratch error system, but an explicit alert at the moment of failure to make it unmissable. The persistent failed-state UI in the list is already healthy.
- **2026-05-04 — Pre-rebrand copy still in `WelcomeView`.** Welcome reads "Your AI-assisted ghost writer. Capture your stories and write a book for future generations. No typing, just talking." The current positioning is "Your memoir companion. Just talk — Mabel writes." Functionality-adjacent (it's the first thing the user sees). Decide in Phase 1 whether to fix now or hold for Phase 4 branding cycle.
- **2026-05-07 — Phase 0.5 device deploy: SetupView name field froze again on real iPhone (FIXED, MabelShadows.swift).** The `.animation()` fix on 2026-05-04 (commit `87160c2`) masked the symptom on the simulator but did NOT remove the underlying layout-loop trigger. On real-device timing, tapping the name field still froze the app. Root cause: `InputShadowModifier.body` returned a *different view-tree shape* depending on `focused` — `if focused { content.shadow().shadow() } else { content.shadow() }`. When `isNameFocused` flips, SwiftUI tears down one branch and rebuilds the other (a structural identity change, not just a property change), and concurrently the keyboard appears and the ScrollView auto-avoids — same conditions that drive the infinite layout pass. Fix: collapse the two branches into a single chain that always emits two `.shadow()` modifiers; toggle the glow shadow's color/radius (not its existence) via the `focused` flag (`Color.clear`, radius 0 when unfocused). View identity now stays stable. Same modifier was used by the "Other" relationship field, which is also fixed by the same change. **Generalizable lesson:** any focus- or state-driven `ViewModifier` whose `body` uses `if/else` to return different chains is a freeze risk on real device — prefer property interpolation over structural branching. Applies to all custom modifiers, not just shadows.
- **2026-05-07 — Mabel had no dark-mode support; rendered illegibly on a phone in dark mode (RESOLVED for now via opt-out, MabelApp.swift).** On the user's iPhone (system dark mode) the Library screen showed white cards on a dark scaffolding with washed-out text — chapter title and "0 of 5 memories recorded" were nearly unreadable. Despite `Mabel/CLAUDE.md` claiming "all colors auto-switch light/dark," the actual `MabelColors` tokens are static hex values, not adaptive `UIColor.dynamicProvider` colors. Only `MabelShadows` reads `@Environment(\.colorScheme)`. Treating Mabel as light-only is consistent with current design; building proper dark-mode support is design work and Phase 4 territory. Decision: pin Mabel to light mode regardless of system setting via `.preferredColorScheme(.light)` on the root `WindowGroup` view. One-line opt-out, zero design work, user keeps system dark mode for everything else. Revisit during Phase 4 branding cycle to either build adaptive tokens or formally document "light mode only" as a product decision.
- **2026-05-13 — CRITICAL: GPT-4o fabricates memoir content on garbage transcripts (NEW Phase 1.0 task).** On real iPhone, recorded "test, test, is animation working" for ~5 seconds. App produced a polished Childhood narrative about a fictional Maple Street house with walls that "whispered stories of our lively family." Root cause: `OpenAIService.generateNarrative()` line 92–96 system prompt instructs the model to *"transform this transcript into a polished, first-person narrative paragraph suitable for a chapter about [topic]"* with no refusal clause. On non-substantive input GPT-4o has no permitted exit and confabulates. **This is a data-integrity bug, not a UX bug** — for a memoir app, invented family stories are worse than crashes. Same flaw exists in `generateChapterNarrative()` line 162–166. Real users will hit this every time they pause to think mid-recording, get interrupted, record in noise, or tap Stop too early. Fix shape: (a) add refusal sentinel to the system prompt, (b) detect sentinel in `StoryProcessingService` → mark memory `.failed` with copy like "We couldn't hear a memory in that recording — try again?", (c) optional transcript-length floor (<8 words / <40 chars) → skip the API call entirely.
- **2026-05-13 — Free-form (no-prompt) memories show "Memory 2 / 3 / 4" as title (Phase 1.5 polish target).** When a user taps the hero mic and records without picking a suggestion card, `promptUsed` is empty/nil, so the memory card falls back to the index-based label. Uninformative and breaks the memoir feel — a real chapter shouldn't read "Memory 2: I remember the house on Maple Street as if it were yesterday…" Cheap fix: derive title from first ~60 chars of the generated narrative (no API call). Better fix in Phase 2: one-shot GPT-4o call to generate a 4–6 word title from the narrative (~$0.0001/memory).
- **2026-05-13 — Stop & Save flow felt fine on real device (informs Phase 1.1 scope).** No anxiety from the immediate-dismiss + list-spinner pattern. Phase 1.1 overlay work can stay minimal — option (a) (brief sync-save overlay) over option (b) (defer dismiss until pipeline completes). Don't over-engineer 1.1.
- **2026-05-13 — Future idea (deferred, Phase 4+): "writing style" presets keyed to famous memoirists** — Hemingway, Didion, Sedaris, McCourt, etc. User picks a voice; AI anchors narrative tone using few-shot passages from that author. Needs real research: just naming an author in a prompt gives weak/cliché results vs. anchoring with actual prose excerpts. Not a personal-use blocker; revisit when going public. Potential paid-tier differentiator.
- **2026-05-13 — Phase 1.0 smoke test on real device: 3/3 fail cases verified.** Recorded via HTML test-script preview (`/tmp/mabel-smoke-test.html`, the format worked well — keep using it for future smoke tests). Test 1 ("test test test") → Whisper transcribed as Korean "테스트 테스트 테스트" (8 chars, well under length floor) → `.failed` with friendly copy. Test 2 ("uh") → "Uh..." → `.failed`. Test 3 (5s silence + ambient lounge music) → Whisper hallucinated "Thank you for watching the video." (6 words, 33 chars, below the 8-word / 40-char floor) → `.failed`. All three memory cards show red triangle, friendly copy, retry+trash icons. Phase 1.0 verified end-to-end on real hardware.
- **2026-05-13 — Pre-existing "Processing failed" banner in `RecordingSetupView.chapterCompleteView` (lines 210–230) correctly surfaces the 1.0 friendly copy.** The banner fires whenever any memory in the chapter is `.failed` and shows the first failed memory's `errorMessage`. Already in the codebase pre-1.0; we just hadn't seen it populate with friendly text before. Tonight it showed "We couldn't hear a memory in that recording…" — confirms 1.0 wiring is correct through this UI surface. Minor wart: surfaces only the *first* failed memory's message even when multiple have failed. Not urgent.
- **2026-05-13 — NEW Whisper bug #1: language auto-detect misfires on short clips (Phase 1.7 target).** "test test test" came back as Korean script. Whisper's auto-detect can latch onto wrong languages on brief/ambiguous audio. Fix: pass `language: "en"` form field in `OpenAIService.transcribeAudio()` multipart body. One-line change.
- **2026-05-13 — NEW Whisper bug #2: "Thank you for watching the video" hallucination on silence/music (Phase 1.7 target).** Famous community-known Whisper artifact — its training data heavily contained YouTube videos with that outro phrase. On silence or non-speech audio, the model confidently outputs this exact phrase. Length floor caught it tonight (6 words, 33 chars), but a 30s sample with continuous background music would likely produce a longer hallucination passing the floor and reaching GPT-4o, which would then fabricate a "video watching" memoir paragraph. Defense: hallucination-phrase filter + Whisper `no_speech_threshold` tuning.
- **2026-05-13 — 1.5 partial verification: title is correctly derived from narrative but too verbose (Phase 1.6 target — bumped up).** Test 4 (swimming hole, ~30s recording) succeeded. Memory card title: *"One of my favorite summer memories is of the old swimming..."* — derivation working as designed (60 chars + ellipsis), NOT "Memory 4". But user feedback: this is too long; want ~3 evocative words like *"Summer Swimming Hole"* or *"Memories from Swimming"*. Simple truncation can't produce that — promoted the Phase 2 GPT-generated title work to Phase 1.6.
- **2026-05-13 — UX: hero mic disappears when chapter is "complete" (Phase 1.8 target).** Once a chapter hits 5/5 memories (including failed ones), `RecordingSetupView` switches from `recordingUI` to `chapterCompleteView` at the conditional on line 54. The mic button is gone. User can't add a 6th memory to an approved chapter even if they want to. User wants the layout *always* ordered: mic on top → memory list → chapter status at bottom — never replaced. Also implies lifting the hard 5-memory cap (currently `Chapter.memoriesPerChapter = 5` blocks recording beyond that). Recommended behavior: approval is sticky; new memories appear in the list but don't retroactively change the approved narrative.
- **2026-05-13 — HTML smoke-test preview format (`/tmp/mabel-smoke-test.html`) worked well — keep using it for future smoke tests.** User specifically called this out as a useful workflow: dummy data presented in a readable on-screen page, color-coded by expected outcome (burgundy for FAIL tests, green for PASS tests), with verification checklists per script. Re-use the same structure for Phase 1.6 / 1.7 / 1.8 smoke tests next session.
- **2026-05-18 — Phase 1.0 refusal clause was too aggressive — produced false negatives on valid memoir memories (PATCHED).** Surfaced during Phase 1.6 smoke testing. The Mrs. Hollis butterscotch script (a clearly substantive 32-second memoir paragraph about a neighborhood lady, recorded in Chapter 2 "Family") came back as `.failed`. Xcode console showed `Model returned no-content sentinel for memory ...` on both the initial attempt and the retry — i.e. GPT-4o was consistently returning `__NO_CONTENT__` for a real memory. Root cause: the Phase 1.0 system prompts in `generateNarrative()` and `generateChapterNarrative()` listed "off-topic" alongside "test recording / silence / noise" as a refusal trigger, AND framed the chapter topic as a constraint ("suitable for a chapter about ..."). With Chapter 2's topic being *"Parents, siblings, family traditions and dynamics"*, GPT-4o classified Mrs. Hollis (a neighbor) as off-topic and refused. Patch: rewrote both prompts to (a) frame chapter topic as *loose context, not a constraint*, (b) explicitly permit memories about neighbors, objects, adjacent moments, and people other than the narrator, (c) narrow the refusal rule to mic-checks / filler / Whisper hallucinations only, with "when in doubt, write the paragraph" as the default. The Phase 1.7 hallucination filter + length floor still cover the actual garbage-input cases. Existing failed Mrs. Hollis memory can be revived via the retry button after redeploy — no re-recording needed. **Lesson worth remembering:** any LLM refusal clause that lists multiple OR'd triggers will over-fire on the soft ones. Be explicit about what counts as substantive and put a "when in doubt" default at the end. (2026-05-18)
- **2026-05-18 — Phase 1.6 (AI memory titles) verified end-to-end.** Committed implementation f37ff72; refusal-clause patch dcfca45 unblocked the smoke test. Two verification recordings: (1) Mrs. Hollis → "Mrs. Hollis and the Butterscotch" — but that phrase is also in the in-prompt example list, so only verified the swap mechanic, not generalization. (2) Custom sibling-fight script (backyard rose bush + grape popsicle, zero example overlap) → **"Rose Bush and Popsicle Wars"** — genuinely composed, pulled two specific script details, title-cased, slightly playful tone. Generalization confirmed: the model isn't just parroting examples. The 60-char derivation does flash briefly before the AI title arrives, exactly as designed. Title gen is non-blocking so the chapter narrative path is unaffected.
- **2026-05-18 — context-aware prompt generation already working (visible during the sibling-fight test).** The recording screen's "or pick a prompt" card surfaced *"What unique family traditions did you cherish during those lively Sunday por[ridge mornings] with your mother?"* — clearly pulled from the pancakes memory tonight ("Sunday", "mother"). This is the dynamic-questions feature Phase 0 confirmed in code; nice to see it producing on-tone, context-specific suggestions on real-device too. Phase 2 will further harden this (persistence across sessions, full UserProfile context, StoryCorps few-shot for tone) but the base wiring is healthy.
- **2026-05-18 — Phase 1.7 verified on real device, 3/3.** Smoke-tested in Chapter 2 (see Phase 1.8 finding below). Test 1 (pancakes script read aloud with soft ambient music incidentally playing in the background) succeeded — Whisper handled the substantive English speech-over-music without issue, GPT-4o generated a full pancakes/mother/brother narrative, derived title fell back to the 60-char Phase 1.5 path. Test 2 ("test test test", ~3s) — last session this came back as 테스트 테스트 테스트; tonight it came back as clean English "test test test" and the existing length-floor caught it as `.failed`. Language pin verified. Test 3 (20s silence with continuous background music) — `MemoryCard` shows red triangle, retry+delete, *empty* subtitle. The empty subtitle is direct evidence the hallucination filter caught a known artifact (likely "Thank you for watching") and nulled the transcript before the length-floor saw it. No fabricated "Maple Street" narrative anywhere. Phase 1.7 closes.
- **2026-05-18 — Phase 1.8 bug confirmed blocking real-device testing.** Attempted to run the 1.7 smoke tests in Chapter 1 (the natural starting place, since it had the dummy memories from last session). Chapter 1 was at 5/5 / approved, so `RecordingSetupView` had switched to `chapterCompleteView` and the hero mic was *gone* — no way to record a 6th memory. Routed around by switching to Chapter 2 (empty, mic present). This is the exact symptom the Phase 1.8 spec describes; tonight upgraded it from "design wart" to "blocks real testing". Adds urgency to 1.8 — even if the user only wants 5 memories per chapter long-term, the inability to record into a finished chapter for *any* reason (including verifying a code change) is hostile.
- **2026-05-18 — `MemoryCard` failed-state subtitle bug (small fix, roll into 1.8).** Test 3 surfaced this: when the hallucination filter or length-floor nulls the transcript, the failed `MemoryCard` has no informative subtitle — just title + duration + red triangle + retry/delete. Test 2 happened to show "test test test" as the subtitle because the transcript survived Whisper but failed the length-floor; Test 3 showed nothing because the filter emptied the transcript first. Root cause: the card renders `transcript` as the failed-state body text, not `errorMessage`. The friendly copy ("We couldn't hear a memory in that recording…") only surfaces in the chapter-complete banner (`RecordingSetupView.chapterCompleteView` lines 210–230), which only renders at 5/5 memories. A user with <5 memories who hits a failure has no on-screen explanation of why. Fix: in `MemoryCard`, prefer `errorMessage` over `transcript` for the failed-state subtitle (or render both). Tiny change, batch it into the Phase 1.8 commit since we're already in that file's neighborhood.
- **2026-05-18 — UX gap: memory cards on the recording list are not tappable to view their narratives.** Visible in tonight's Chapter 2 test — once Memory 1 (pancakes) completed successfully, tapping the card did nothing. The full narrative is generated and stored, but the user has no way to read it back until the chapter hits 5/5 and the chapter-review flow opens. For a memoir app this is the wrong shape: the user wants to scrub their just-recorded memory to confirm it captured what they said. Not a Phase 1.7 blocker, but it'll keep biting once we ask users to record real family stories. Candidates: (a) tap-to-expand inline on the card, (b) tap to navigate to a per-memory detail view, (c) bake into the Phase 1.8 layout rework. Recommend (a) — cheapest, no nav change, no new view. Defer to Phase 1.8 or as standalone polish.
- **2026-05-20 (later) — Phase 1.8 follow-up after on-device review.** First on-device test of the 1.8 build surfaced three things, all addressed in a follow-up commit:
  - **Reversed the sticky-approval decision.** The user recorded a 6th memory into the 5/5 approved Childhood chapter ("What adventures did you and your siblings…", prompt-driven) and immediately asked how that bonus memory would "mix in" to the published narrative. Sticky approval left it floating outside — fine for a state machine, wrong for an e-book. New rule: any memory completing in a 5+ chapter triggers regeneration; `updateNarrative()` revokes approval so the user re-reviews the woven version. `generateChapterNarrative` prompt updated: hardcoded "5 individual memory narratives" → `\(memories.count)`, and added an explicit reordering instruction ("the memories above are listed in the order they were recorded, NOT the order they should appear in the chapter. Reorder them thematically so the chapter reads as a coherent narrative"). The user explicitly said "if it's on top of the first paragraph, great. It doesn't matter really when the memory was recorded" — that's the spec for the new prompt.
  - **Discrete approval indicator at the top.** Existing "Chapter approved!" full-screen view at the bottom stays; added a small `checkmark.seal.fill` (mabelPrimary, 14pt) inline before the "5/5" count in the chapter badge row. Visible only when `isApproved`. So a bonus-memory recording naturally revokes approval → the checkmark disappears → the bottom CTA flips back to "REVIEW CHAPTER". Visual state machine is now self-consistent with the data-state machine.
  - **AI title fallback reordered: `generatedTitle` > `promptUsed` > derived.** Original order was `promptUsed` first, so prompt-driven memories displayed the full prompt verbatim ("What adventures did you and your siblings create in your cozy make-shift...") even when an AI title had been generated. The 4th memory in tonight's test showed this. The AI title is from the narrative, which always reflects what the user actually said — so it's a better display title than the original prompt. The prompt remains the second-tier fallback for pre-1.6 memories that have no `generatedTitle` yet.
  - **One-shot launch backfill for legacy AI titles.** Added `StoryProcessingService.backfillMissingTitles(appState:)` — scans every chapter for processed memories that have `narrativeText` but no `generatedTitle`, sequentially calls `generateMemoryTitle` for each. Sequential rather than concurrent to stay polite to the OpenAI rate limit on launch. Hooked into `MabelApp.body`'s `.task` next to the existing `processStuckTypedEntries()` call. Cost is ~$0.0001/memory × <50 legacy memories ≪ $0.01 one-time. The user's existing chapter-1 trio ("My earliest memories...", "Growing up in our bustling...", "One of my favorite summer memories...") should pick up titles on next launch.
  - **Lesson worth noting:** the original (a) sticky-approval recommendation was made before considering the e-book downstream. It optimised for state-machine simplicity but ignored the product's actual end-state. Whenever an approval/freeze decision interacts with a downstream artifact (publish-to-book, generate-audiobook, export-PDF), the default should be regen-and-revoke, not sticky. Sticky-then-bonus only makes sense when the freeze itself is the product, e.g. a published snapshot like a blog post. Memoir chapters are the opposite: they want completeness over snapshot-fidelity.
- **2026-05-23 (later, on-device review) — overlay reverted, toast functional but needs visual polish.** First device test: the "Saving your memory…" overlay flashed in ~100ms and the user immediately said it "seems like a mistake" — confirmed the corollary that confirmations under ~500ms are worse than no confirmation at all (silent success looks intentional; flash-failure looks like a glitch). Removed the overlay + the Task wrapper that existed only to schedule its render frame; reverted `saveMemory()` to a sync function with the same failure-alert path. The capture toast on RecordingSetupView is functionally correct (timing right, content right, fires after every memory-count increment regardless of audio vs typed) but the user called the visual styling out as "ugly and bad UI." Promoted a new Phase 1.1.5 polish item; the easiest path is `/design-uplift` over the current toast to generate 3 competing concepts. The two failure alerts (save-failure on RecordingView, regen-failure on ChapterReviewView) were not actively exercised tonight — they're rare-path safety nets and don't block the session close. Build remained clean after revert. Net day: Phase 1.8 fully closed (T4 verified including AI-title generalization on the music-box recording), Phase 1.1 mostly closed (3/4 sub-tasks shipped + 1 deliberately removed), 2 memories saved (cost ceiling + state-change-visibility with new sub-rule about minimum dwell time).
- **2026-05-23 — Phase 1.1 implemented (4 sub-tasks, one commit), build clean, pending device smoke test.** Touched three views:
  - `RecordingView.swift`: `saveMemory()` async-wrapped so the new `savingOverlay` (dim scrim + `ProgressView` + "Saving your memory…" card) actually renders before dismiss. Added save-failure `.alert("Couldn't save your memory", …)` with **Try again** / **Discard**. The "Retry/Keep" naming in the original spec was renamed because `result == nil` means there's no audio file to "keep" — the semantics are re-record or throw it away.
  - `ChapterReviewView.swift`: ripped out the inline `errorMessage` block from inside the narrative card and replaced with a top-level `.alert("Couldn't regenerate chapter", …)`. Pre-existing `feedback` state is preserved through error, so the Try again button silently re-runs with the same regen request.
  - `RecordingSetupView.swift`: new `capturedToast` (capsule pill, checkmark + "Memory captured — Mabel is writing it up", mabelPrimaryLight bg). Mounted via `ZStack(alignment: .top)` so it's a true overlay above the ScrollView, not part of the scroll content — scroll position doesn't hide it. Trigger is `.onChange(of: chapter.memories.count)` with a 4s display window (not 2.5s; deliberately longer to outlast the RecordingView nav-pop transition, since the count increments while RecordingSetupView is still pushed-down behind RecordingView). `lastSeenMemoryCount` initialized in `.onAppear` to prevent spurious fires on initial chapter load.
  - Build: `xcodebuild -destination "id=AFC0138C-..." Debug build` clean. SourceKit lit up the usual cross-file false positives ("Cannot find 'AppState' in scope" etc.) during edits — ignored per the documented pattern. `BUILD SUCCEEDED`.
  - **One spec deviation worth flagging:** the audio save-failure alert can really only mean "Try again" (clear + re-record) or "Discard" (dismiss without persisting). The "Retry/Keep" framing in the original spec assumed the save partially succeeded; for `result == nil` there's nothing to keep. Lesson: alert button copy must match the actual failure mode; sketchy spec copy is OK as a placeholder but needs to be reread when you reach the actual semantics.
- **2026-05-22 — Phase 1.8 T4 verified on-device, surfaced a Phase 1.1 expansion.** Recorded the porcelain music box script (Chapter 1, 7th memory). Memory captured cleanly, AI title generated as **"Grandma's Enchanted Music Box"** — genuinely composed, evocative, title-cased, no overlap with the in-prompt example list (verifies generalization a second time after the rose-bush test on 2026-05-18). Approval revoke + regen path executed correctly: top checkmark disappeared, REVIEW CHAPTER CTA returned at bottom. **NEW UX finding worth promoting:** in a chapter with many existing memories, the new MemoryCard lands at position 7+ (off-screen below the fold). After Stop & Save the user sees the previous list state with no visible change — feels like the recording was lost. User specifically asked for "some sort of loading or message saying voice memo captured… a small indication that the memory has been collected." Promoting to Phase 1.1 as a 4th sub-task (post-save inline confirmation banner) since it's the same UX family as the existing 1.1 work (making silent state changes visible). Also saved as a generalizable feedback memory — `feedback_state_change_visibility` — because the principle applies anywhere in the app that dismisses after a successful mutation. Thematic-weaving check on the regenerated chapter narrative was not assessed tonight (user hadn't opened REVIEW CHAPTER post-regen) — fold into next session's pass through ChapterReviewView, or skip if the regen prompt already proves itself elsewhere.
- **2026-05-20 — Phase 1.8 (always-available recording UI) implemented, pending on-device smoke test.** Five file changes plus schedule update:
  - `RecordingSetupView.swift`: ScrollView VStack reordered to chapter badge → progress bar → recordingUI → memoryList → chapterStatusSection. The previous `if completedMemoryCount >= 5 { chapterCompleteView } else { recordingUI }` mutual exclusion is gone. Hero mic is now always visible; status banners (processing / failure / ready-for-review / approved) appended below the memory list when count ≥ 5. Renamed `chapterCompleteView` → `chapterStatusSection` to reflect the new role.
  - `StoryProcessingService.swift` (both `processMemory` and `processTypedMemory`): chapter-narrative regeneration gated on `!updatedChapter.isApproved`. Approval is now sticky — bonus memories appear in the list with their own narratives + titles but don't overwrite the published chapter narrative or revoke approval.
  - `MemoryCard.swift`: (a) Failed-state preview prefers `errorMessage` over `transcript`, so hallucination-filter-emptied cards now show the friendly "We couldn't hear a memory…" copy instead of being blank. (b) Processed memories are tap-to-expand: tapping toggles between a 3-line preview (`.lineLimit(3)`) and the full narrative (`.lineLimit(nil)`). An affordance line ("Read full memory" / "Show less") in `mabelPrimary` 11pt semiBold sits below the preview. The trailing retry/trash VStack stays in its own subview so it still captures taps independently. Removed an `.accessibilityElement(children: .combine)` I'd briefly added — it would have hidden the retry/trash buttons from VoiceOver. The new tap target uses `.contentShape(Rectangle())` on the title VStack.
  - Progress-bar denominators clamped to 1.0 in `RecordingSetupView`, `RecordingView`, `ChapterCard`, `FeaturedChapterCard`. The "X/5" badge text is left as-is — showing "6/5" on a bonus-memory chapter is informative ("done +1 extra") and the visual bar fills correctly.
  - **Audit finding:** `AppState.saveMemory()` (which had a 5-memory cap at line 64) is dead code — `grep` found zero callers. Left in place rather than ripping out unrelated code in a Phase 1.8 commit; cleanup item for later. The actual recording path uses `addMemory()`, which had no cap.
  - **Build:** xcodebuild Debug-iphonesimulator passed cleanly (one fix needed first: `ComfortaaWeight.semiBold` is camelCase, not `.semibold`). Will not run on simulator since 1.8 wants device verification with the chapter-1 5/5 case the user couldn't test last session.
  - **Lesson worth noting:** SourceKit lit up dozens of cross-file "Cannot find type" diagnostics during these edits (Memory, Chapter, AppState, MabelAnimation, MabelColors, etc.). Per the CLAUDE.md note: the indexer lies, the build doesn't. xcodebuild was the source of truth.
- **2026-05-25 — Narrative line-spacing unified at 10 across both views.** On-device review of Phase 1.8 Test 5 found `ChapterReviewView` was still at `lineSpacing(6)` — the original 03b0250 "6→10 breathing room" commit only touched `MyStoriesView.bookStyle`. Tried bumping CR view 6→14 first per user feedback ("a little more than just a little"), but on device 14 read as overshooting. Settled both views at 10. `MyStoriesView` already at 10 + `paragraphSpacing 18`; `ChapterReviewView` narrative card now matches at `.lineSpacing(10)`. **Lesson worth remembering:** typography touches that read as "global" (line spacing, paragraph spacing, font family) need a grep across all callers; the 03b0250 author assumed `MyStoriesView` was the only narrative renderer and missed the in-flow review surface. (Also noted but not fixed: long words like "acknowledgment" can land alone on a wrapped line in MyStoriesView's narrow column — natural word-wrap, not hyphenation; parked.)
- **2026-05-27 — Phase 1.2 implemented, Phase 1.3 verified, Phase 1.9 spec'd.** Three things in one session, all from the carry-over list left by the 2026-05-25 review.
  - **Phase 1.2 (processing banner):** the "Processing your memories..." spinner was previously buried inside `RecordingSetupView.chapterStatusSection`, which only renders at 5+ memories — so a user transcribing memory #2 saw the per-card spinner but no chapter-level signal. Extracted the banner into its own `processingBanner` private view, added a `hasProcessingMemory` computed property, and rendered the banner from `body` whenever any memory is `.processing`, regardless of count. Removed the original in-place copy from `chapterStatusSection` to prevent double-rendering at 5/5. Same visual treatment as before (white capsule + `mabelPrimary` ProgressView + helper-font copy on `mabelSubtle`); no new tokens introduced. Build clean on sim. **Pending on-device verification** — fold into Phase 1.4 Test 3 next session (record a memory mid-flight, watch for the banner above the memory list during transcription + narrative gen).
  - **Phase 1.3 (MemoryCard processing spinner):** verified by code inspection rather than edit. `MemoryCard.stateIcon` already renders `ProgressView().tint(.mabelTeal)` for `.processing` (lines 18–21). `MabelColors.mabelTeal` is a static alias for `MabelColors.primary` (`MabelColors.swift:138`), so the visible colour is the correct primary teal even though the call site reads as the legacy name. No code change; ticked the box with a note. **Lesson worth flagging:** the legacy `mabelTeal` / `mabelGold` aliases are still doing real work — don't rip them out without a sweep of every call site, even though MEMORY.md lists the canonical names as `mabelPrimary` / `mabelAccent`.
  - **Phase 1.9 (NEW — re-open ChapterReviewView from approved chapters):** spec written and inserted at the end of Phase 1. Surfaced 2026-05-25 by the user — approved chapters have no nav path back into the request-changes UI; the only workaround is recording a bonus memory, which uses the regen-and-revoke flow as a side door. Phase 1.9 proposes an explicit entry point from `MyStoriesView` (or an "edit mode" flag on `ChapterReviewView`). Worth doing before Phase 2 because the same gap also makes the Phase 1.4 regen-failure test annoying to reproduce (you have to revoke approval first to even reach the regen path on a previously-approved chapter).
  - **Schedule housekeeping noted not done:** the `DesignConceptPrototypes.swift` / `DesignConceptSnapshotTests.swift` scaffolding cleanup still needs an Xcode session (project.pbxproj target-membership edit) — left for the user. Git is already up to date with origin (8b3ec36 pushed before the session opened, contrary to the carry-over note).
- **2026-05-27 — Per-app Cellular workflow unlocks offline testing on hotspot setups (worth keeping).** The carry-over Test 2 (regen-failure alert) had been deferred since 2026-05-23 because the user was on 5G personal-hotspot and couldn't toggle Wi-Fi or Airplane Mode without killing the Mac's internet (Personal Hotspot is wifi-over-cellular — cellular off = hotspot SSID dies). The workflow that worked: Settings → Cellular → Mabel → toggle Cellular Data off. This cuts the app's cellular access without touching the hotspot service, so the iPhone keeps broadcasting Wi-Fi to the Mac and the cloud session survives. iOS shows a friendly "Cellular Data is Turned Off for 'Mabel'" sheet on the next network attempt; dismissing it lets Mabel proceed to actually fail the request and surface its own `.alert()`. **Caveat to remember:** the per-app Cellular row only appears for apps that have made at least one network call after install — force-launch the app once and let it call OpenAI (any chapter open does this via `loadPrompts()`) before going to Settings, otherwise Mabel won't be in the list. This is now the default "test offline behaviour without breaking the dev loop" recipe for the rest of Phase 1 / Phase 2.
- **2026-05-27 (later) — Phase 1.9 implemented in the same session.** Re-used `ChapterReviewView` directly (Option B from the spec): added a `SecondaryButton("REQUEST CHANGES")` on approved chapter cards in `MyStoriesView` that opens the existing sheet via the same `reviewingChapter` state, and gave `ChapterReviewView`'s bottom-actions VStack a three-way branch — regenerating-feedback mode (existing), approved mode (NEW, only REQUEST CHANGES; APPROVE hidden), and default draft mode (existing). The X in the header is the dismiss path for an approved-mode visit. Regen-from-approved goes through `updateNarrative()` which already revokes `isApproved` (Phase 1.8 follow-up wiring), so the chapter returns to draft naturally. Build clean. **Decision worth flagging:** Option B (re-use the view) over Option C (an `editMode` enum) because the view already reads `chapter.isApproved` for its status badge — the state was already in scope, and adding an enum would have duplicated information. Net cost of the change: ~10 lines added across two views. Side benefit: this also makes the Phase 1.4 regen-failure test reproducible without revoking approval first. **Lesson worth remembering:** when adding an entry point to an existing view, check whether the view already inspects the state you'd encode in a new mode flag — if it does, the branch belongs at the call site that's already reading that state, not in a new parameter.
- **2026-05-14 — Phase 1.7 (Whisper robustness) implemented.** Two changes to `OpenAIService.swift`: (a) `transcribeAudio()` now appends a `language=en` multipart form field; (b) added `knownWhisperHallucinations` Set + `filterWhisperHallucination(_:)` static helper, called once on the response text — matches return `""`, which the existing `StoryProcessingService.isTooShort` floor already treats as `.failed` with the friendly audio copy. Build succeeded (Debug, sim destination). Smoke-test HTML written at `/tmp/mabel-smoke-test.html` with 3 tests: pancakes happy-path (verifies language pin doesn't break English), "test test test" (verifies pin returns English rather than Korean hangul), and silence/background-music (verifies hallucination filter). **`no_speech_threshold` finding:** the schedule entry's premise was wrong — OpenAI's hosted Whisper transcription API does NOT expose this parameter; it's only in the open-source `whisper` Python package. Marked the checkbox done with a "not applicable" note rather than leaving it open. Defense-in-depth on garbage audio is now language pin + hallucination filter + length floor.

---

## Phase 0.5 — Get Mabel on your iPhone (~1–2 hrs)

The simulator can't fully test microphone behavior, audio interruptions (a phone call mid-recording), AVAudioSession state, or the iOS permission flow. For your "record real family stories" goal, you need the app on a real device. Best to do this BEFORE Phase 1 testing so the utility fixes (alerts, progress feedback) get exercised against real-device timing.

**Decision: free Personal Team or paid Apple Developer Program?**
- **Free (Personal Team) is sufficient for Phase 0.5–2 personal use.** 7-day provisioning expiry is fine since you'll rebuild every few days anyway. Microphone + local file I/O + OpenAI network all work.
- **Pay the $99 only when you want family members on THEIR own phones** — that needs TestFlight, which needs the paid program. No need to pay before that trigger fires.

### Setup with Personal Team (free)
- [x] Open `Mabel/Mabel.xcodeproj` in Xcode. (2026-05-07)
- [x] Select the `Mabel` target → **Signing & Capabilities** tab. (2026-05-07)
- [x] Under "Team," click the dropdown → **Add an Account…** → sign in with your Apple ID. Once signed in, pick "Christiano (Personal Team)" as the team. (2026-05-07 — Apple ID `cgsqueff@gmail.com` was already added)
- [x] If Xcode complains about bundle ID `com.mabel.app` already being taken, change it to something namespaced to you (e.g. `com.cgsqueff.mabel`). Personal Team can't share bundle IDs with anyone else's Personal Team. (2026-05-07 — N/A, `com.mabel.app` was accepted by Personal Team)
- [x] Connect your iPhone via USB cable. Trust this Mac when prompted on the phone. (2026-05-07)
- [x] On the phone: **Settings → Privacy & Security → Developer Mode** → toggle ON, restart phone. (2026-05-07)
- [x] Back in Xcode: select your iPhone in the device picker (top toolbar, next to the scheme), then `Cmd+R` to build and install. (2026-05-07)
- [x] First launch on the phone: **Settings → General → VPN & Device Management** → tap your Apple ID → **Trust**. (2026-05-07)
- [x] Launch Mabel. Grant microphone permission when prompted. (2026-05-07 — app launches; mic prompt fires on first record attempt, exercised below)
- [x] Record a 30-second test memory in Chapter 1. (2026-05-13 — pipeline end-to-end works on real device: audio → Whisper → GPT-4o narrative all returned within expected latency. Stop & Save UX felt fine. Test recording "test, test, is animation working" produced a fully fabricated Maple Street childhood story — see findings below for the hallucination bug this surfaced. Phase 0.5 closes; new Phase 1.0 added.)

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

### 1.0 Stop the hallucination on garbage input (NEW — surfaced by real-device test 2026-05-13)
**Priority: do this before 1.1.** A 30-second "test, test" recording produced a fully invented Maple Street childhood story. The narrative-generation prompts have no refusal clause, so GPT-4o confabulates whenever the transcript is non-substantive. Fabrication is worse than failure for a memoir app — this is data integrity, not polish.

- [x] `Mabel/Mabel/Services/OpenAIService.swift` `generateNarrative()` — refusal clause appended; post-parse sentinel check throws new `OpenAIError.noSubstantiveContent`. Sentinel constant lives at `OpenAIService.noContentSentinel`. (2026-05-13)
- [x] Same change applied to `generateChapterNarrative()` — refusal clause + sentinel check. (2026-05-13)
- [x] `Mabel/Mabel/Services/StoryProcessingService.swift` — both `processMemory` and `processTypedMemory` catch `OpenAIError.noSubstantiveContent` specifically and set friendly user-facing copy (audio variant: "We couldn't hear a memory in that recording. Try again with a bit more detail?"; typed variant: "That entry was too short to write up. Add a bit more detail and try again?"). Existing `MemoryCard` red-triangle + retry/delete UI is reused. (2026-05-13)
- [x] Belt-and-braces length floor — `Self.isTooShort()` helper checks word count <8 OR char count <40. Applied to both `processMemory` (post-transcription, pre-narrative) and `processTypedMemory` (pre-narrative). Skips the API call entirely on too-short input. (2026-05-13)
- [x] Smoke test on real device: 3/3 fail cases verified. Test 1 ("test test test" → Whisper transcribed as Korean "테스트 테스트 테스트"), Test 2 ("uh" → "Uh..."), Test 3 (silence with background music → Whisper hallucinated "Thank you for watching the video." — 6 words, 33 chars, caught by length floor). All three landed in `.failed` with the friendly copy. **The pre-existing "Processing failed" banner in `RecordingSetupView.chapterCompleteView` (lines 210–230) also surfaces the friendly copy correctly — 1.0 wiring works end-to-end.** (2026-05-13)

### 1.1 Visible error alerts on AI failures + post-save confirmation
- [~] `Mabel/Mabel/Views/RecordingView.swift` saving overlay — **implemented then removed same session (2026-05-23).** Tried `savingOverlay` (dim scrim + spinner + "Saving your memory…") wrapped in `Task { @MainActor in ... }` so it'd render before dismiss. On-device test: the sync save is so fast (~100ms) that the overlay flashed for a single frame and the user reported "it seems like a mistake" — too brief reads as a UI glitch, not as confirmation. Removed the overlay + the async wrap. The `hasStartedOnce` + `isProcessing` reentrancy guard stays (cheap, prevents double-tap). Lesson saved to `feedback_state_change_visibility`: confirmations <500ms visible are worse than no confirmation. **Reconsider in Phase 1.2** alongside the per-memory processing banner work — if a "saving" indicator returns, it needs a minimum dwell time OR should live on the destination screen (the post-save toast already covers most of this need).
- [x] `RecordingView.swift` save-failure alert. `recorder.stopRecording()` returning `nil` is the local failure signal (audio file couldn't be flushed). When it fires, sets `saveErrorMessage` + `showSaveErrorAlert`. The `.alert` exposes **Try again** (clears state via `clearRecording()`, user can re-record) and **Discard** (destructive — dismisses without saving). Deviated from the spec's "Retry / Keep" copy because `result == nil` means there's no audio to "keep" — Try again / Discard fits the actual failure semantics. (2026-05-23)
- [x] `Mabel/Mabel/Views/ChapterReviewView.swift` — inline `errorMessage` block (was lines 99–114, inside the narrative card) removed. Promoted to `.alert("Couldn't regenerate chapter", ...)` modifier at the view level. **Try again** calls existing `regenerateNarrative()` (preserved `feedback` state means it re-tries with the same request). **Dismiss** clears the error. (2026-05-23)
- [x] `Mabel/Mabel/Views/RecordingSetupView.swift` — added `capturedToast` (inline pill, checkmark + "Memory captured — Mabel is writing it up", `mabelPrimaryLight` bg with subtle primary stroke, capsule shape). Overlaid at top of the ScrollView via `ZStack(alignment: .top)` so it floats above content regardless of scroll position. Trigger: `.onChange(of: chapter.memories.count)` fires when `newValue > lastSeenMemoryCount`; `triggerCaptureToast()` shows for 4 seconds then fades. 4s (not 2.5s) intentionally outlasts the RecordingView → RecordingSetupView dismiss transition — the toast triggers while RecordingSetupView is still pushed-down in the stack, so it needs to be visible when the user lands back here. `.onAppear` initializes `lastSeenMemoryCount` so the toast doesn't fire spuriously on initial chapter load. **Functional behavior verified on device 2026-05-23; UI styling needs polish — user feedback: "looks ugly and bad UI."** Visual refresh deferred (NEW Phase 1.1.5 polish item below).
- [x] Smoke test on device 2026-05-23: (a) toast verified — appears on return from RecordingView, ~4s visible, copy reads correctly. (b) Saving overlay tested + REMOVED — too brief to perceive. (c) Save-failure alert + (d) regen-failure alert not exercised yet (hard to force without simulating network/mic failure on real device). Both are passive safety nets — they fire on rare paths and weren't blockers tonight; if they ever misbehave they'll surface naturally. **Deferred to next session's smoke test:** verify regen-failure alert by toggling wifi off mid-regenerate in ChapterReviewView, AND complete Phase 1.8 Test 5 (typography polish — narrative line spacing 6→10 + MyStoriesView 16pt justified/hyphenated) which the user couldn't get to tonight.
- [x] **Regen-failure alert verified on device 2026-05-27.** Used the per-app Cellular Data toggle (Settings → Cellular → Mabel → off) instead of Wi-Fi toggle so the iPhone-to-Mac hotspot stayed alive — see findings journal for the workflow. Steps: cellular off for Mabel → MyStories → tapped REQUEST CHANGES on an approved chapter (Phase 1.9's new entry point) → typed "Make it shorter" → tapped REGENERATE. (1) iOS native sheet "Cellular Data is Turned Off for 'Mabel'" appeared first — this is the iOS first-level system prompt, not Mabel's alert; dismissed with OK. (2) Mabel's `.alert()` fired correctly on the actual API call: title "Couldn't regenerate chapter", body "The Internet connection appears to be offline.", Dismiss + Try again buttons. (3) Re-enabled cellular for Mabel → tapped REGENERATE → succeeded. New narrative was visibly shorter than the original (the "shorter feedback ignored" finding from 2026-05-04 may have been fixed since, or just worked this time — worth re-testing in Phase 2). (4) Chapter dropped from APPROVED back to DRAFT after the rewrite — Phase 1.8 regen-and-revoke wiring confirmed end-to-end. **Phase 1.1 is now fully closed.** (2026-05-27)

### 1.1.5 Polish the capture toast (NEW — surfaced 2026-05-23)
The functional shape is right (top of screen, 4s, fades, triggers on memory count increment) but the visual styling reads as "ugly and bad UI" per the user's on-device review. Specific design work, deferred for a fresh session.

- [x] Revisit `capturedToast` in `RecordingSetupView.swift`. (2026-05-25 — ran `/design-uplift` with three competing concepts: A "Quill Receipt" (white card matching the app's surface language), B "Live Status Pill" (dark capsule, animated gold dot, Linear/Vercel pattern), C "Mabel Says" (mascot delivers the confirmation). Rubric ranked B 4.50 / C 3.75 / A 3.50; user picked B. Implementation: dark `mabelText` capsule, white "Memory captured" in `badge()` font + faint middle-dot + 85% white "Writing it up…" in `helper()`, leading pulsing gold dot (`mabelAccent` 8pt core + 16pt halo, `easeInOut(1.2s)` repeating opacity+scale animation that starts on `.onAppear` and resets on `.onDisappear`). `mabelCardShadow()` for depth, dropped the previous overlay stroke since the capsule fill is now solid. Accessibility label retained the warm copy "Memory captured. Mabel is writing it up." even though the visible string is shorter. Build clean. **Device visual verification passed on 2026-05-25 — user confirmed "looks good" on real iPhone after recording a Mrs. Bell / Saturday library memoir script.** **Lesson worth remembering:** the rubric weights pre-attentive + encoding-redundancy heavily, so it favours motion-rich industry-standard patterns; when a brand wants warmth over polish on a specific surface, the user pick can defensibly override the #1 score. Worth flagging both options when presenting.)

### 1.2 Processing banner during in-progress memories
- [x] `Mabel/Mabel/Views/RecordingSetupView.swift` — extracted the existing "Processing your memories..." spinner out of `chapterStatusSection` into its own private `processingBanner` view. New `hasProcessingMemory` computed property gates its rendering; `body` now shows the banner above the chapter-status section whenever any memory is `.processing`, regardless of chapter count. The old in-place copy inside `chapterStatusSection` was removed so the banner doesn't double-render once the chapter reaches 5/5. Same visual component (white capsule, `mabelPrimary` ProgressView, helper-font copy on `mabelSubtle`) — no new tokens introduced. Build clean against the iPhone 17 simulator. Pending on-device smoke test (fold into Phase 1.4 verification). (2026-05-27)

### 1.3 Verify `MemoryCard` shows `.processing` state
- [x] Verified by code inspection: `MemoryCard.stateIcon` already renders `ProgressView().tint(.mabelTeal)` for the `.processing` case (lines 18–21). `MabelColors.mabelTeal` is a static alias for `MabelColors.primary` (`MabelColors.swift:138`), so the spinner is on the correct primary teal token even though it reads as the legacy name. No change needed; spec satisfied. The legacy alias is benign — renaming the call site would be cosmetic churn, deferred to a sweep when other call sites prompt it. (2026-05-27)

### 1.4 End-to-end verification
- [x] **Wifi off mid-recording → alert with retry → re-enable → retry → succeeds. Verified on device 2026-05-27.** Used per-app Cellular toggle (Settings → Cellular → Mabel → off) instead of full wifi toggle to keep the hotspot-to-Mac connection alive. Recorded a ~23s memory into School Days; landed correctly in `.failed` with red triangle and friendly copy "The Internet connection appears to be offline." Per-card retry icon visible. Re-enabled cellular for Mabel, tapped retry — pipeline ran through Whisper + GPT-4o + AI title generation, narrative populated, title generated as **"Mr. Wilson's Popsicle Stand"** (genuinely composed from the popsicle script, zero overlap with in-prompt examples — fourth verification of Phase 1.6 title generalisation). The Phase 1.2 "Processing your memories…" banner showed correctly at the bottom of the memory list during the retry's processing window. No fabricated narrative; the retry succeeded end-to-end. (2026-05-27)
- [ ] Force-quit during processing → reopen → memory shows `.failed` with retry button (already exists)
- [x] **Record a memory mid-flight → see processing banner at top of memory list, not just on chapter completion. Verified on device 2026-05-27 (Test 1 + Test 3).** Phase 1.2 banner confirmed twice: once during Test 1's School Days B-script recording (mid-chapter, 2 memories total), once during Test 3's retry of the failed Memory 4 (4 memories total, none at 5/5). Banner copy + spinner + position match spec.
- [ ] Hallucination smoke test from 1.0 (3 broken inputs → all `.failed`, none fabricated)

### 1.5 Free-form memory titles (polish — surfaced 2026-05-13)
The "Memory 2 / 3 / 4" fallback for prompt-less recordings reads as lazy in a memoir context. Cheap fix here; richer AI-generated titles get deferred to Phase 2.

- [x] `Mabel/Mabel/Components/MemoryCard.swift` — added `derivedTitle(from:)` static helper. Title fallback order is now: `promptUsed` (unchanged) → narrative-derived (NEW, ~60 chars truncated at word boundary + "...") → "Written memory" for typed entries → "Memory N" index fallback. Narrative-derived takes precedence over the typed placeholder, so typed memories also get a polished title once the narrative completes. (2026-05-13)
- [x] During processing (no narrative yet) the card falls through to "Memory N" / "Written memory" as before. Title updates automatically when `narrativeText` populates because `title` is a computed property and `MemoryCard` is a SwiftUI `View` re-rendered from `Memory` state. (2026-05-13)
- [x] Phase 2 follow-up: replace the 60-char derivation with a one-shot GPT-4o call that generates a 4–6 word title from the finished narrative (~$0.0001/memory). **Bumped up — see new Phase 1.6 below.** After the swimming-hole test (2026-05-13), the user confirmed the verbose derived title ("One of my favorite summer memories is of the old swimming...") is unsatisfying; they want a tight 2–3 word evocative title (e.g. "Memories from Swimming"). Simple truncation can't produce that. **DONE in Phase 1.6 (2026-05-18) — gpt-4o-mini generates 3–5 word titles in the background after each memory's narrative completes.**

**Partial smoke-test verification (2026-05-13):**
- [x] Test 4 (swimming hole, ~30s recording) — succeeded, narrative generated, derived title used instead of "Memory N". Title was the full 60-char excerpt with "..." — works, but verbose. Bumping AI title to Phase 1.6.
- [x] Test 5 (Sunday pancakes) — completed 2026-05-18 as Phase 1.7 Test 1 (with incidental background music). Narrative generated, derived title showed "Every Sunday morning when I was about seven, my mother..." — verbose, exactly the case Phase 1.6 fixes.
- [ ] Test 6 (Mrs. Hollis butterscotch) — fold into the Phase 1.6 smoke test next; the script is well-suited to verify the AI title path produces something like "Mrs. Hollis and the Butterscotch".

### 1.6 AI-generated short memory titles (NEW — bumped up from Phase 2, surfaced 2026-05-13)
Real-device test 4 (swimming hole) produced a polished narrative with title "One of my favorite summer memories is of the old swimming..." — correct per the 1.5 spec, but the user wants something like "Memories from Swimming" (3 words, evocative). Simple truncation cannot produce that. Promoting the deferred Phase 2 AI-title work to Phase 1 because the verbose title is visible on every free-form memory card.

- [x] `Mabel/Mabel/Models/Memory.swift` — added `var generatedTitle: String?` and matching init parameter. Swift's synthesized Codable handles missing keys for Optional properties via `decodeIfPresent` automatically; existing `chapters.json` files on real devices decode without modification. (2026-05-18)
- [x] `Mabel/Mabel/Services/OpenAIService.swift` — added `generateMemoryTitle(narrative:)`. Model `gpt-4o-mini`, `max_tokens: 30`, `temperature: 0.7`. System prompt instructs 3–5 word title in title case, no quotes/period, with 5 in-prompt examples ("Summer at the Swimming Hole", "Mother's Sunday Pancakes", "Mrs. Hollis and the Butterscotch", "The Farmhouse Porch", "Grandpa's Workshop") to anchor tone. Response is stripped of wrapping quotes and a trailing period defensively. Throws `OpenAIError.noContent` on empty narrative or empty response. (2026-05-18)
- [x] `Mabel/Mabel/Services/StoryProcessingService.swift` — added `generateTitleInBackground(narrative:memoryID:chapterIndex:appState:)` helper that spawns a `Task` to call `generateMemoryTitle` and persist the result via `appState.updateMemory`. Failures are swallowed and logged. Called from both `processMemory` (audio path) and `processTypedMemory` immediately after the narrative is stored, so title generation runs in parallel with chapter-narrative generation. (2026-05-18)
- [x] `Mabel/Mabel/Components/MemoryCard.swift` — updated `title` computed property fallback order to: `promptUsed` → `generatedTitle` (NEW, second-tier) → `derivedTitle(from: narrative)` (existing 60-char path, third-tier) → "Written memory" → "Memory N". `derivedTitle` is kept as the fallback for the brief window between narrative completion and title generation, and as the failure-mode fallback. (2026-05-18)
- [x] Cost sanity check confirmed: gpt-4o-mini at the typical title length (~5–10 input tokens of narrative, max 30 output tokens) costs roughly $0.0001/memory. 50 memories per book ≈ $0.005/book — well below "negligible". (2026-05-18)
- [x] Smoke test on real device — verified 2026-05-18. (1) Mrs. Hollis butterscotch script recorded in Chapter 2: initially failed on the Phase 1.0 false-positive (see findings journal); after the refusal-clause patch + redeploy, retry succeeded → title swapped to "Mrs. Hollis and the Butterscotch". *Caveat:* that exact phrase is one of the in-prompt examples — verified the swap mechanic, didn't truly verify generalization. (2) Sibling-fight script (zero overlap with any in-prompt example: backyard rose bush + grape popsicle) → title came back as **"Rose Bush and Popsicle Wars"**. Genuinely composed: 4 words, title case, pulled two specific details from the script, slightly playful tone — exactly the chapter-heading shape the prompt is designed for. Generalization confirmed. Cost-wise, two gpt-4o-mini title calls in tonight's session — well within the projected $0.0001/memory budget.

### 1.7 Whisper robustness (NEW — surfaced 2026-05-13)
Real-device testing exposed two Whisper-side bugs that the 1.0 length floor caught tonight but won't catch in all cases.

- [x] **Language pinning.** `OpenAIService.transcribeAudio()` now appends a `language=en` multipart form field. One-line behavioural change; if non-English support ever lands, swap the literal for a `UserProfile.language` lookup. (2026-05-14)
- [x] **Hallucination filter for known Whisper artifacts.** Added `OpenAIService.knownWhisperHallucinations` (Set of ~20 community-documented phrases including "thank you for watching", "thanks for watching", "please subscribe", "bye", "music", "[music]", "you", "subtitles by the amara.org community", etc.) and `OpenAIService.filterWhisperHallucination(_:)` helper. Normalisation strategy: trim whitespace, lowercase, strip leading/trailing punctuation, then exact-match against the set. Matches return `""`, which trips the existing `StoryProcessingService.isTooShort` length floor and the memory lands in `.failed` with the friendly audio copy. Logs `[Whisper] Filtered known hallucination: '...'` for observability. Kept the set co-located with `OpenAIService` rather than a new file — small enough that a separate file would be overkill. (2026-05-14)
- [x] **`no_speech_threshold` — not applicable.** Re-checked OpenAI's audio/transcriptions API reference: the only documented form fields are `file`, `model`, `language`, `prompt`, `response_format`, `temperature`, `timestamp_granularities[]`. `no_speech_threshold` is a parameter of the open-source `whisper` Python package, NOT the hosted API. The schedule entry's premise was wrong. Closing this sub-task — defense-in-depth comes from the language pin + hallucination filter + length floor; raising no-speech sensitivity isn't a lever we have. (2026-05-14)
- [x] Smoke test on real device: HTML script at `/tmp/mabel-smoke-test.html`, 3/3 verified. Ran in Chapter 2 (not Chapter 1) because Chapter 1 was at 5/5 / approved and `RecordingSetupView` hides the hero mic — the Phase 1.8 bug confirmed blocking real testing. Test 1 (pancakes script, with background music incidentally) → green/healthy, full narrative generated, derived title used (verbose as expected pre-1.6). Test 2 ("test test test") → red triangle, transcript came back as English "test test test" (NOT Korean hangul as last session) — language pin verified. Test 3 (20s silence + ambient music) → red triangle, empty transcript on the card — the empty subtitle is direct evidence the hallucination filter intercepted a known artifact and nulled the transcript before the length-floor checked it. No fabrication on any of the three. (2026-05-18)

### 1.8 Always-available recording UI (NEW — surfaced 2026-05-13)
Two related UX issues from the test session:
- Hero mic disappears when `chapterCompleteView` shows (chapter at 5/5). User can't add more memories to a chapter post-approval.
- Even when not complete, the mic sits *below* the memory list, requiring a scroll to record after a few entries.

User wants: **mic on top → memory list middle → chapter status/approve at bottom**, always in that order, regardless of chapter state.

- [x] `Mabel/Mabel/Views/RecordingSetupView.swift` `body` (lines 36–63) — reorder the ScrollView VStack: `recordingUI` first (always shown, never replaced), then `memoryList`, then chapter status section. (2026-05-20)
- [x] Replace the `if chapter.completedMemoryCount >= Chapter.memoriesPerChapter { chapterCompleteView } else { recordingUI }` mutual exclusion at line 54 with: always show `recordingUI`, conditionally append the relevant status block (processing banner / failure banner / "ready to review" CTA / "approved" badge) below the memory list. Renamed `chapterCompleteView` → `chapterStatusSection` to reflect the new role. (2026-05-20)
- [x] Lift the 5-memory hard cap. `Chapter.memoriesPerChapter = 5` is now a soft threshold for narrative generation only. Audit found no recording-blocking comparison — `addMemory` in `AppState` was already cap-free; the dead-code `saveMemory` was the only capped path and it has no callers. Clamped progress-bar denominators to 1.0 in `RecordingSetupView`, `RecordingView`, `ChapterCard`, and `FeaturedChapterCard` so 6/5+ doesn't overflow the bar visually. (2026-05-20)
- [x] Edge case: **reversed from (a) sticky to (b) regen-and-revoke** after on-device review surfaced the e-book/audiobook concern (2026-05-20 follow-up commit). The original (a) implementation left bonus memories floating outside the published chapter narrative, which defeats the "speak your memoir into existence" promise — the e-book wouldn't include them. New behavior: any memory completing in a chapter at the 5-memory threshold triggers `generateChapterNarrative()`, which weaves it into the narrative; `updateNarrative()` revokes `isApproved`, sending the chapter back to the review flow with the new memory included. The user re-reviews and re-approves. Improved the chapter-narrative prompt at the same time: flexed the hardcoded "5 individual memory narratives" → `\(memories.count)`, and added an explicit reordering instruction so the model arranges memories thematically rather than chronologically (the order they were recorded doesn't bind the chapter structure). (2026-05-20)
- [x] Smoke test: in a 5+ memory approved Chapter 1, tap mic, record the "porcelain music box" script. Confirmed end-to-end: (a) memory appears in the list with spinner → narrative + AI-generated title "Grandma's Enchanted Music Box" (genuinely composed, zero overlap with in-prompt examples), (b) chapter approval was revoked correctly (top checkmark disappeared, REVIEW CHAPTER CTA returned at bottom), (c) regen-and-revoke flow executed as designed. Original "is sticky approval the right call?" question is now closed — the reversed (regen-and-revoke) behaviour is correct. **However**, surfaced a separate UX gap — see Phase 1.1 below. (2026-05-22)

**Folded into the 1.8 commit (logged 2026-05-18):**
- [x] `MemoryCard` failed-state subtitle now prefers `errorMessage` over `transcript`. Hallucination-filter cases (empty transcript) get the friendly "We couldn't hear a memory…" string in the card body — no more blank failed cards. (2026-05-20)
- [x] `MemoryCard` is tap-to-expand for processed memories. Tapping toggles between 3-line preview and full narrative, with a "Read full memory" / "Show less" affordance in `mabelPrimary`. The retry/trash buttons sit in their own VStack so they still capture taps independently. (2026-05-20)

**Out of scope for Phase 1:** copy refinement, animation polish, design uplift, mascot work. These are branding — paused.

### 1.9 Re-open ChapterReviewView from approved chapters (NEW — surfaced 2026-05-25)
Once a chapter is approved, `ChapterReviewView` is unreachable from any nav path. `RecordingSetupView.chapterStatusSection` only shows the "VIEW IN MY STORIES" CTA for approved chapters, and `MyStoriesView` opens its own read-only `StoryDetailView` (not `ChapterReviewView`). The only way to re-enter the review flow is to record a bonus memory, which triggers the regen-and-revoke path from Phase 1.8 — i.e. the user has to invalidate their own approval to revisit the request-changes UI. There is no "I changed my mind, let me request a tweak" entry point for an approved chapter.

User-visible symptoms:
- After approving Chapter 1, the user has no way to ask Mabel to rewrite a paragraph without first recording a 6th memory.
- The REQUEST CHANGES button on `ChapterReviewView` becomes unreachable.

Recommended shape (implemented 2026-05-27):
- [x] `Mabel/Mabel/Views/MyStoriesView.swift` — on approved chapter cards, the previous CTA gap (no entry point) is filled with a `SecondaryButton(title: "REQUEST CHANGES")` that opens the existing `ChapterReviewView` sheet via the same `reviewingChapter` state. Unapproved-with-narrative chapters keep the existing `CTAButton(title: "REVIEW & APPROVE")`. (2026-05-27)
- [x] `Mabel/Mabel/Views/ChapterReviewView.swift` — bottom-actions VStack now has a three-way branch: regenerating-feedback mode (existing), approved mode (NEW — `CTAButton(title: "REQUEST CHANGES")` only; APPROVE hidden because tapping it on an already-approved chapter is a no-op), default draft mode (existing — APPROVE + REQUEST CHANGES). Dismiss is via the X in the header for the approved path. (2026-05-27)
- [x] Regen-from-approved behaviour is unchanged — `regenerateNarrative()` calls `appState.updateNarrative()`, which already revokes `isApproved` (per the Phase 1.8 follow-up). The chapter returns to draft state with the new narrative; user re-approves after the rewrite. (2026-05-27)
- [x] Reused existing tokens (`SecondaryButton`, `CTAButton`); no new UI components. Build clean on iPhone 17 simulator. Pending device smoke test — see Test 4 in `~/mabel-smoke-test-2026-05-27.html`. (2026-05-27)

**Surfaced 2026-05-25**, **implemented 2026-05-27**. Side benefit confirmed: makes Phase 1.4 Test 1 (regen-failure alert) reproducible without first having to revoke approval — you can just open an approved chapter and tap REQUEST CHANGES → REGENERATE with wifi off.

**1.9 follow-up — UX issues surfaced 2026-05-27 during Test 4 device verification (implemented same session):**

The new entry point worked functionally — REQUEST CHANGES on an approved chapter card opens `ChapterReviewView` with APPROVE hidden as designed. But two UX issues showed up immediately on first use:
- (A) **Two-tap redundancy.** After tapping REQUEST CHANGES on MyStories, the user landed in `ChapterReviewView` and had to tap REQUEST CHANGES *again* to reveal the feedback field. They already declared the intent on the previous screen; the second tap was pure friction. User: "having to click the same button twice is bad UI." See [[feedback-no-double-confirm-on-navigate]].
- (B) **Feedback field hidden below long narrative.** Even after the second tap, the input field appeared at the *bottom* of the narrative card and the REGENERATE button was greyed — the user had to scroll past the entire narrative to find the input and figure out what to do. Compounded the friction from (A).

Fix (implemented 2026-05-27):
- [x] `ChapterReviewView.init(chapterIndex:openInFeedbackMode:)` — new `openInFeedbackMode: Bool = false` init param. When `true`, `@State private var showFeedbackField` initializes to `true`, so the field is visible on first render. Backwards-compatible default keeps existing call sites unchanged.
- [x] `ScrollViewReader` wrapper around the existing `ScrollView`. Feedback section tagged with `.id(feedbackSectionID)`. `.onAppear` schedules a `scrollTo(feedbackSectionID, anchor: .top)` after a 0.35s delay (lets the sheet's slide-up animation settle) when `openInFeedbackMode`. `.onChange(of: showFeedbackField)` does the same on a 0.1s delay for the draft-chapter path (when the user reveals the field via in-sheet REQUEST CHANGES). Both wrap the scroll in `withAnimation(.easeOut(duration: 0.25))` for a smooth glide rather than a jump.
- [x] Cancel button (visible in feedback mode) now dismisses the entire sheet when `openInFeedbackMode` was true — toggling back to the default state would just show another REQUEST CHANGES button (the only option for approved chapters), which would trap the user in a circle. For the draft-chapter path, Cancel still reverts to the APPROVE + REQUEST CHANGES default.
- [x] `MyStoriesView.ReviewingChapter` struct gained an `openInFeedbackMode: Bool` field. Approved-chapter REQUEST CHANGES passes `true`; draft-chapter REVIEW & APPROVE passes `false`. The `.sheet(item:)` content closure forwards the flag into `ChapterReviewView`.
- [x] Build clean on iPhone 17 simulator. Pending on-device re-verification — fold into the same re-deploy as the toast-positioning fix.

**Typography observation worth tracking (not actioned this session):** during Test 4 the user noted "honestly, the text looks way better on this second screen" — comparing `ChapterReviewView`'s left-aligned `helper()` narrative (Image #12) to `MyStoriesView`'s justified `bookStyle()` narrative (Image #11). Despite `bookStyle` being 16pt (2pt larger) with hyphenation, the user perceived the smaller left-aligned version as more readable on a phone column. This corroborates the 2026-05-25 finding about long-word rivers in `MyStoriesView.bookStyle`. Consider switching MyStoriesView to left-aligned (drop `.justified` from the paragraph style) in a future polish pass — would also resolve the rivers issue at the source. Not actioning now; the user mentioned it as an aside, not a request.

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
This is the most-tested set of memoir interview prompts in existence (StoryCorps has been collecting oral histories since 2003). Use it three ways (the third is now explicit after Phase 0 testing showed Mabel's current prompts run 89–104 chars — too long):

- [ ] **As few-shot examples in the GPT-4o system prompt.** When generating questions for a chapter, sample 5–8 questions from the matched StoryCorps category and inject them into the system prompt as "Examples of well-crafted memoir questions in this style: [...]". This anchors the model's tone (warm, specific, evocative) and **brevity** instead of letting it drift toward generic "Tell me about a time when..." filler.
- [ ] **As an upgraded static fallback.** Replace the generic strings in `ChapterPrompts.swift` with category-matched StoryCorps questions. When the API fails, the user still gets canon-quality prompts, not boilerplate.
- [ ] **Tighten the length cap.** Change "Keep each prompt under 120 characters" in `OpenAIService.generatePrompts()` to "Keep each prompt under 70 characters — punchy and specific, like a real interviewer would ask." StoryCorps canon averages 30–60 chars; 70 gives a small buffer for context-references like names/places.

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

## Phase 4 — Photo memories (FUTURE — surfaced 2026-05-27 from user research)

**Source:** the user spoke with a mother over the 2026-05-23/24 weekend who pitched this directly. Her use case: she captures a cute moment with her baby on her camera roll, wants to feed that photo into Mabel so it becomes part of the chapter narrative. Later, when the audiobook is generated, the narrator describes the photo in voice — turning the visual into an audible memory. This leverages the audiobook output (Mabel's biggest selling point per the current MEMORY.md positioning) as a natural endpoint for visual content.

**Why this matters strategically:** today Mabel's input modes are audio + typed text. Adding photos opens a third capture mode that's lower-friction for parents-of-young-kids (the camera roll is where their memory artifacts already live) AND extends the audiobook value prop in a way pure transcripts can't. It also creates a moat: voice memoir apps are common; photo-described-in-audiobook is distinctive.

### 4.1 Capture flow
- [ ] Add a third option to `RecordingSetupView` alongside the hero mic and "Write instead" card: a "Capture a photo" card with an icon circle (camera or photo icon) in the same visual family as the existing options.
- [ ] Photo picker: `PhotosPicker` from `PhotosUI` (iOS 16+, already available). Single-photo selection for v1; multi-photo can come later.
- [ ] Optional: photo + voice combo — user picks a photo AND records a 10–30s voice note explaining it. This is the richest input mode but adds UI complexity; defer to v1.1 if v1.0 ships with photo-only.

### 4.2 Vision pipeline
- [ ] `OpenAIService.describePhoto(imageData:context:)` — new method that posts the image to `chat/completions` with a `gpt-4o` model and a `messages` array containing an `image_url` content block (base64 data URL). System prompt instructs a 2–4 sentence first-person memoir-style description of the photo content, given the chapter topic and user profile as soft context. Reuses the same loose-context-not-constraint pattern as `generateNarrative()` (Phase 1.0 refusal-clause patch from 2026-05-18).
- [ ] Defense-in-depth: photos of low-information content (blank wall, blurry shot, no recognizable subject) should refuse via the same `__NO_CONTENT__` sentinel pattern as the audio path, with friendly copy like "We couldn't see a memorable moment in that photo. Try another?"
- [ ] Cost: gpt-4o vision is ~$0.005–0.01 per image at typical resolution. Re-check the cost-ceiling memory ([[project_api_cost_ceilings]]) before launching — multiply by expected photos-per-book to update the per-user economics.

### 4.3 Memory model integration
- [ ] `Memory.swift` — add `var photoFileName: String?` (filename in local Documents, parallel to `audioFileName`) and `var photoDescription: String?` (the gpt-4o caption, parallel to `transcript` for audio). The existing `narrativeText` field stays as the final memoir-style paragraph — for photo memories, it's generated from `photoDescription` the same way audio memories generate it from `transcript`.
- [ ] Storage: photos compressed to ~1MB JPEG, stored in `Documents/Photos/<UUID>.jpg`. Same on-device persistence model as audio. iCloud sync deferred to Phase 5.
- [ ] `MemoryCard` — add a thumbnail affordance for photo memories (left side, where the state icon currently sits — replace or stack). Tap to view full photo.

### 4.4 Chapter weaving
- [ ] `generateChapterNarrative()` — already passes `memories.count` and the list of narratives. No changes needed for v1: photo memories produce a narrative paragraph from their description, indistinguishable to the chapter-weaver from an audio memory.
- [ ] v1.1 enhancement: pass the photo URLs alongside the memory narratives so the chapter prompt can reference visual specifics ("the photo on page 4 shows…"). This is a richer integration; defer.

### 4.5 Audiobook tie-in (the headline use case)
- [ ] When the voice-cloned audiobook ships (current "Future phases" in PRD), photo-derived paragraphs are narrated like any other text — no special handling needed at audio generation time. The visual content has already been transcoded to memoir prose at memory-creation time, so the audiobook pipeline is downstream of all that.
- [ ] Worth surfacing in the marketing copy: "Mabel turns photos into spoken memories." The mother's framing — describing a baby moment in the audiobook narrator's voice — is genuinely emotional and should be a hero use case for whatever Phase 5 audiobook landing-page copy gets written.

**Status:** spec only. Not scheduled. Belongs in Phase 4 (post-Phase-1-stable, post-Phase-2-questions). Decision point before starting: confirm cost model still works with vision API in the per-user economics ([[project_api_cost_ceilings]]).

---

## Cleanup (anytime, ~2 hrs total)

These are loose ends from the branding cycle that will create cognitive load if left:

- [ ] `DesignConceptPrototypes.swift` still contains Profile concepts from the last design cycle (scaffolding, not production). Delete or move to `Mabel/archive/`.
- [x] `Mabel/font-comparison/`, `Mabel/screenshots/`, `Mabel/updated_mocks/stoic-app-onboarding-example/` parked on the `branding-paused` branch (commit `20b02c4`). `git checkout branding-paused` brings them back when Phase 4 resumes. (2026-05-04)
- [ ] The OLD pixel-art `MabelMascot` asset is still in use. Per your direction, leave it. The Fiverr swap waits until Phase 4.
- [ ] **Profile section color audit (surfaced 2026-05-27 from on-device review).** User flagged the Profile screen looks messy — multiple colors in play that don't read as a coherent palette. The screen was marked DONE 2026-04-16 ("Settings Card" pattern: form fields in bordered card, SecondaryButton HOME, DestructiveButton LOG OUT burgundy, flat white bg), but visual sweep on real device exposed inconsistencies. Audit pass: grep `ProfileView.swift` for hardcoded colors vs. token references, then narrow the palette to the canonical set (`mabelPrimary`, `mabelText`, `mabelSubtle`, `mabelBurgundy` for destructive, `mabelPrimaryLight` for icon-circle bg). Avoid spending design-uplift effort here pre-Phase 4 — this is a token-discipline pass, not a redesign.

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
