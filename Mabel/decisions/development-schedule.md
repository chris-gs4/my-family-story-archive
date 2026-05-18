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
- **2026-05-18 — Phase 1.7 verified on real device, 3/3.** Smoke-tested in Chapter 2 (see Phase 1.8 finding below). Test 1 (pancakes script read aloud with soft ambient music incidentally playing in the background) succeeded — Whisper handled the substantive English speech-over-music without issue, GPT-4o generated a full pancakes/mother/brother narrative, derived title fell back to the 60-char Phase 1.5 path. Test 2 ("test test test", ~3s) — last session this came back as 테스트 테스트 테스트; tonight it came back as clean English "test test test" and the existing length-floor caught it as `.failed`. Language pin verified. Test 3 (20s silence with continuous background music) — `MemoryCard` shows red triangle, retry+delete, *empty* subtitle. The empty subtitle is direct evidence the hallucination filter caught a known artifact (likely "Thank you for watching") and nulled the transcript before the length-floor saw it. No fabricated "Maple Street" narrative anywhere. Phase 1.7 closes.
- **2026-05-18 — Phase 1.8 bug confirmed blocking real-device testing.** Attempted to run the 1.7 smoke tests in Chapter 1 (the natural starting place, since it had the dummy memories from last session). Chapter 1 was at 5/5 / approved, so `RecordingSetupView` had switched to `chapterCompleteView` and the hero mic was *gone* — no way to record a 6th memory. Routed around by switching to Chapter 2 (empty, mic present). This is the exact symptom the Phase 1.8 spec describes; tonight upgraded it from "design wart" to "blocks real testing". Adds urgency to 1.8 — even if the user only wants 5 memories per chapter long-term, the inability to record into a finished chapter for *any* reason (including verifying a code change) is hostile.
- **2026-05-18 — `MemoryCard` failed-state subtitle bug (small fix, roll into 1.8).** Test 3 surfaced this: when the hallucination filter or length-floor nulls the transcript, the failed `MemoryCard` has no informative subtitle — just title + duration + red triangle + retry/delete. Test 2 happened to show "test test test" as the subtitle because the transcript survived Whisper but failed the length-floor; Test 3 showed nothing because the filter emptied the transcript first. Root cause: the card renders `transcript` as the failed-state body text, not `errorMessage`. The friendly copy ("We couldn't hear a memory in that recording…") only surfaces in the chapter-complete banner (`RecordingSetupView.chapterCompleteView` lines 210–230), which only renders at 5/5 memories. A user with <5 memories who hits a failure has no on-screen explanation of why. Fix: in `MemoryCard`, prefer `errorMessage` over `transcript` for the failed-state subtitle (or render both). Tiny change, batch it into the Phase 1.8 commit since we're already in that file's neighborhood.
- **2026-05-18 — UX gap: memory cards on the recording list are not tappable to view their narratives.** Visible in tonight's Chapter 2 test — once Memory 1 (pancakes) completed successfully, tapping the card did nothing. The full narrative is generated and stored, but the user has no way to read it back until the chapter hits 5/5 and the chapter-review flow opens. For a memoir app this is the wrong shape: the user wants to scrub their just-recorded memory to confirm it captured what they said. Not a Phase 1.7 blocker, but it'll keep biting once we ask users to record real family stories. Candidates: (a) tap-to-expand inline on the card, (b) tap to navigate to a per-memory detail view, (c) bake into the Phase 1.8 layout rework. Recommend (a) — cheapest, no nav change, no new view. Defer to Phase 1.8 or as standalone polish.
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
- [ ] Smoke test on real device: re-record a substantive memory (pancakes script, swimming-hole, or Mrs. Hollis butterscotch — anything ~25s) and confirm: (a) memory lands green/healthy with narrative, (b) within a few seconds of the narrative appearing, the card title swaps from the verbose 60-char excerpt to a tight 3–5 word title, (c) title is title-cased and reads like a chapter heading. **The swap is the verification** — first the card shows the derivation, then the AI title replaces it.

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

- [ ] `Mabel/Mabel/Views/RecordingSetupView.swift` `body` (lines 36–63) — reorder the ScrollView VStack: `recordingUI` first (always shown, never replaced), then `memoryList`, then chapter status section.
- [ ] Replace the `if chapter.completedMemoryCount >= Chapter.memoriesPerChapter { chapterCompleteView } else { recordingUI }` mutual exclusion at line 54 with: always show `recordingUI`, conditionally append the relevant status block (processing banner / failure banner / "ready to review" CTA / "approved" badge) below the memory list.
- [ ] Lift the 5-memory hard cap. `Chapter.memoriesPerChapter = 5` becomes a *soft* threshold for chapter-narrative generation (still triggers narrative at 5), not a hard limit on recording. Audit all uses of `memoriesPerChapter` — many will now be comparison checks like `>= 5` which are fine; the only one that prevented recording was the conditional in RecordingSetupView.
- [ ] Edge case: if the user adds a 6th memory to an already-approved chapter, does the chapter narrative regenerate? Two options: (a) leave the approved narrative alone, the new memory just sits as a "bonus" memory not folded into the published chapter, OR (b) mark chapter as no-longer-approved and prompt user to re-review. **Recommend (a)** for simplicity — approval should be sticky. New memories are visible in the list but the chapter narrative is the snapshot from when they approved.
- [ ] Smoke test: in a 5/5 approved chapter, tap mic, record a substantive 6th memory. Confirm: it appears in the list, gets a narrative, the chapter approval is NOT revoked.

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
