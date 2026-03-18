# Mabel — iOS UI Style Guide

> This file is the single source of truth for all UI decisions in the Mabel app.
> Claude Code and all contributors MUST follow these rules when building or editing any SwiftUI view.
> When in doubt, refer back to this document. When in conflict with any other file, THIS document wins.

---

## Brand Identity

- **App Name:** Mabel
- **Tagline:** Speak Your Memoir Into Existence.
- **One-liner:** Your memoir companion. Just talk — Mabel writes.
- **Feel:** Warm, clean, modern, inviting. Like a beautifully designed journal — NOT techy, NOT corporate, NOT clinical.
- **Mascot:** Pixel-art grandmother named Mabel — sitting in a cozy armchair, writing with a quill pen. She is warm, wise, and smiling. She represents the user's inner storyteller and memoir companion.
- **Marketing angle:** "Think about your grandparents. The stories they carry that you've never heard. Mabel makes it almost effortless to capture them." Users may buy this for parents or grandparents as a gift. No writing required — talking is the UX.

---

## Background — CRITICAL

**Every screen uses a clean white background.**

### Background Specification
- **Primary Color:** White `#FFFFFF`
- **Alternate Color:** Warm cream `#f8f4f2` — use for alternating sections or card-heavy areas to create visual rhythm
- **Feel:** Clean, modern, warm — content and cards provide the warmth, not the background

### Implementation:
```swift
ZStack {
    Color.mabelBackground
        .ignoresSafeArea(.all, edges: .all)

    // Content goes here
}
```

### Background Rules
- The background MUST fill the ENTIRE screen, including behind the status bar and home indicator.
- There must NEVER be black areas visible at the top or bottom of any screen.
- Content sits ON TOP of the background and respects safe areas.
- Cards use **white** (`#FFFFFF`) backgrounds with warm borders (`#e8e0da`) on white screens, or white backgrounds on `#f8f4f2` alternate sections.
- Use `mabelBackgroundAlt` (`#f8f4f2`) for sections that need visual separation from the white background — e.g., alternate sections in scrollable lists.

---

## Color Palette

| Token               | Hex       | RGB (0-1)              | Usage                                          |
|----------------------|-----------|------------------------|-------------------------------------------------|
| `mabelBackground`    | `#FFFFFF` | 1.0, 1.0, 1.0         | Primary screen background (white)               |
| `mabelBackgroundAlt` | `#f8f4f2` | 0.973, 0.957, 0.949   | Alternate section backgrounds for visual rhythm  |
| `mabelText`          | `#2d2c2b` | 0.176, 0.173, 0.169   | ALL text — headings, body, labels. No exceptions |
| `mabelSubtle`        | `#2d2c2b` at 60% | —             | Helper text, placeholders, secondary labels      |
| `mabelPrimary`       | `#2E7D6B` | 0.180, 0.490, 0.420   | CTA buttons, links, icons, active states, labels |
| `mabelTeal`          | `#2E7D6B` | 0.180, 0.490, 0.420   | Alias for `mabelPrimary`                        |
| `mabelPrimaryDark`   | `#246859` | 0.141, 0.408, 0.349   | Pressed/hover state for primary buttons          |
| `mabelPrimaryLight`  | `#f0faf7` | 0.941, 0.980, 0.969   | Icon circle backgrounds, badge tints, pill fills |
| `mabelAccent`        | `#f9e269` | 0.976, 0.886, 0.412   | Decorative only — mascot glow, highlights. NEVER as full section backgrounds |
| `mabelGold`          | `#f9e269` | 0.976, 0.886, 0.412   | Alias for `mabelAccent`                         |
| `mabelBurgundy`      | `#A3243B` | 0.639, 0.141, 0.231   | Recording active state, destructive actions      |
| `mabelSurface`       | `#FFFFFF` | 1.0, 1.0, 1.0         | Cards, elevated surfaces                        |
| `mabelBorder`        | `rgba(0,0,0,0.08)` | —           | Default subtle borders                          |
| `mabelBorderWarm`    | `#e8e0da` | 0.910, 0.878, 0.855   | Warm card borders — use on feature/content cards |
| `mabelMintBadge`     | `#f0faf7` | 0.941, 0.980, 0.969   | Badge backgrounds (same as `mabelPrimaryLight`)  |
| `mabelChapterGray`   | `#D4D0CC` | 0.831, 0.816, 0.800   | Incomplete chapter circle backgrounds           |
| `mabelCopper`        | `#B07850` | 0.690, 0.471, 0.314   | Completed chapter indicators                    |

