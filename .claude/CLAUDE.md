# Mabel — Your Stories, Written with Care

Mabel is an AI-powered journaling app that helps people capture and preserve their life stories through guided voice recording — then automatically transforms spoken memories into polished written narratives. The mascot is a pixel-art grandmother character named Mabel who serves as a warm, interactive companion throughout the experience.

## Quick Reference

### Platform
**Native iOS app (SwiftUI)** — built and run via Xcode. No web version.

### Bash Commands
```bash
# Open the Xcode project
open Mabel/Mabel.xcodeproj

# Build & run via Xcode
# Cmd+B to build, Cmd+R to run, Cmd+U to run tests
```

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

## Project Context

### Target Customer
Anyone who wants to capture their personal life story through guided voice journaling — people approaching milestones, parents wanting to leave something for their children, individuals reflecting on their experiences, or anyone who enjoys rediscovering old memories. Secondary: people gifting Mabel to loved ones via the Family Plan.

### Value Proposition
Mabel removes all the friction from preserving your life story. Instead of staring at a blank page, you just talk to Mabel — she asks the right questions, records your voice, and transforms your spoken memories into polished written narratives. It's less like "writing a book" and more like a fun tool that helps you re-access your memories with a warm AI companion.

### Brand
- **Name:** Mabel
- **Tagline:** Your Stories, Written with Care
- **Mascot:** Pixel-art grandmother character named Mabel — warm, encouraging, interactive
- **Brand assets:** `wireframes/mabel assets/` (logo, square icon, tagline)
- **Tone:** Fun over formal. Warm and caring, like chatting with someone who genuinely wants to hear your story.

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

The MVP focuses on voice-first guided journaling:

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
