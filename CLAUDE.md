# Mabel — Speak Your Memoir Into Existence.

Mabel is an AI memoir companion that helps people capture and preserve their life stories through guided voice interviews — then automatically transforms spoken memories into polished written narratives. Like a skilled biographer in your pocket, Mabel interviews you chapter by chapter, drawing out stories the way a professional would. The mascot is a pixel-art grandmother character named Mabel who serves as a warm, interactive companion throughout the experience.

## Quick Reference

### Platform
**Native iOS app (SwiftUI)** — built and run via Xcode. No web version.

### Bash Commands

Mabel can be developed entirely from the terminal — no Xcode/Cursor IDE required for the edit→build→run→log loop. Verified working on this machine 2026-05-04 (Xcode 26.4.1).

```bash
# Stable simulator UDID — iPhone 17 on iOS 26.4.1
# (use UDID, NOT name — `name=iPhone 16e` resolves to OS:latest which fails to match)
SIM_UDID=AFC0138C-9660-41A4-BD11-B36B5B582A5F
APP_PATH="$HOME/Library/Developer/Xcode/DerivedData/Mabel-ffwzpcgvlfxjjnahsmjhrkvksflj/Build/Products/Debug-iphonesimulator/Mabel.app"
BUNDLE_ID=com.mabel.app

# Build (Debug, simulator)
xcodebuild -project Mabel/Mabel.xcodeproj -scheme Mabel \
  -destination "id=$SIM_UDID" -configuration Debug build

# Boot simulator and show the GUI
xcrun simctl boot "$SIM_UDID"
open -a Simulator

# Install + launch
xcrun simctl install booted "$APP_PATH"
xcrun simctl launch booted "$BUNDLE_ID"

# Stream logs (run in a second terminal)
xcrun simctl spawn booted log stream \
  --predicate 'subsystem CONTAINS "Mabel" OR processImagePath CONTAINS "Mabel"'

# Screenshot
xcrun simctl io booted screenshot /tmp/mabel.png

# Tests
xcodebuild -project Mabel/Mabel.xcodeproj -scheme Mabel \
  -destination "id=$SIM_UDID" test

# List available simulators (run if the UDID above stops working — runtimes shift after Xcode updates)
xcrun simctl list devices available | grep iPhone
```

**When to crack Xcode open anyway:**
- Adding new files to the project (`project.pbxproj` target membership)
- Asset catalog edits (`.xcassets`)
- Step-debugging with breakpoints
- SwiftUI Previews

### Project Structure
```
Mabel/                   # ← THE APP (SwiftUI iOS project)
├── Mabel.xcodeproj/     # Xcode project
├── Mabel/
│   ├── MabelApp.swift   # App entry point
│   ├── Views/           # All screens (Welcome, Setup, Library, Recording, etc.)
│   ├── Components/      # Reusable UI (CTAButton, ChapterCard, ProgressBar, etc.)
│   ├── Models/          # Data models (AppState, Chapter, Memory, UserProfile)
│   ├── Services/        # OpenAIService, AudioRecorderService, StoryProcessingService, PDFExportService
│   ├── Theme/           # MabelColors, MabelFonts, MabelStyle
│   └── Fonts/           # Comfortaa-Variable.ttf
├── MabelTests/          # Unit tests (21 tests)
confabulator/            # Product documentation
├── PRD.md               # Product requirements and features
├── project-vision.md    # Vision and problem statement
├── implementation-plan.md # Technical architecture and roadmap
├── wireframes.md        # UI/UX wireframes and screen flows
├── business-model-canvas.md # Business model
└── PR-FAQ.md            # Press release and FAQ
wireframes/
└── mabel assets/        # Brand assets (logo, mascot, app icon)
archive/                 # Archived reference materials (NOT part of the app)
├── landing-page/        # Next.js landing page (for future website reference)
├── demo-night/          # Demo night pitch materials and docs
├── legacy-web/          # Old web infrastructure (Prisma, Capacitor, tests, scripts)
├── old-editor-configs/  # Cursor/Windsurf configs
└── old-docs/            # Legacy markdown docs
```

## IMPORTANT: What to Ignore

The `archive/` directory contains legacy web code, demo night materials, and old configs. **Do not reference or modify anything in `archive/`** — it exists only as future reference material.

