# Wireframes: Mabel

## Overview & User Story Mapping

**Design Approach:** Mabel leverages a clean and intuitive design, focusing on guiding users through storytelling with minimal friction. The platform targets desktop web, mobile web, and iOS native (via Capacitor) access, ensuring accessibility for all users.

**User Story → Screen Mapping:**
- US-1: AI-Guided Interview Questions → [Interview Setup Screen]
- US-2: Audio Transcription → [Transcription Screen]
- US-3: Narrative Generation → [Narrative Editor Screen]
- US-4: Voice Cloning and Audiobook Creation → [Audiobook Creation Screen]

## Screen Flow Diagram ⭐ UPDATED FOR MODULE WORKFLOW

Show the high-level navigation flow between screens:
```
[Landing/Home] → [Sign In] → [Dashboard] → [Project Setup]
   ↓                                             ↓
[Get Started]                              [Interviewee Info]
                                                 ↓
                                          [Module Dashboard] ← (main hub)
                                                 ↓
                          ┌──────────────────────┼──────────────────────┐
                          ↓                      ↓                      ↓
                    [Create Module]      [Answer Questions]     [Review Chapters]
                          ↓                      ↓                      ↓
                   [Generating...]         [Save Progress]      [Regenerate/Approve]
                          ↓                      ↓                      ↓
                   [Questions Ready]    [Generate Chapter]      [Module Complete]
                                                 ↓
                                          [Book Compilation]
                                                 ↓
                                           [Export PDF]
```

## ASCII Wireframes

### 1. Landing/Home Screen
**User Stories Enabled:** [US-1]

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]     <Home> <Features> <Pricing>      [Sign In]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Capture Your Family Stories Easily             │
│         Transform interviews into narratives and audiobooks │
│                                                             │
│              [Get Started Free →]  <Learn More>            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Feature 1         Feature 2         Feature 3             │
│  Icon/Image        Icon/Image        Icon/Image            │
│  Description       Description       Description           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: <About> | <Contact> | <Terms> | <Privacy>        │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Get Started Free]
```

### 2. Authentication Screen (Enables US-1)

```
┌──────────────────────────────────────┐
│           [Logo]                     │
│                                      │
│        Sign Up / Log In              │
│                                      │
│  {Email................}             │
│  {Password.............}             │
│  [ ] Remember me                     │
│                                      │
│  [Log In / Sign Up →]                │
│                                      │
│  ─────────── OR ───────────          │
│                                      │
│  [Continue with Google]              │
│  [Continue with GitHub]              │
│                                      │
│  <Forgot password?>                  │
│  <Need an account? Sign up>          │
│                                      │
└──────────────────────────────────────┘

        ↓ After successful auth
```

### 3. Main Dashboard (Enables US-2, US-3)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│ [Nav]  │  Welcome Back, [User]!                            │
│        │                                                    │
│ <Home> │  [Create New Project →]                           │
│ <Work> │                                                    │
│ <Team> │  ┌──────────────────────────┐                     │
│        │  │ Recent Projects          │                     │
│        │  ├──────────────────────────┤                     │
│        │  │ Project 1          [Open]│                     │
│        │  │ Project 2          [Open]│                     │
│        │  │ Project 3          [Open]│                     │
│        │  └──────────────────────────┘                     │
│        │                                                    │
│        │  [Primary CTA Button →]                           │
│        │                                                    │
└────────┴────────────────────────────────────────────────────┘

        ↓ User clicks on a project
```

### 4. Project Detail Screen (Enables US-1, US-2, US-3, US-4)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├─────────────────────────────────────────────────────────────┤
│  Project Title: [Project Name]                              │
│                                                             │
│  [Record Interview →]   [Upload Audio →]                   │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ AI-Guided Questions      │  │ Transcription Status     │ │
│  │ - Question 1             │  │ - Transcription Ready    │ │
│  │ - Question 2             │  │ - Edit Transcript        │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  [Generate Narrative →]  [Create Audiobook →]              │
│                                                             │
│  [Share Project]                                            │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Generate Narrative]
```

### 5. Narrative Editor Screen (Enables US-3)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├─────────────────────────────────────────────────────────────┤
│  Project: [Project Name]                                    │
│                                                             │
│  Narrative Editor                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Narrative Text Area...............................]  │ │
│  │ [...................................................] │ │
│  │ [Edit and Enhance Your Story Here.................]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Save Narrative]  [Preview]  [Generate Audiobook →]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Generate Audiobook]
```