### Color Rules
- Background is ALWAYS white (`#FFFFFF`) on every screen
- ALL text uses `mabelText` (`#2d2c2b`) — NEVER lighter for body copy
- NEVER use pure black (`#000000`) for text
- NEVER use gray for body text — use `mabelText` exclusively
- Helper/placeholder text uses `mabelSubtle` (mabelText at 60% opacity)
- Section labels (e.g., "FOR STORYTELLERS") use `mabelPrimary` (`#2E7D6B`), uppercase, letter-spacing 0.08em
- Card backgrounds are white (`#FFFFFF`) with warm borders (`#e8e0da`)
- Interactive elements (text inputs, pill buttons) use white backgrounds
- Icon circles use `mabelPrimaryLight` (`#f0faf7`) as background with `mabelPrimary` icon color
- The accent color (`#f9e269`) is decorative ONLY — mascot glow, small highlights. NEVER as backgrounds.
- Orange (`#ed7d3c`) is NOT in the palette — do not use it anywhere in the app

### Cross-Platform Consistency
These tokens map directly to the landing page CSS variables:

| iOS Token          | CSS Variable              | Hex       |
|--------------------|---------------------------|-----------|
| `mabelBackground`  | `--color-mabel-bg`        | `#FFFFFF` |
| `mabelBackgroundAlt` | `--color-mabel-bg-alt`  | `#f8f4f2` |
| `mabelText`        | `--color-mabel-text`      | `#2d2c2b` |
| `mabelPrimary`     | `--color-mabel-primary`   | `#2E7D6B` |
| `mabelPrimaryDark` | `--color-mabel-primary-dark` | `#246859` |
| `mabelAccent`      | `--color-mabel-accent`    | `#f9e269` |
| `mabelSurface`     | `--color-mabel-surface`   | `#FFFFFF` |

---

## Typography

**Font Family:** Comfortaa (Google Font — imported as custom font via variable TTF in Xcode)

| Style          | Weight     | Size  | Color          | Usage                          |
|----------------|------------|-------|----------------|--------------------------------|
| Hero heading   | ExtraBold  | 32pt  | mabelText      | Main screen headlines           |
| Heading        | Bold       | 28pt  | mabelText      | Section titles                  |
| Subheading     | Medium     | 20pt  | mabelText      | Secondary headings              |
| Body           | Regular    | 16pt  | mabelText      | Paragraphs, descriptions        |
| Helper text    | Regular    | 14pt  | mabelSubtle    | Placeholders, captions, hints   |
| Small label    | Light      | 12pt  | mabelSubtle    | Dates, metadata, fine print     |
| Section label  | SemiBold   | 14pt  | mabelPrimary   | "FOR STORYTELLERS" — uppercase, letter-spacing 0.08em |
| Wordmark       | —          | —     | —              | ALWAYS use MabelWordmark image asset, NOT text. Height: 24pt |

### Typography Rules
- ALWAYS use Comfortaa font. NEVER fall back to system font.
- If Comfortaa doesn't load, debug it — don't silently use San Francisco.
- The "Mabel" wordmark at the top of screens must be the IMAGE asset (MabelWordmark / mabel_type.png), never a Text() view.
- Headings: letter-spacing -0.02em (tracking: -0.02em)
- Section labels: letter-spacing 0.08em, uppercase, `mabelPrimary` color
- Body text: line-height 1.6
- Headings: line-height 1.25
- Minimum body font size: 16pt

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
- Alternate between white and `mabelBackgroundAlt` sections for visual rhythm in scrollable content.

---

## Safe Areas — CRITICAL

This is the #1 source of visual bugs. Follow these rules exactly:

1. The background MUST extend to fill the ENTIRE screen, including behind the status bar and home indicator. Use `.ignoresSafeArea(.all, edges: .all)` on the background layer.
2. Content itself must RESPECT safe areas — use proper padding so text/buttons don't overlap the notch or home indicator.
3. There must NEVER be black areas visible at the top or bottom of any screen.
4. Test on iPhone 15 Pro and iPhone SE simulators to catch safe area issues.

### Pattern to follow:
```swift
ZStack {
    // BACKGROUND — fills entire screen
    Color.mabelBackground
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
- Background: `mabelPrimary` (`#2E7D6B`)
- Text: Comfortaa Bold, 17pt, white
- Border: 3pt `mabelPrimary.opacity(0.8)`
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
- **Selected:** `mabelPrimary` background, white text, `mabelPrimary` border, glow shadow `mabelPrimary.opacity(0.4)` r:12 y:4
- **Disabled:** `gray.opacity(0.15)` background, `mabelSubtle.opacity(0.5)` text, `gray.opacity(0.35)` border, 50% opacity
- **Pressed:** scale 0.95, spring animation (response: 0.3, dampingFraction: 0.6)

### Text Input
- Font: Comfortaa Regular, 17pt, `mabelText`
- Padding: horizontal 16pt, vertical 14pt
- Corner radius: 14pt
- Background: solid **white**
- Border: 3pt on all states
- **Unfocused:** 3pt `mabelPrimary.opacity(0.3)` border, depth shadow `black.opacity(0.1)` r:6 y:3
- **Focused:** 3pt `mabelPrimary` border, teal glow shadow `mabelPrimary.opacity(0.3)` r:10, depth shadow `black.opacity(0.1)` r:6 y:3
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
- Border: 1.5pt `mabelBorderWarm` (`#e8e0da`)
- Shadow: soft warm shadow — `black.opacity(0.06)`, radius 8, y: 2
- Cards should feel bright, clean, and slightly elevated

### Feature Card (For grids/lists)
- Extends Content Card styling
- Icon: inside a circle with `mabelPrimaryLight` (`#f0faf7`) background, `mabelPrimary` color, 26pt icon size
- Text: Comfortaa Medium (weight 500), 15pt, `mabelText`
- Layout: icon circle left-aligned, text to the right
- Border: 1.5pt `mabelBorderWarm` (`#e8e0da`)
- Shadow: `black.opacity(0.06)`, radius 8, y: 2

### Prompt Card
- Extends Content Card styling
- **Label:** "Today's Prompt:" — Comfortaa Bold, 16pt, `mabelPrimary`
- **Title:** Comfortaa Bold, 22pt, `mabelText` (e.g., "A comforting childhood taste")
- **Description:** Comfortaa Regular, 16pt, `mabelSubtle` (e.g., "What food brings back warm feelings for you?")
- **Decorative emoji:** Top-right corner, relevant to the prompt topic
- **CTA:** Full-width "Start Recording" button inside the card (standard CTA style)

### Progress Card
- Extends Content Card styling
- **Section header:** "YOUR STORY" — Comfortaa Bold, 14pt, `mabelPrimary`, **all-caps**, letter-spacing 0.08em
- **Subtitle:** Comfortaa Regular, 14pt, `mabelSubtle` (e.g., "Your unique life journey")
- **Progress text:** "Chapters Complete: 3 of 10" — Comfortaa SemiBold, 16pt, `mabelText`
- **Percentage badge:** Pill shape, `mabelPrimary` text on `mabelPrimaryLight` background, Comfortaa SemiBold, 14pt, horizontal padding 12pt, vertical 4pt, corner radius 12pt
- **Chapter circles:** See Chapter Circle Indicator component below

