# Mabel — iOS UI Style Guide

> This file is the single source of truth for all UI decisions in the Mabel app.
> Claude Code and all contributors MUST follow these rules when building or editing any SwiftUI view.
> When in doubt, refer back to this document. When in conflict with any other file, THIS document wins.

---

## Brand Identity

- **App Name:** Mabel
- **Tagline:** Speak Your Memoir Into Existence.
- **One-liner:** Your memoir companion. Just talk — Mabel writes.
- **Feel:** Warm, cozy, nostalgic, inviting. Like opening a treasured keepsake box. NOT techy, NOT corporate, NOT clinical.
- **Mascot:** Pixel-art grandmother named Mabel — sitting in a cozy armchair, writing with a quill pen in a teal-trimmed journal. She is warm, wise, and smiling. She represents the user's inner storyteller and memoir companion.
- **Marketing angle:** "Think about your grandparents. The stories they carry that you've never heard. Mabel makes it almost effortless to capture them." Users may buy this for parents or grandparents as a gift. No writing required — talking is the UX.

---

## Background — CRITICAL

**Every screen uses the warm peach/cream background.**

### Background Specification
- **Color:** Solid warm peach/cream `#F3E0D2`
- **Feel:** Warm, cozy, like parchment or a vintage photo album

### Implementation:
```swift
ZStack {
    Color.mabelWarmBg
        .ignoresSafeArea(.all, edges: .all)

    // Content goes here
}
```

### Background Rules
- The background MUST fill the ENTIRE screen, including behind the status bar and home indicator.
- There must NEVER be black areas visible at the top or bottom of any screen.
- Content sits ON TOP of the background and respects safe areas.
- Cards use **white** (`#FFFFFF`) backgrounds — they should be bright and clean against the warm background.
- The warm peach background provides the cozy, nostalgic feel. Cards pop against it with their white surfaces.

---

## Color Palette

| Token               | Hex       | Usage                                          |
|----------------------|-----------|-------------------------------------------------|
| `mabelWarmBg`       | `#F3E0D2` | Screen background (warm peach/cream)            |
| `mabelText`          | `#2D2019` | Primary text, headings, bold content            |
| `mabelGreeting`      | `#9E8578` | Greeting headlines, warm hero text              |
| `mabelTeal`          | `#1F7A6F` | CTA buttons, primary accent, active states, labels |
| `mabelBurgundy`      | `#A3243B` | Secondary accent, recording active state        |
| `mabelGold`          | `#E9C46A` | Warm highlights, mascot glow, decorative        |
| `mabelCopper`        | `#B07850` | Completed chapter indicators, warm accent       |
| `mabelMintBadge`     | `#D4F0EC` | Light mint badge backgrounds (percentage pills) |
| `mabelSurface`       | `#FFFFFF` | Cards, elevated surfaces (white)                |
| `mabelSubtle`        | `#7A7168` | Helper text, placeholders, secondary labels     |
| `mabelTealDark`      | `#146159` | Darker teal variant (~teal-700)                  |
| `mabelChapterGray`   | `#D4D0CC` | Incomplete chapter circle backgrounds           |