### 6. Module Dashboard Screen ⭐ NEW (Main Hub)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├─────────────────────────────────────────────────────────────┤
│  ← Back to Projects   │   Project: [Mom's Life Story]      │
│                                                             │
│  Interviewee: Mary Johnson (Mother, born 1955)             │
│  Progress: 2 of 5 modules completed                        │
│  [━━━━━━━━━━━━━░░░░░░░░░░░░░] 40%                         │
│                                                             │
│  [+ Create New Module]                                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Module 1: Early Life & Childhood          [✓ Approved]│  │
│  │ 18 questions answered · Chapter generated            │  │
│  │ <View Chapter> <Download PDF>                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Module 2: Career & Education              [✓ Approved]│  │
│  │ 20 questions answered · Chapter generated            │  │
│  │ <View Chapter> <Download PDF>                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Module 3: Family Life                  [In Progress] │  │
│  │ 12 of 17 questions answered                          │  │
│  │ [Continue Answering →]                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Export Complete Book as PDF]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks "Continue Answering" or creates new module
```

### 7. Question Answering Interface ⭐ NEW (One-at-a-time)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├─────────────────────────────────────────────────────────────┤
│  ← Back to Modules    │   Module 3: Family Life            │
│                                                             │
│  Question 13 of 17                    [━━━━━━━━━━░░░░] 76% │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │  How did you meet your husband? What do you          │ │
│  │  remember most about that first encounter?           │ │
│  │                                                       │ │
│  │  Note: You mentioned meeting at a dance in Module 1. │ │
│  │  Tell me more about that!                            │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Your Response:                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │ [Type your answer here...........................]    │ │
│  │ [.................................................]    │ │
│  │ [.................................................]    │ │
│  │ [.................................................]    │ │
│  │                                                       │ │
│  │ 247 words                         Auto-saved 30s ago │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [← Previous Question]            [Next Question →]         │
│                                                             │
│  12 of 17 answered · [Generate Chapter] (need 50%+)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User generates chapter when ready
```

### 8. Chapter Review & Regeneration Screen ⭐ NEW

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├─────────────────────────────────────────────────────────────┤
│  ← Back to Modules    │   Module 3: Family Life - Chapter  │
│                                                             │
│  Chapter Version 2 (Latest)          <View Version 1>       │
│  Generated: 2 minutes ago            3,247 words            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │  Chapter 3: Finding Love                             │ │
│  │                                                       │ │
│  │  The summer of 1975 marked a turning point in Mary's │ │
│  │  life. Fresh out of nursing school, she decided to   │ │
│  │  attend the hospital fundraiser dance against her    │ │
│  │  better judgment. Little did she know that evening   │ │
│  │  would change everything...                          │ │
│  │                                                       │ │
│  │  [... chapter content continues ...]                 │ │
│  │                                                       │ │
│  │  ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯  │ │
│  │  [Scroll for more...]                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Feedback for Regeneration (optional):                     │
│  {Make it more emotional and add more details about...}    │
│                                                             │
│  Settings: ○ 1st Person ● 3rd Person │ Tone: Warm          │
│                                                             │
│  [Regenerate with Feedback] [Download PDF] [✓ Approve & Complete]│
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User approves or regenerates
```

### 9. Audiobook Creation Screen (Phase 3 - Future)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Projects> <Settings>    [User ▼]     │
├─────────────────────────────────────────────────────────────┤
│  Project: [Project Name]                                    │
│                                                             │
│  Audiobook Creation                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Voice Cloning Progress Bar.........................] │ │
│  │ [...................................................] │ │
│  │ [Creating Audiobook with Voice Cloning..............] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Download Audiobook]  [Share Audiobook]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ Audiobook is ready (Phase 3)
```

## Mobile Responsive Variations

### Landing Page (Mobile)

```
┌─────────────────────┐
│  [☰]   Logo  [User] │
├─────────────────────┤
│                     │
│  Capture Stories    │
│  Transform with AI  │
│                     │
│  [Get Started]      │
│  <Learn More>       │
│                     │
├─────────────────────┤
│  Feature 1          │
│  Icon + Text        │
├─────────────────────┤
│  Feature 2          │
│  Icon + Text        │
├─────────────────────┤
│  Feature 3          │
│  Icon + Text        │
└─────────────────────┘
```

## Interactive States

### Button States
```
[Normal Button]  [Hover: underline]  [Disabled: gray]  [Loading: spinner]
```

### Form Validation
```
{Valid Input✓}   {Invalid Input✗ Error message}
```

## Design System Quick Reference

- **Primary Action:** [Button] style
- **Secondary Action:** <Link> style
- **Input Fields:** {Field Name..........} style
- **Dropdowns:** (Select Option ▼) style
- **Navigation:** Top bar or sidebar with <Links>
- **Cards:** Boxes with ┌─┐└┘ characters

---

**REMEMBER:** Generate VISUAL ASCII wireframes with boxes and layout diagrams, NOT textual descriptions. Every screen must be drawn using ASCII art. Use the founder's design inspiration if mentioned to inform the visual layout and components.