## Claude Code Resources

Auto-loaded context and workflows:

- **`Mabel/CLAUDE.md`** — SwiftUI design-system instructions, auto-loaded when working inside `Mabel/`
- **`Mabel/STYLE_GUIDE.md`** — THE single source of truth for all UI decisions (overrides everything else)
- **`Mabel/ARCHITECTURE.md`** — navigation, data model, view consolidation rules
- **`Mabel/decisions/`** — ADR-style log of architecture and UX decisions. Before proposing any non-trivial change, grep here first. `MISTAKES.md` in the same folder lists specific errors to not repeat.
- **`.claude/skills/`** — auto-discovered skills:
  - `/ui-review` — HIG, font, and accessibility audit
  - `/design-uplift` — generate 3 visual concepts with UX-science ranking
  - `/check-past-decisions` — search `decisions/` + `MISTAKES.md` before re-opening settled questions

## Project Context

### Target Customer
**Storytellers:** Anyone who wants to capture their personal life story — people approaching milestones, parents wanting to leave something for their children, individuals reflecting on their experiences, or anyone who enjoys rediscovering old memories. **Gift givers:** People who want to preserve a loved one's stories before they're lost — buying Mabel for parents, grandparents, or family members via the Family Plan. No writing required — talking is the UX, so anyone can use it.

### Value Proposition
Your memoir companion. Just talk — Mabel writes. Mabel interviews you chapter by chapter, asking the right questions and drawing out stories the way a skilled biographer would. She records your voice and transforms your spoken memories into polished written narratives. No writing required — you speak your autobiography into existence.

### Brand
- **Name:** Mabel
- **Tagline:** Speak Your Memoir Into Existence.
- **Mascot:** Pixel-art grandmother character named Mabel — warm, encouraging, interactive
- **Brand assets:** `wireframes/mabel assets/` (logo, square icon, tagline)
- **One-liner:** Your memoir companion. Just talk — Mabel writes.
- **Emotional hook:** Everyone's stories deserve to be heard.
- **Tone:** Fun over formal. Warm and caring, like sitting with a biographer who genuinely wants to hear your story.

## Tech Stack

Swift, SwiftUI, AVFoundation (audio recording), OpenAI API (Whisper + GPT-4o), local JSON persistence, PDFKit (export)

## Key Documentation

**CRITICAL**: Before starting any work, familiarize yourself with the Confabulator documentation in `confabulator/`:

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| `PRD.md` | Feature specs, user stories, acceptance criteria | Before implementing any feature |
| `project-vision.md` | Problem statement, target users, goals | For strategic decisions |
| `implementation-plan.md` | Architecture, tech stack, data model, API routes | Technical implementation |
| `wireframes.md` | UI layouts, screen flows, component placement | Building UI components |
| `business-model-canvas.md` | Revenue, costs, partnerships | Business logic decisions |

## Development Guidelines

### Code Style
- Swift with SwiftUI
- Use @Observable for state management (iOS 17+)
- Use descriptive variable names with auxiliary verbs (isLoading, hasAccess, canSubmit)
- Design system: Comfortaa font, MabelColors/MabelFonts/MabelStyle

### Before Implementing Features
1. Read the relevant user story in `confabulator/implementation-plan.md`
2. Check acceptance criteria in `confabulator/PRD.md`
3. Reference wireframes in `confabulator/wireframes.md` for UI guidance
4. Follow the data model in the implementation plan

### Error Handling
- Implement comprehensive error handling at all levels
- Use do/catch for async operations
- Provide user-friendly error messages
- Log errors appropriately for debugging

## Current Focus

The MVP focuses on voice-first guided memoir interviews:

- AI-guided questions that adapt based on previous responses
- Voice recording (M4A via AVAudioRecorder)
- Audio transcription (Whisper API)
- Narrative generation from transcripts (GPT-4o)
- 10-chapter story structure, 5 memories per chapter
- PDF export of completed stories

Future phases include gamification (streaks, milestones), Family Plan with gifting, voice-cloned audiobooks, and photo integration.

See `confabulator/implementation-plan.md` for the complete development roadmap.

## Repository

https://github.com/chris-squeff/my-family-story-archive

---

*Generated by [Confabulator](https://vibecodelisboa.com/confabulator)*