### Chapter Circle Indicator
- Size: 36pt diameter
- Font: Comfortaa Bold, 14pt
- Horizontal spacing: 8pt between circles
- **Completed:** `mabelCopper` (#B07850) fill, white number text
- **Active/current:** `mabelPrimary` (#2E7D6B) fill, white number text, slightly larger (40pt) or with subtle ring
- **Incomplete:** `mabelChapterGray` (#D4D0CC) fill, `mabelSubtle` number text

### Trust Indicator Pill (from landing page — apply to app where relevant)
- Background: `mabelPrimaryLight` (`#f0faf7`)
- Border: 1.5pt solid `mabelPrimary` (`#2E7D6B`)
- Icon: 16pt, `mabelPrimary` color
- Text: Comfortaa Medium, 14pt, `mabelText`
- Padding: 10pt vertical, 18pt horizontal
- Corner radius: capsule (fully rounded)

### Story Card
- Extends Content Card styling
- Title: Comfortaa Bold, 20pt (AI-generated creative title, e.g., "Mom's Kitchen")
- Date: Comfortaa Light, 12pt, `mabelSubtle` (e.g., "16 February 2026")
- Preview text: Comfortaa Regular, 14pt, max 3 lines, truncated
- "Read More" link: Comfortaa Medium, 14pt, `mabelPrimary`
- "Add Details" button: Comfortaa Medium, 14pt, `mabelPrimary`
- Helper text above Add Details: "Add characters, locations, and more details to help us draft a better story." — Comfortaa Regular, 12pt, `mabelSubtle`

### Suggestion Card
- Background: white
- Corner radius: 16pt
- Padding: 16pt
- Border: 1.5pt `mabelBorderWarm`
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
- Soft radial gradient glow behind her: subtle warm gray, barely visible, fading to transparent (NOT yellow/gold — keep it atmospheric)
- The mascot is the HERO of this screen — she should feel large and prominent

### Library/Home Screen (Greeting Header)
- Mascot at ~140pt, positioned **left-aligned**
- Greeting text to the right of the mascot:
  - **"Good morning, [Name]!"** — Comfortaa Bold, 28pt, `mabelText`
  - **"Let's capture a memory"** — Comfortaa Regular, 18pt, `mabelSubtle`
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

## Design Principles (from Landing Page)

These principles were validated during the landing page design and apply to the iOS app:

1. **White over beige** — Clean white backgrounds make content pop. The old warm peach (#F3E0D2) is retired.
2. **Visual rhythm** — Alternate between white and cream (#f8f4f2) sections in scrollable content.
3. **Bordered cards with warmth** — Use `1.5pt #e8e0da` borders and `0 2px 8px rgba(0,0,0,0.06)` shadows. Not flat, not heavy.
4. **Icon circles** — Icons inside `#f0faf7` circles with `#2E7D6B` color. Consistent, polished, branded.
5. **Green as the anchor** — `#2E7D6B` is the primary brand color. CTAs, links, icons, labels, active states.
6. **Typography weight matters** — Headings at 700-800 weight with -0.02em tracking. Section labels uppercase with 0.08em tracking in primary green.
7. **Trust through visual weight** — Important elements get green borders, matching padding, consistent styling.
8. **No orange** — `#ed7d3c` was removed from the palette. Do not use it anywhere.
9. **Accent is decorative only** — `#f9e269` for mascot glows and tiny highlights. Never as backgrounds.

---

## Screen-by-Screen Specification

### Screen 1 — Welcome (Onboarding #1)
- **Background:** White (full screen)
- **Top:** MabelWordmark IMAGE (24pt height, centered)
- **Hero:** Mabel mascot PNG (full character, no rounded frame), 220pt, centered, with subtle warm gray radial glow behind
- **Headline:** "Tell your story" — Comfortaa ExtraBold, 32pt, `mabelText`, centered
- **Subtext:** "Record your memories. Mabel will turn them into something beautiful." — Comfortaa Regular, 16pt, `mabelSubtle`, centered, max 2 lines
- **CTA:** "Get Started" — full-width primary pill button, pinned toward bottom
- **Below CTA:** "Already have an account? Sign in" — Comfortaa Regular, 14pt, `mabelSubtle`, tappable
- **Bottom padding:** 40pt minimum from safe area

### Screen 2 — Setup (Onboarding #2)
- **Background:** White (full screen)
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
- **Background:** White (full screen)
- **Top:** MabelWordmark IMAGE
- **Heading:** "What story would you like to tell?" — Comfortaa Bold, 28pt
- **Subtext:** "Tap the button and start speaking." — Comfortaa Regular, 16pt, `mabelSubtle`
- **Mic button:** 80pt circle, `mabelPrimary` fill, white mic icon, centered, with pulse animation
- **Below mic:** "or write here" — tappable text, Comfortaa Regular, 14pt, `mabelSubtle`. When tapped, expands to a TextEditor with cancel/save options
- **Suggestions section:** Label "Suggestions" + 3 SuggestionCard components
  - Content is generated based on topics selected in Screen 2
  - Tapping a suggestion navigates to the Recording screen with that prompt pre-loaded

### Screen 4 — Recording (Active)
- **Background:** White (full screen)
- **Top:** The selected prompt/suggestion displayed as header text
- **Mic circle:** Large centered circle that changes color — `mabelPrimary` (idle) → `mabelBurgundy` (recording)
- **Waveform:** WaveformView below mic — animated vertical bars simulating audio levels
- **Timer:** "00:00" format, Comfortaa Medium, 24pt, counting up
- **Status:** "Recording" / "Paused" label
- **Bottom controls:** Three buttons in a horizontal row:
  - **Clear** (destructive style — text only, `mabelBurgundy`)
  - **Pause / Resume** (secondary style)
  - **"Save Memory"** (primary CTA style)

### Screen 5 — Saved Stories
- **Background:** White (full screen)
- **Top:** MabelWordmark IMAGE
- **Content:** Vertical ScrollView of StoryCard components
- **Floating action button:** Bottom-right, 56pt circle, `mabelPrimary`, "+" icon, with shadow.
- **Empty state:** Mabel mascot at 80pt, centered, with text: "No stories yet. Tap + to start recording."

### Screen 6 — Add Details (Sheet Modal)
- **Presented as:** `.sheet` from Saved Stories
- **Background:** White
- **Header:** "Add Details"
- Two large tappable option cards: "+ Add Character" and "+ Add Details"

---

## Common Mistakes — DO NOT MAKE THESE

| Mistake | Correct |
|------------|-----------|
| Using old beige/peach (#F3E0D2) background | White `#FFFFFF` on ALL screens |
| Using old teal (#1F7A6F) | Use `mabelPrimary` (#2E7D6B) |
| Using orange (#ed7d3c) anywhere | Orange is NOT in the palette |
| Black areas visible at top/bottom of screen | Background with `.ignoresSafeArea()` |
| Using Text("Mabel") for the wordmark | Using Image("MabelWordmark") |
| System font appearing anywhere | Comfortaa on ALL text |
| Pure black text (#000000) | Use `mabelText` (#2d2c2b) |
| Gray body text | ALL body text uses `mabelText` (#2d2c2b) |
| Light/muted body text on white background | Use full `mabelText` — only helpers use `mabelSubtle` |
| Using accent (#f9e269) as a background | Accent is decorative ONLY — tiny highlights, mascot glow |
| Flat cards with no borders | Cards have 1.5pt `#e8e0da` borders and subtle shadows |
| Mascot too small on welcome screen | Minimum 220pt, no rounded frame |
| CTA button not full width | Full width minus 24pt horizontal padding |
| Content cut off on smaller screens | Wrap in ScrollView |
| Icons without background circles | Icons go in `#f0faf7` circles with `#2E7D6B` color |

---

## Pre-Submission Checklist

Before marking ANY screen as done, verify ALL of the following:

- [ ] Background is white (`#FFFFFF`) filling entire screen — no black areas
- [ ] MabelWordmark IMAGE is used at top (not text)
- [ ] All text uses Comfortaa font (no system font fallback visible)
- [ ] ALL body text uses `mabelText` (#2d2c2b) — no gray text for body copy
- [ ] Horizontal padding is 24pt on both sides
- [ ] Content scrolls if it exceeds screen height
- [ ] CTA button is full-width, 56pt height, capsule shape, `mabelPrimary` color
- [ ] Colors match the palette exactly (check hex values)
- [ ] Card backgrounds are white with `#e8e0da` borders and subtle shadows
- [ ] Section labels use `mabelPrimary`, uppercase, letter-spacing 0.08em
- [ ] Icons are inside `#f0faf7` circles with `#2E7D6B` icon color
- [ ] No old colors present (#F3E0D2, #1F7A6F, #ed7d3c, #2D2019, #9E8578, #7A7168)
- [ ] Animations are smooth and use spring curves
- [ ] Tested on iPhone 15 Pro AND iPhone SE simulators
- [ ] No layout warnings in Xcode console
