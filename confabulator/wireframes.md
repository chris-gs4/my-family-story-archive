# Wireframes: Family Story Archive

## Overview & User Story Mapping

**Design Approach:** Family Story Archive leverages a clean and intuitive design, focusing on guiding users through storytelling with minimal friction. The platform targets desktop and mobile web access, ensuring accessibility for all users.

**User Story → Screen Mapping:**
- US-1: AI-Guided Interview Questions → [Interview Setup Screen]
- US-2: Audio Transcription → [Transcription Screen]
- US-3: Narrative Generation → [Narrative Editor Screen]
- US-4: Voice Cloning and Audiobook Creation → [Audiobook Creation Screen]

## Screen Flow Diagram

Show the high-level navigation flow between screens:
```
[Landing/Home] → [Sign In] → [Dashboard] → [Project Detail]
   ↓                                                      ↓
[Get Started]                                     [Audio Recording]
                                                      ↓
                                             [Transcription] → [Narrative Generation]
                                                      ↓
                                                [Audiobook Creation]
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

### 6. Audiobook Creation Screen (Enables US-4)

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

        ↓ Audiobook is ready
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