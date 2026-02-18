# Mabel — iOS UI Style Guide

> This file is the single source of truth for all UI decisions in the Mabel app.
> Claude Code and all contributors MUST follow these rules when building or editing any SwiftUI view.
> When in doubt, refer back to this document. When in conflict with any other file, THIS document wins.

---

## Brand Identity

- **App Name:** Mabel
- **Tagline:** Your Stories, Written with Care
- **Feel:** Warm, cozy, nostalgic, inviting. Like opening a treasured keepsake box. NOT techy, NOT corporate, NOT clinical.
- **Mascot:** Pixel-art grandmother named Mabel — sitting in a cozy armchair, writing with a quill pen in a teal-trimmed journal. She is warm, wise, and smiling. She represents the user's inner storyteller.
- **Marketing angle:** "Give your family the gift of their own story." Users may buy this for parents or grandparents as a gift.

---

## Background — CRITICAL

**Every screen uses the brand gradient background, NOT a solid color.**

The gradient image is stored at: `wireframes/brand-assets/gradient-app-background.png`
It must also be added to the Xcode Asset Catalog as `GradientBackground`.

### Gradient Specification
- **Direction:** Top to bottom (vertical linear gradient)
- **Top color:** Soft teal `#AEF0EC`
- **Middle color:** Light mint `#D9F4EF` (at ~50%)
- **Bottom color:** Warm cream `#FDF7E9`

### Implementation Options (pick one):

**Option A — Image-based (recommended for exact match):**
```swift
ZStack {
    Image("GradientBackground")
        .resizable()
        .scaledToFill()
        .ignoresSafeArea(.all, edges: .all)
    
    // Content goes here
}
```

**Option B — Code-based (lighter weight):**
```swift
ZStack {
    LinearGradient(
        colors: [
            Color(hex: "#AEF0EC"),
            Color(hex: "#D9F4EF"),
            Color(hex: "#EBF5EA"),
            Color(hex: "#FDF7E9")
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    .ignoresSafeArea(.all, edges: .all)
    
    // Content goes here
}
```

