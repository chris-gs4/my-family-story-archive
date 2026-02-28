# Mabel — Your Stories, Written with Care

Mabel is an AI-powered journaling app that helps people capture and preserve their life stories through guided voice recording — then automatically transforms spoken memories into polished written narratives. The mascot is a pixel-art grandmother character named Mabel who serves as a warm, interactive companion throughout the experience.

## Quick Reference

### Bash Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run test         # Run tests

# Database (Prisma)
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migrations
npx prisma db push       # Push schema without migrations (dev)
npx prisma studio        # Open database GUI

# Capacitor (iOS)
npm run cap:sync         # Sync web assets to iOS project
npx cap open ios         # Open Xcode project
```

### Project Structure
```
confabulator/        # Project documentation (IMPORTANT - read these first)
├── PRD.md           # Product requirements and features
├── project-vision.md # Vision and problem statement
├── implementation-plan.md # Technical architecture and roadmap
├── wireframes.md    # UI/UX wireframes and screen flows
├── business-model-canvas.md # Business model
└── PR-FAQ.md        # Press release and FAQ
wireframes/
└── mabel assets/    # Brand assets (logo, mascot, app icon)
src/                 # Source code
├── app/             # Next.js app router (if applicable)
├── components/      # UI components
├── lib/             # Utility functions and services
└── types/           # TypeScript types
ios/                 # Capacitor iOS native shell (Xcode project)
capacitor.config.ts  # Capacitor configuration
```

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

### Platform
web + iOS native (Capacitor)

## Tech Stack

TypeScript, JavaScript, Next.js, React, Tailwind CSS, shadcn/ui, Radix UI, React Hook Form, Zod, Prisma ORM, NextAuth.js, Stripe, AWS S3, Vercel, PostgreSQL (Neon), Inngest (background jobs), Capacitor (iOS native)

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
- Use TypeScript for all code; prefer interfaces over types
- Use functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs (isLoading, hasAccess, canSubmit)
- Use lowercase-with-dashes for directories (components/user-profile)
- Favor named exports for components and utilities

### Before Implementing Features
1. Read the relevant user story in `confabulator/implementation-plan.md`
2. Check acceptance criteria in `confabulator/PRD.md`
3. Reference wireframes in `confabulator/wireframes.md` for UI guidance
4. Follow the data model and API routes in the implementation plan

### Error Handling
- Implement comprehensive error handling at all levels
- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors appropriately for debugging

## Current Focus

The MVP focuses on voice-first guided journaling:

- AI-guided questions that adapt based on previous responses
- Voice recording (native AAC on iOS, WebM on web)
- Audio transcription (Whisper API)
- Narrative generation from transcripts
- Module-based story building (chapter by chapter)
- PDF export of completed stories

Future phases include gamification (streaks, milestones), Family Plan with gifting, voice-cloned audiobooks, and photo integration.

See `confabulator/implementation-plan.md` for the complete development roadmap.

## Repository

https://github.com/chris-squeff/my-family-story-archive

---

*Generated by [Confabulator](https://vibecodelisboa.com/confabulator)*
