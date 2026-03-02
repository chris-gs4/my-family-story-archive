# Mabel — Architectural Notes

> Key architectural decisions, constraints, and development notes for the Mabel app.
> Claude Code and all contributors should reference this document alongside STYLE_GUIDE.md and SCREEN_DESCRIPTIONS.md.

---

## App Structure Overview

Mabel is a chapter-based voice journaling app where users write a 10-chapter book about their life by recording voice memos. Each chapter contains 5 memories to record. AI processes the voice recordings into polished written narratives that form the user's book.

---

## Navigation Architecture

### Onboarding Flow (first launch only)
```
Screen 1 (Welcome) → Screen 2 (Setup) → Screen 3 (Library/Home)
```

### Main App Flow (after onboarding)
```
Screen 3 (Library/Home) ←→ Screen 7 (My Stories)
       ↓                           
Screen 4/6 (Recording Setup)       
       ↓                           
Screen 5 (Recording Active)        
       ↓                           
Screen 4/6 (Recording Setup — updated state)
```

### Persistent Tab Bar
- **HOME** | **MY STORIES**
- Appears on ALL screens after onboarding is complete
- HOME navigates to Screen 3 (Library)
- MY STORIES navigates to Screen 7 (Book Reader)

### Profile Access
- Profile icon ("P") appears in the top-right corner of all main screens after onboarding
- Navigates to Screen 9 (Profile Page)

### App Launch Behavior
- First launch: Show Screen 1 (Welcome) → onboarding flow
- All subsequent launches: Skip onboarding, land directly on Screen 3 (Library/Home)

---

## View Consolidation Rules

### Screen 4 and Screen 6 are the SAME view
- Screens 4 and 6 from the wireframes must be built as a **single SwiftUI view** (e.g., `RecordingSetupView`)
- The view has conditional elements based on recording state:
  - **Fresh state (no recordings yet):** No progress bar, no "Continue Last Recording" button
  - **In-progress state (has previous recordings):** Shows progress bar, updated memory count, new suggestion prompts (excluding previously used ones)
  - **Saved progress state:** Shows "CONTINUE LAST RECORDING" button (appears only if user used "Stop & Save" without finishing a memory)

### Screen 3 and Screen 8 share layout
- Screen 8 (Library Finished) is the **completed state** of Screen 3 (Library)
- Can be built as the same view with conditional rendering based on `chaptersCompleted == 10`
- Completed state shows congratulations message and export options instead of the featured chapter card

---

## Chapter & Memory Data Model

### Chapters (10 total, fixed)
| # | Title | Topic |
|---|-------|-------|
| 1 | Childhood | Early memories, home, family traditions |
| 2 | Adolescence | Teenage years, school, friendships |
| 3 | First Love | Relationships, heartbreak, romance |
| 4 | First Life Lessons | Defining moments, mistakes, growth |
| 5 | College or First Job | Education, early career, independence |
| 6 | Parenthood or Mid Life Crisis | Family, identity, transitions |
| 7 | Career | Professional life, achievements, struggles |
| 8 | Hard Times | Adversity, loss, overcoming challenges |
| 9 | Triumphs | Victories, proudest moments, celebrations |
| 10 | Legacy | Wisdom, values, what you want to pass on |

### Memories (5 per chapter, 50 total)
- Each memory is one voice recording (or typed entry)
- A memory goes through these states:
  1. **Not started** — no recording exists
  2. **In progress** — user started recording but used "Stop & Save" (partial save)
  3. **Submitted** — user hit "SAVE MEMORY" (recording complete, sent to AI)
  4. **Processed** — AI has transformed the recording into polished narrative text

### Chapter States
- **Locked** — user hasn't paid (Chapters 2-10 before payment)
- **Available** — unlocked, no memories recorded yet
- **In Progress** — 1-4 memories submitted
- **Completed** — 5/5 memories submitted and processed

---

## AI Suggestion System

- Each chapter has a pool of topic-specific prompts/questions
- Recording Setup screen shows 3 suggestions at a time
- On return visits, suggestions are **randomly refreshed**, excluding:
  - Topics that have been previously selected AND submitted
- This ensures users always see fresh prompts relevant to the current chapter
- Post-MVP: suggestions become AI-generated based on user's previous responses

---

## Paywall Strategy

- **Chapter 1 is free** — full functionality, 5 memories, AI processing
- **Chapters 2-10 require payment** — locked state with visual indicator (gray/lock icon)
- **Paywall screen is post-MVP** — for now, chapters simply show as locked with no way to unlock
- **Audiobook export is a premium upsell** — requires additional payment beyond the base subscription
- **PDF export is included** in the base paid tier

---

## Post-MVP Features (Do NOT build yet, but plan for)

These features are referenced in the wireframes but should NOT be implemented in MVP. Build placeholders or visual indicators only.

| Feature | Notes |
|---------|-------|
| Paywall / Payment Screen | Show locked chapters visually, no payment flow |
| Push Notifications | Writing goal frequency drives notification schedule |
| Audiobook Export | Button visible but non-functional |
| Voice Cloning | Uses ElevenLabs API, deferred entirely |
| AI-Generated Suggestions | Start with hardcoded prompts per chapter |
| Chapter Completion Celebration | Mini-celebration animation when 5/5 memories done |
| Payment Method in Profile | Placeholder field only |
| Account/Auth System | No login for MVP — data stored locally |

---

## Technical Requirements (MVP)

### Must Build
- [ ] Local data persistence (SwiftData or similar) for chapters, memories, progress
- [ ] Audio recording via AVFoundation (real mic input, save audio files locally)
- [ ] Audio transcription via Whisper API
- [ ] Narrative generation via Claude/GPT API (transform transcript into polished text)
- [ ] Chapter progress tracking (X of 5 memories, X of 10 chapters)
- [ ] Recording state management (fresh, in-progress, saved-progress, submitted)
- [ ] "Stop & Save" partial recording persistence
- [ ] Suggestion prompt pool per chapter with exclusion logic
- [ ] PDF export of completed book
- [ ] Tab bar navigation (HOME / MY STORIES)
- [ ] Profile page with editable display name

### Can Defer
- [ ] Push notifications
- [ ] Payment / subscription integration
- [ ] Audiobook generation
- [ ] Voice cloning
- [ ] Cloud sync / account system
- [ ] AI-generated dynamic suggestions

---

## File Organization

```
wireframes/
├── app-mocks/
│   ├── excalidraw/          ← Original hand-drawn wireframes
│   ├── figma/               ← Polished Figma mockups (when ready)
│   └── old/                 ← Previous version wireframes
├── brand-assets/
│   ├── gradient-app-background.png
│   ├── mabel-app-icon.png
│   ├── mabel-logo-horizontal.png
│   ├── mabel-mascot.png
│   └── mabel_type.png
Mabel/
├── STYLE_GUIDE.md           ← Visual design source of truth
├── SCREEN_DESCRIPTIONS.md   ← This file's companion — screen-by-screen specs
├── ARCHITECTURE.md          ← This file
└── Mabel/
    ├── Views/
    ├── Models/
    ├── Components/
    ├── Theme/
    └── Fonts/
```