### Background Rules
- The gradient MUST fill the ENTIRE screen, including behind the status bar and home indicator.
- There must NEVER be black areas visible at the top or bottom of any screen.
- Content sits ON TOP of the gradient and respects safe areas.
- Cards and inputs use `mabelSurface` (#F5EDE3) with slight transparency to let the gradient subtly show through.
- The gradient replaces the old solid `mabelBackground` (#FFF8F0) everywhere. The `mabelBackground` color token is now ONLY used for fallback/loading states.

---

## Color Palette

| Token               | Hex       | Usage                                          |
|----------------------|-----------|-------------------------------------------------|
| `mabelGradientTop`  | `#AEF0EC` | Gradient top (soft teal)                        |
| `mabelGradientMid`  | `#D9F4EF` | Gradient midpoint (light mint)                  |
| `mabelGradientBot`  | `#FDF7E9` | Gradient bottom (warm cream)                    |
| `mabelBackground`   | `#FFF8F0` | Fallback/loading only — screens use gradient    |
| `mabelText`          | `#2D2019` | Primary text, headings                          |
| `mabelTeal`          | `#1F7A6F` | CTA buttons, primary accent, active states      |
| `mabelBurgundy`      | `#A3243B` | Secondary accent, recording active state        |
| `mabelGold`          | `#E9C46A` | Warm highlights, mascot glow, decorative        |
| `mabelSurface`       | `#F5EDE3` | Cards, input fields, elevated surfaces          |
| `mabelSubtle`        | `#7A7168` | Helper text, placeholders, secondary labels     |

### Color Rules
- Background is ALWAYS the gradient on EVERY screen
- NEVER use pure black (#000000) or pure white (#FFFFFF) anywhere
- Text is ALWAYS `mabelText` (#2D2019), never black
- Subtle/secondary text uses `mabelSubtle` (#7A7168)
- Card and input backgrounds use `mabelSurface` (#F5EDE3) — consider 90-95% opacity so gradient peeks through

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
    Image("GradientBackground")
        .resizable()
        .scaledToFill()
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
- Corner radius: 28pt (fully rounded pill)
- Background: `mabelTeal`
- Text: Comfortaa Bold, 18pt, cream `#FFF8F0`
- Disabled state: 40% opacity
- Press state: slight scale down (0.97) + darker teal

### Pill Button (Selectable)
- Height: 44pt
- Horizontal padding: 20pt
- Corner radius: 22pt (fully rounded)
- Unselected: `mabelSurface` background, `mabelText` text, 1pt `mabelSubtle` border at 30% opacity
- Selected: `mabelTeal` background, white text, no border
- Font: Comfortaa Regular, 15pt

### Text Input
- Height: 48pt
- Corner radius: 12pt
- Background: `mabelSurface` (at 90% opacity to let gradient show through)
- Text: Comfortaa Regular, 16pt, `mabelText`
- Placeholder: Comfortaa Regular, 16pt, `mabelSubtle`
- No visible border in default state
- Focus state: 2pt `mabelTeal` border

### Free-Text Editor (for Add Character / Add Details)
- Large multi-line text area
- Min height: 200pt
- Corner radius: 16pt
- Background: `mabelSurface` at 90% opacity
- Text: Comfortaa Regular, 16pt, `mabelText`
- Placeholder text: Comfortaa Regular, 16pt, `mabelSubtle`
- Generous padding: 16pt inside

### Story Card
- Background: `mabelSurface` at 95% opacity
- Corner radius: 16pt
- Padding: 16pt all sides
- Title: Comfortaa Bold, 20pt (AI-generated creative title, e.g., "Mom's Kitchen")
- Date: Comfortaa Light, 12pt, `mabelSubtle` (e.g., "16 February 2026")
- Preview text: Comfortaa Regular, 14pt, max 3 lines, truncated
- "Read More" link: Comfortaa Medium, 14pt, `mabelTeal`
- "Add Details" button: Comfortaa Medium, 14pt, `mabelTeal`
- Helper text above Add Details: "Add characters, locations, and more details to help us draft a better story." — Comfortaa Regular, 12pt, `mabelSubtle`
- Shadow: 0pt x 2pt blur 8pt, black at 5% opacity

### Suggestion Card
- Background: `mabelSurface`
- Corner radius: 12pt
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

### In-App (Smaller contexts)
- 80pt for empty states
- 60pt for inline references
- 40pt for small decorative uses
- Always maintain aspect ratio with `.scaledToFit()`

---

## Animations

- CTA button press: `scaleEffect(0.97)` with `.spring(response: 0.3)`
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

| ❌ Mistake | ✅ Correct |
|------------|-----------|
| Solid color background on any screen | Brand gradient background on ALL screens |
| Black areas visible at top/bottom of screen | Gradient with `.ignoresSafeArea()` |
| Using Text("Mabel") for the wordmark | Using Image("MabelWordmark") |
| System font appearing anywhere | Comfortaa on ALL text |
| Pure black or pure white used | Use mabelText and mabelBackground |
| Mascot too small on welcome screen | Minimum 220pt, no rounded frame |
| CTA button not full width | Full width minus 24pt horizontal padding |
| Content cut off on smaller screens | Wrap in ScrollView |
| Pills overflowing off screen | Use FlowLayout with wrapping |
| Inconsistent spacing between screens | Follow spacing tokens exactly |
| Placeholder text hard to read | Use mabelSubtle (#7A7168) |
| Opaque cards hiding gradient entirely | Use 90-95% opacity on mabelSurface |
| Suggestions not matching user's selected topics | Generate from Screen 2 topic selections |
| Using mascot app icon instead of full character | Welcome screen uses full mascot PNG |

---

## Pre-Submission Checklist

Before marking ANY screen as done, verify ALL of the following:

- [ ] Background is the brand gradient filling entire screen — no black areas, no solid colors
- [ ] MabelWordmark IMAGE is used at top (not text)
- [ ] All text uses Comfortaa font (no system font fallback visible)
- [ ] Horizontal padding is 24pt on both sides
- [ ] Content scrolls if it exceeds screen height
- [ ] CTA button is full-width, 56pt height, 28pt corner radius
- [ ] Colors match the palette exactly (check hex values)
- [ ] Card/input backgrounds are `mabelSurface` with 90-95% opacity
- [ ] Animations are smooth and use spring curves
- [ ] Tested on iPhone 15 Pro AND iPhone SE simulators
- [ ] No layout warnings in Xcode console
- [ ] Screen matches the corresponding wireframe in wireframes/app-mocks/