### Color Rules
- Background is ALWAYS `mabelWarmBg` (#F3E0D2) on EVERY screen
- NEVER use pure black (#000000) for text
- Primary text is ALWAYS `mabelText` (#2D2019)
- Greeting/hero text uses `mabelGreeting` (#9E8578) for warm, inviting headlines
- Subtle/secondary text uses `mabelSubtle` (#7A7168)
- Card backgrounds are **white** (#FFFFFF) — they should feel bright and clean against the warm background
- Interactive elements (text inputs, pill buttons) also use white backgrounds
- Teal labels (e.g., "Today's Prompt:") use `mabelTeal`

---

## Typography

**Font Family:** Comfortaa (Google Font — imported as custom font via variable TTF in Xcode)

| Style          | Weight   | Size  | Color          | Usage                          |
|----------------|----------|-------|----------------|--------------------------------|
| Hero heading   | Bold     | 32pt  | mabelText      | Main screen headlines           |
| Heading        | Bold     | 28pt  | mabelText      | Section titles                  |
| Subheading     | Medium   | 20pt  | mabelText      | Secondary headings              |
| Body           | Regular  | 16pt  | mabelText      | Paragraphs, descriptions        |
| Helper text    | Regular  | 14pt  | mabelSubtle    | Placeholders, captions, hints   |
| Small label    | Light    | 12pt  | mabelSubtle    | Dates, metadata, fine print     |
| Wordmark       | —        | —     | —              | ALWAYS use MabelWordmark image asset, NOT text. Height: 24pt |

### Typography Rules
- ALWAYS use Comfortaa font. NEVER fall back to system font.
- If Comfortaa doesn't load, debug it — don't silently use San Francisco.
- The "Mabel" wordmark at the top of screens must be the IMAGE asset (MabelWordmark / mabel_type.png), never a Text() view.
- Line height: 1.4 for body text, 1.2 for headings.

---

## Layout & Spacing

### Screen Structure
Every screen follows this structure:
```
SafeArea Top (respected, with minimum 16pt padding)
│
├── Wordmark (MabelWordmark image, centered, 24pt height)
│   ↕ 24pt
├── Screen Content (scrollable if needed)
│   ↕ 40pt minimum
└── CTA / Bottom Action (pinned to bottom if applicable)
    ↕ 40pt from bottom safe area edge
```

### Spacing Tokens
| Token          | Value | Usage                                    |
|----------------|-------|------------------------------------------|
| `screenPadH`  | 24pt  | Horizontal padding on all screens         |
| `sectionGap`  | 32pt  | Between major sections                    |
| `elementGap`  | 16pt  | Between elements within a section         |
| `tightGap`    | 8pt   | Between closely related elements          |
| `bottomSafe`  | 40pt  | Minimum bottom padding above safe area    |
| `topSafe`     | 16pt  | Minimum top padding below safe area       |

### Layout Rules
- ALL screens use 24pt horizontal padding. No exceptions.
- Content that may exceed screen height MUST be in a ScrollView.
- Pill button grids use FlowLayout with 8pt horizontal and 8pt vertical spacing.
- Cards use 16pt internal padding.

---

## Safe Areas — CRITICAL

This is the #1 source of visual bugs. Follow these rules exactly:

1. The gradient background MUST extend to fill the ENTIRE screen, including behind the status bar and home indicator. Use `.ignoresSafeArea(.all, edges: .all)` on the background layer.
2. Content itself must RESPECT safe areas — use proper padding so text/buttons don't overlap the notch or home indicator.
3. There must NEVER be black areas visible at the top or bottom of any screen.
4. Test on iPhone 15 Pro and iPhone SE simulators to catch safe area issues.

### Pattern to follow:
```swift
ZStack {
    // BACKGROUND — fills entire screen
    Color.mabelWarmBg
        .ignoresSafeArea(.all, edges: .all)

    // CONTENT — respects safe areas
    VStack {
        // ...
    }
    .padding(.horizontal, 24)
}
```

---

## Components

### CTA Button (Primary)
- Full width (minus horizontal padding)
- Height: 56pt
- Shape: Capsule (fully rounded pill)
- Background: `mabelTeal`
- Text: Comfortaa Bold, 17pt, white
- Border: 3pt `mabelTeal.opacity(0.8)`
- Shadow: `black.opacity(0.15)`, radius 10, y: 4
- **Disabled:** `mabelSurface` fill, `mabelSubtle` text, no border, no shadow, 40% opacity
- **Pressed:** scale 0.98, spring animation (response: 0.3)

### Pill Button (Selectable)
- Font: Comfortaa 15pt — Regular (unselected) / SemiBold (selected)
- Padding: horizontal 12pt, vertical 10pt
- Full width within grid cell, min height 48pt
- Corner radius: 14pt
- Border: 3pt on all states
- **Unselected:** white background, `mabelText` text, `gray.opacity(0.35)` border, shadow `black.opacity(0.1)` r:4 y:2
- **Selected:** `mabelTeal` background, white text, `mabelTeal` border, glow shadow `mabelTeal.opacity(0.4)` r:12 y:4
- **Disabled:** `gray.opacity(0.15)` background, `mabelSubtle.opacity(0.5)` text, `gray.opacity(0.35)` border, 50% opacity
- **Pressed:** scale 0.95, spring animation (response: 0.3, dampingFraction: 0.6)

### Text Input
- Font: Comfortaa Regular, 17pt, `mabelText`
- Padding: horizontal 16pt, vertical 14pt
- Corner radius: 14pt
- Background: solid **white**
- Border: 3pt on all states
- **Unfocused:** 3pt `mabelTeal.opacity(0.3)` border, depth shadow `black.opacity(0.1)` r:6 y:3
- **Focused:** 3pt `mabelTeal` border, teal glow shadow `mabelTeal.opacity(0.3)` r:10, depth shadow `black.opacity(0.1)` r:6 y:3
- Focus transition: `.easeInOut(duration: 0.2)`

### Free-Text Editor (for Add Character / Add Details)
- Large multi-line text area
- Min height: 200pt
- Corner radius: 16pt
- Background: white
- Text: Comfortaa Regular, 16pt, `mabelText`
- Placeholder text: Comfortaa Regular, 16pt, `mabelSubtle`
- Generous padding: 16pt inside

### Content Card (General)
- Background: white (`mabelSurface` #FFFFFF)
- Corner radius: **20pt**
- Padding: 20pt all sides
- Shadow: soft warm shadow — `black.opacity(0.06)`, radius 12, y: 4
- Cards should feel bright and clean against the warm peach background

### Prompt Card
- Extends Content Card styling
- **Label:** "Today's Prompt:" — Comfortaa Bold, 16pt, `mabelTeal`
- **Title:** Comfortaa Bold, 22pt, `mabelText` (e.g., "A comforting childhood taste")
- **Description:** Comfortaa Regular, 16pt, `mabelSubtle` (e.g., "What food brings back warm feelings for you?")
- **Decorative emoji:** Top-right corner, relevant to the prompt topic
- **CTA:** Full-width "Start Recording" button inside the card (standard CTA style)

### Progress Card
- Extends Content Card styling
- **Section header:** "YOUR STORY" — Comfortaa Bold, 14pt, `mabelText`, **all-caps**, letter-spacing 1pt
- **Subtitle:** Comfortaa Regular, 14pt, `mabelSubtle` (e.g., "Your unique life journey")
- **Progress text:** "Chapters Complete: 3 of 10" — Comfortaa SemiBold, 16pt, `mabelText`
- **Percentage badge:** Pill shape, `mabelTeal` text on `mabelMintBadge` background, Comfortaa SemiBold, 14pt, horizontal padding 12pt, vertical 4pt, corner radius 12pt
- **Chapter circles:** See Chapter Circle Indicator component below

### Chapter Circle Indicator
- Size: 36pt diameter
- Font: Comfortaa Bold, 14pt
- Horizontal spacing: 8pt between circles
- **Completed:** `mabelCopper` (#B07850) fill, white number text
- **Active/current:** `mabelTeal` (#1F7A6F) fill, white number text, slightly larger (40pt) or with subtle ring
- **Incomplete:** `mabelChapterGray` (#D4D0CC) fill, `mabelSubtle` number text

### Story Card
- Extends Content Card styling
- Title: Comfortaa Bold, 20pt (AI-generated creative title, e.g., "Mom's Kitchen")
- Date: Comfortaa Light, 12pt, `mabelSubtle` (e.g., "16 February 2026")
- Preview text: Comfortaa Regular, 14pt, max 3 lines, truncated
- "Read More" link: Comfortaa Medium, 14pt, `mabelTeal`
- "Add Details" button: Comfortaa Medium, 14pt, `mabelTeal`
- Helper text above Add Details: "Add characters, locations, and more details to help us draft a better story." — Comfortaa Regular, 12pt, `mabelSubtle`

### Suggestion Card
- Background: white
- Corner radius: 16pt
- Padding: 16pt
- Text: Comfortaa Regular, 15pt, `mabelText`
- Chevron icon on the right: `mabelSubtle`
- Tap state: slight scale (0.98) + background darkens slightly
- Suggestions are generated based on topics selected in the Setup screen

### MabelWordmark
- Uses Image("MabelWordmark") — the mabel_type.png asset
- Height: 24pt
- Rendering mode: .original (preserve colors)
- Centered horizontally
- Top of every screen, below safe area + topSafe padding

---

## Mascot Usage

### Welcome Screen (Hero)
- Image("MabelMascot") — use the full mascot PNG, NOT the app icon version (no rounded square frame)
- Size: 220pt minimum
- Centered horizontally and vertically (in upper portion of screen)
- Soft radial gradient glow behind her: `mabelGold` at 15% opacity, radius 1.5x mascot size, fading to transparent
- The mascot is the HERO of this screen — she should feel large and prominent

### Library/Home Screen (Greeting Header)
- Mascot at ~140pt, positioned **left-aligned**
- Greeting text to the right of the mascot:
  - **"Good morning, [Name]!"** — Comfortaa Bold, 28pt, `mabelGreeting` (#9E8578)
  - **"Let's capture a memory"** — Comfortaa Regular, 18pt, `mabelGreeting`
- Above greeting: "Mabel" label with grandmother emoji in a light gold circle badge
- This creates a warm, personalized entry point to the app

### In-App (Smaller contexts)
- 80pt for empty states
- 60pt for inline references
- 40pt for small decorative uses
- Always maintain aspect ratio with `.scaledToFit()`

---

## Animations

- CTA button press: `scaleEffect(0.98)` with `.spring(response: 0.3)`
- Pill button select: `scaleEffect` bounce with `.spring(response: 0.3, dampingFraction: 0.6)`
- Mic button pulse: repeating `scaleEffect(1.0 → 1.08)` + `opacity(1.0 → 0.7)` with `easeInOut(duration: 1.5)`
- Recording waveform: animated bar heights with random values, updating every 0.1s
- Screen transitions: default NavigationStack transitions (don't override)
- Boilerplate text animation (recording screen): typewriter effect, Comfortaa Regular, 14pt, `mabelSubtle`

---

## Screen-by-Screen Specification

### Screen 1 — Welcome (Onboarding #1)
- **Background:** Brand gradient (full screen)
- **Top:** MabelWordmark IMAGE (24pt height, centered)
- **Hero:** Mabel mascot PNG (full character, no rounded frame), 220pt, centered, with warm radial glow behind
- **Headline:** "Tell your story" — Comfortaa Bold, 32pt, `mabelText`, centered
- **Subtext:** "Record your memories. Mabel will turn them into something beautiful." — Comfortaa Regular, 16pt, `mabelSubtle`, centered, max 2 lines
- **CTA:** "Get Started" — full-width teal pill button, pinned toward bottom
- **Below CTA:** "Already have an account? Sign in" — Comfortaa Regular, 14pt, `mabelSubtle`, tappable
- **Bottom padding:** 40pt minimum from safe area

### Screen 2 — Setup (Onboarding #2)
- **Background:** Brand gradient (full screen)
- **Top:** MabelWordmark IMAGE
- **Heading:** "Whose Story Are We Telling?" — Comfortaa Bold, 28pt
- **Name:** Single text input field (required). Placeholder: "Enter their name"
- **Relationship:** Label "Relationship" + single-select pill buttons in FlowLayout:
  - "Myself" | "A Parent" | "A Grandparent" | "A Friend" | "Other"
  - "Myself" should be first and most prominent (this is the primary use case)
- **Topics:** Label "Topics"
  - Above pills: "I'll figure it out as I go" — styled as subtle tappable text link (NOT a pill), `mabelSubtle`, underlined
  - Multi-select pill buttons (pick up to 3) in FlowLayout:
    - "Childhood" | "Immigration" | "Career" | "Family" | "War / Service" | "Education" | "Faith" | "Love / Relationships" | "Health / Overcoming Adversity"
  - These topics drive the AI's first guided prompt on the Recording screen
- **CTA:** "Let's Start" — disabled until: name is filled AND (at least 1 topic selected OR "figure it out" tapped)
- **Layout:** ScrollView for all content — this screen has a lot of content

### Screen 3 — Record Prompt (Pre-Recording)
- **Background:** Brand gradient (full screen)
- **Top:** MabelWordmark IMAGE
- **Heading:** "What story would you like to tell?" — Comfortaa Bold, 28pt
- **Subtext:** "Tap the button and start speaking." — Comfortaa Regular, 16pt, `mabelSubtle`
- **Mic button:** 80pt circle, `mabelTeal` fill, white mic icon, centered, with pulse animation
- **Below mic:** "or write here" — tappable text, Comfortaa Regular, 14pt, `mabelSubtle`. When tapped, expands to a TextEditor with cancel/save options
- **Suggestions section:** Label "Suggestions" + 3 SuggestionCard components
  - Content is generated based on topics selected in Screen 2
  - Example prompts: "Describe your childhood home." / "What are your favorite family traditions?" / "Tell me about when you first met Grandma."
  - Tapping a suggestion navigates to the Recording screen with that prompt pre-loaded

### Screen 4 — Recording (Active)
- **Background:** Brand gradient (full screen)
- **Top:** The selected prompt/suggestion displayed as header text
- **Mic circle:** Large centered circle that changes color — `mabelTeal` (idle) → `mabelBurgundy` (recording)
- **Waveform:** WaveformView below mic — animated vertical bars simulating audio levels
- **Timer:** "00:00" format, Comfortaa Medium, 24pt, counting up
- **Status:** "Recording" / "Paused" label
- **Bottom controls:** Three buttons in a horizontal row:
  - **Clear** (destructive style — text only, `mabelBurgundy`)
  - **Pause / Resume** (secondary style)
  - **"Save Memory"** (teal CTA style)
- **Save Memory** → navigates to Saved Stories screen
- **While recording:** Boilerplate text animation appears as visual feedback — this is cosmetic "Mabel is writing..." typewriter effect, NOT real transcription

### Screen 5 — Saved Stories
- **Background:** Brand gradient (full screen)
- **Top:** MabelWordmark IMAGE
- **Content:** Vertical ScrollView of StoryCard components
- **Each StoryCard shows:**
  - AI-generated creative title (e.g., "Mom's Kitchen", "The Taste of Home")
  - Date: "16 February 2026"
  - Story preview text: 3-4 lines, truncated
  - "Read More" link (opens full story view — can be a sheet or full screen)
  - Divider
  - Helper text: "Add characters, locations, and more details to help us draft a better story."
  - "Add Details" button → opens Add Details sheet
- **Floating action button:** Bottom-right, 56pt circle, `mabelTeal`, "+" icon, with shadow. Navigates back to Record Prompt screen.
- **Empty state:** When no stories exist yet — Mabel mascot at 80pt, centered, with text: "No stories yet. Tap + to start recording."
- **Note:** Stories display as one continuous scrollable list. No chapters, no modules, no dividers between stories. The AI-generated titles serve as natural section markers.

### Screen 6 — Add Details (Sheet Modal)
- **Presented as:** `.sheet` from Saved Stories when "Add Details" is tapped on a StoryCard
- **Background:** Brand gradient
- **Header:** "Add Details"
- **Subtext:** "Help us craft a better story by describing at least one of the following:"
- **Two large tappable option cards:**
  - **"+ Add Character"** → navigates to Add Character sub-view
  - **"+ Add Details"** → navigates to Add Details sub-view
- **Navigation:** Uses NavigationStack within the sheet for sub-views

#### Add Character Sub-View
- **Header:** "Who's in this story?"
- **Content:** Large free-text TextEditor
- **Placeholder:** "Describe them — name, how you know them, what they looked like, anything you remember..."
- **Save button** at bottom (teal CTA style)
- **Future enhancement (post-MVP):** Structured fields for name, age, ethnicity, physical description, clothing

#### Add Details Sub-View
- **Header:** "Set the scene"
- **Content:** Large free-text TextEditor
- **Placeholder:** "Where were you? What did it feel like? Describe the place, the weather, the mood — anything that brings this memory to life..."
- **Save button** at bottom (teal CTA style)
- **Future enhancement (post-MVP):** Structured fields for date, location (country/city), weather, time of day, mood/emotion

#### Photos Section (Post-MVP)
- Grid of photo slots with "+" buttons for uploading
- Users can attach photos to any memory
- Not included in current MVP — note this for future reference

---

## Navigation Flow

```
Welcome → Setup → RecordPrompt → Recording → SavedStories
                                                    │
                                                    ├── AddDetails (sheet)
                                                    │   ├── Add Character
                                                    │   └── Add Details (scene)
                                                    │
                                                    └── "+" FAB → RecordPrompt (new recording)
```

---

## Common Mistakes — DO NOT MAKE THESE

| Mistake | Correct |
|------------|-----------|
| Teal gradient or any non-warm background | `mabelWarmBg` (#F3E0D2) on ALL screens |
| Black areas visible at top/bottom of screen | Background with `.ignoresSafeArea()` |
| Using Text("Mabel") for the wordmark | Using Image("MabelWordmark") |
| System font appearing anywhere | Comfortaa on ALL text |
| Pure black text (#000000) | Use `mabelText` (#2D2019) |
| Mascot too small on welcome screen | Minimum 220pt, no rounded frame |
| CTA button not full width | Full width minus 24pt horizontal padding |
| Content cut off on smaller screens | Wrap in ScrollView |
| Pills overflowing off screen | Use FlowLayout with wrapping |
| Inconsistent spacing between screens | Follow spacing tokens exactly |
| Placeholder text hard to read | Use `mabelSubtle` (#7A7168) |
| Cream/beige card backgrounds | Cards use **white** (#FFFFFF) for contrast against warm background |
| Card corner radius of 16pt | Cards now use **20pt** corner radius |
| Suggestions not matching user's selected topics | Generate from Screen 2 topic selections |
| Using mascot app icon instead of full character | Welcome screen uses full mascot PNG |
| Using `mabelText` for greeting headlines | Use `mabelGreeting` (#9E8578) for warm hero text |

---

## Pre-Submission Checklist

Before marking ANY screen as done, verify ALL of the following:

- [ ] Background is `mabelWarmBg` (#F3E0D2) filling entire screen — no black areas
- [ ] MabelWordmark IMAGE is used at top (not text)
- [ ] All text uses Comfortaa font (no system font fallback visible)
- [ ] Horizontal padding is 24pt on both sides
- [ ] Content scrolls if it exceeds screen height
- [ ] CTA button is full-width, 56pt height, capsule shape
- [ ] Colors match the palette exactly (check hex values)
- [ ] Card backgrounds are **white** with 20pt corner radius
- [ ] Greeting text uses `mabelGreeting`, not `mabelText`
- [ ] Animations are smooth and use spring curves
- [ ] Tested on iPhone 15 Pro AND iPhone SE simulators
- [ ] No layout warnings in Xcode console
