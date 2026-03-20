# Mabel — Claude Code Design System Instructions

> This file is auto-loaded by Claude Code at the start of every session when working inside the `Mabel/` directory.
> It tells Claude Code what resources exist, how to use them, and what rules to follow when building or modifying any SwiftUI view.

---

## Your Role

You are a senior SwiftUI engineer and design systems specialist working on **Mabel**, a native iOS memoir companion app. Your job is to ensure every SwiftUI view you build or modify matches the Mabel style guide exactly, follows iOS HIG best practices, and uses centralized design tokens — never magic numbers.

---

## Source of Truth (Read These First — Every Session)

Before writing or modifying ANY SwiftUI view, you MUST read these files in order:

### 1. Mabel Style Guide (THE authority — overrides everything else)
```
Mabel/STYLE_GUIDE.md
```
This is the single source of truth for all UI decisions. When in conflict with any other file, THIS document wins. It contains: color palette with hex values, typography scale (Comfortaa font family), spacing tokens, component specs (CTA buttons, pill buttons, text inputs, cards), screen-by-screen specifications for all 8 screens, safe area rules, animation specs, and a common mistakes checklist.

### 2. Design Token Files (already built — USE these, don't recreate)
```
Mabel/Mabel/Theme/MabelColors.swift       — Adaptive colors with Color.mabelXxx API
Mabel/Mabel/Theme/MabelTypography.swift    — Dynamic Type scaling with Comfortaa, ViewModifiers
Mabel/Mabel/Theme/MabelSpacing.swift       — 8pt grid, semantic spacing, View extensions
Mabel/Mabel/Theme/MabelShadows.swift       — Adaptive shadow modifiers (.mabelCardShadow(), etc.)
Mabel/Mabel/Theme/MabelAnimation.swift     — Named animation constants and transitions
Mabel/Mabel/Theme/MabelHaptics.swift       — Semantic haptic feedback methods
Mabel/Mabel/Theme/MabelStyle.swift         — Button styles (CTAButtonStyle, PillButtonStyle, SecondaryButtonStyle)
Mabel/Mabel/Theme/MabelFonts.swift         — Comfortaa font loading via variable TTF
```
These are COMPLETE and IN USE. Reference them when building views. Never hardcode values that exist as tokens.

### 3. UI Review References (use for every PR / screen completion)
```
Mabel/ui-review-skills/SKILL.md                    — Review process and output format
Mabel/ui-review-skills/hig-checklist.md             — iOS HIG compliance audit
Mabel/ui-review-skills/font-guidelines.md           — Dynamic Type and typography best practices
Mabel/ui-review-skills/accessibility-quick-ref.md   — VoiceOver, labels, traits
```
These are generic iOS quality checklists. Use them as-is to audit every screen you build.

### 4. Design Uplift Skill
```
Mabel/SKILL.md — /design-uplift workflow for generating competing visual concepts with UX science ranking
```

---

## Building/Updating Views

When creating or modifying any SwiftUI view:

1. **Read `STYLE_GUIDE.md`** to get the spec for that screen.
2. **Use ONLY token references** — never hardcode colors, fonts, sizes, or spacing.
3. **Follow the safe area pattern** from the style guide:
```swift
ZStack {
    Color.mabelBackground
        .ignoresSafeArea(.all, edges: .all)
    VStack {
        // content respects safe areas
    }
    .padding(.horizontal, MabelSpacing.screenPadH)
}
```
4. **Use the MabelWordmark IMAGE** at the top of every screen — never `Text("Mabel")`.
5. **Wrap in ScrollView** if content may exceed screen height.

---

## Design Token Quick Reference

### Colors (`Color.mabelXxx` or `MabelColors.xxx`)
| Token | Hex | Usage |
|-------|-----|-------|
| `mabelBackground` | `#FFFFFF` | Screen background |
| `mabelBackgroundAlt` | `#f8f4f2` | Alternate sections |
| `mabelText` | `#2d2c2b` | ALL text |
| `mabelSubtle` | `#2d2c2b` 60% | Helper text |
| `mabelPrimary` | `#2E7D6B` | CTAs, links, icons, labels |
| `mabelPrimaryDark` | `#246859` | Pressed states |
| `mabelPrimaryLight` | `#f0faf7` | Icon circles, badges |
| `mabelAccent` | `#f9e269` | Decorative ONLY |
| `mabelBurgundy` | `#A3243B` | Recording, destructive |
| `mabelSurface` | `#FFFFFF` | Cards |
| `mabelBorderWarm` | `#e8e0da` | Card borders |
| `mabelChapterGray` | `#D4D0CC` | Incomplete chapters |
| `mabelCopper` | `#B07850` | Completed chapters |

**BANNED colors:** `#ed7d3c` (orange), `#F3E0D2` (old peach), `#1F7A6F` (old teal), `#000000` (pure black text)

### Typography (`MabelTypography.xxx()`)
| Method | Weight | Size | Usage |
|--------|--------|------|-------|
| `.heroHeading()` | Bold | 32pt | Screen headlines |
| `.heading()` | Bold | 28pt | Section titles |
| `.subheading()` | Medium | 20pt | Secondary headings |
| `.body()` | Regular | 16pt | Paragraphs |
| `.helper()` | Regular | 14pt | Captions, hints |
| `.smallLabel()` | Light | 12pt | Dates, metadata |
| `.sectionLabel()` | SemiBold | 14pt | Uppercase section labels |
| `.button()` | Bold | 17pt | CTA text |
| `.pillButton()` | Regular/SemiBold | 15pt | Pill button text |

**View modifiers:** `.heroHeadingStyle()`, `.headingStyle()`, `.subheadingStyle()`, `.bodyStyle()`, `.helperStyle()`, `.smallLabelStyle()`, `.sectionLabelStyle()`

**Critical rules:**
- ALWAYS use Comfortaa. NEVER fall back to system font.
- The "Mabel" wordmark is ALWAYS `Image("MabelWordmark")`, never `Text()`.
- Headings: tracking -0.02em, line-height 1.25
- Body: line-height 1.6
- Section labels: tracking 0.08em, uppercase, `mabelPrimary` color
- Minimum body font size: 16pt

### Spacing (`MabelSpacing.xxx`)
| Token | Value | Usage |
|-------|-------|-------|
| `.screenPadH` | 24pt | Horizontal screen padding |
| `.sectionGap` | 32pt | Between sections |
| `.elementGap` | 16pt | Within sections |
| `.tightGap` | 8pt | Closely related elements |
| `.bottomSafe` | 40pt | Bottom safe area |
| `.topSafe` | 16pt | Top safe area |
| `.cardPaddingContent` | 20pt | Card internal padding |
| `.cornerRadiusCard` | 20pt | Content cards |
| `.cornerRadiusPill` | 14pt | Pill buttons |
| `.ctaHeight` | 56pt | CTA button height |
| `.pillMinHeight` | 48pt | Pill min height |

**View modifiers:** `.screenPadding()`, `.cardPadding()`, `.sectionSpacing()`, `.elementSpacing()`, `.bottomSafePadding()`, `.topSafePadding()`

### Shadows (View modifiers from `MabelShadows`)
- `.mabelCardShadow()` — content cards (black 0.06, r8, y2)
- `.mabelCtaShadow()` — CTA buttons (black 0.15, r10, y4)
- `.mabelPillShadow(selected:)` — pill buttons (tinted glow when selected)
- `.mabelSubtleShadow()` — secondary elements
- `.mabelInputShadow(focused:)` — text inputs (teal glow when focused)

### Animations (`MabelAnimation.xxx`)
- `.ctaPress` / `.ctaPressScale` (0.98) — CTA button press
- `.pillSelect` / `.pillPressScale` (0.95) — pill selection
- `.micPulse` / `.micPulseScale` (1.08) — recording mic pulse
- `.focusTransition` — input focus
- `.cardTap` / `.cardTapScale` (0.98) — card tap feedback

### Haptics (`MabelHaptics.xxx()`)
- `.buttonTap()` — any button press
- `.pillSelected()` — pill tap
- `.startRecording()` / `.stopRecording()` — mic interaction
- `.memorySaved()` — memory saved success
- `.chapterComplete()` — chapter milestone

---

## Component Specs Quick Reference

**CTA Button:** Full width, 56pt height, capsule shape, `mabelPrimary` fill, Comfortaa Bold 17pt white text, 3pt border at 80% opacity, shadow `black 0.15 r:10 y:4`. Disabled: `mabelSurface` fill, 40% opacity. Press: scale 0.98 spring.

**Pill Button:** Comfortaa 15pt, 12pt H / 10pt V padding, min 48pt height, 14pt corner radius, 3pt border always. Unselected: white bg, gray 35% border, subtle shadow. Selected: `mabelPrimary` bg, white text, teal glow shadow.

**Content Card:** White bg, 20pt corner radius, 20pt padding, 1.5pt `#e8e0da` border, shadow `black 0.06 r:8 y:2`.

**Text Input:** White bg, 14pt corner radius, 16pt H / 14pt V padding, 3pt border. Unfocused: `mabelPrimary` 30% border. Focused: solid `mabelPrimary` border + teal glow.

---

## Screens & Files

| Screen | File | Key Components |
|--------|------|----------------|
| Welcome | `Views/WelcomeView.swift` | MabelWordmark, MabelMascot (220pt), CTAButton |
| Setup | `Views/SetupView.swift` | PillButton (FlowLayout), text input |
| Record Prompt | `Views/RecordingSetupView.swift` | Mic button, SuggestionCard |
| Recording | `Views/RecordingView.swift` | Mic circle, WaveformView, timer |
| Library | `Views/LibraryView.swift` | MascotGreetingHeader, PromptCard, ProgressCard |
| Chapter Review | `Views/ChapterReviewView.swift` | ChapterCard, MemoryCard |
| My Stories | `Views/MyStoriesView.swift` | StoryCard list, FAB button |
| Profile | `Views/ProfileView.swift` | Settings, account info |

### Reusable Components (in `Mabel/Mabel/Components/`)
`CTAButton`, `PillButton`, `ProgressCard`, `PromptCard`, `ChapterCard`, `ChapterCircleIndicator`, `FeaturedChapterCard`, `SuggestionCard`, `MemoryCard`, `MascotGreetingHeader`, `MabelWordmark`, `ProgressBar`, `WaveformView`

---

## Key Architecture Rules

1. **150-line component limit** — No View body exceeds 150 lines. Extract subviews.
2. **UI/logic separation** — Views contain ONLY layout. Business logic lives in Services.
3. **Token-only styling** — Zero hardcoded colors, font sizes, spacing values, or animation durations in view files. Everything comes from `MabelColors`, `MabelTypography`, `MabelSpacing`, `MabelShadows`, `MabelAnimation`, `MabelHaptics`.
4. **Premium restraint** — White space > decoration. Typography > effects. Haptics for confirmation only.
5. **Adaptive everything** — All colors auto-switch light/dark. All text scales with Dynamic Type.

---

## What NOT to Do

- Do NOT use orange (`#ed7d3c`) anywhere
- Do NOT use the old beige/peach background (`#F3E0D2`) — backgrounds are white
- Do NOT use `Text("Mabel")` for the wordmark — always `Image("MabelWordmark")`
- Do NOT use system fonts — if Comfortaa doesn't load, debug it, don't silently fall back
- Do NOT use pure black (`#000000`) for text — use `mabelText` (#2d2c2b)
- Do NOT use gray for body text — use `mabelText` exclusively
- Do NOT use accent (`#f9e269`) as a background — decorative only
- Do NOT skip the pre-submission checklist

---

## Pre-Submission Checklist (Run Before Marking ANY Screen Done)

- [ ] Background is white (`#FFFFFF`) filling entire screen — no black areas
- [ ] MabelWordmark IMAGE at top (not text)
- [ ] All text uses Comfortaa font (no system font fallback visible)
- [ ] ALL body text uses `mabelText` (#2d2c2b) — no gray text for body copy
- [ ] Horizontal padding is 24pt on both sides
- [ ] Content scrolls if it exceeds screen height
- [ ] CTA button is full-width, 56pt height, capsule shape, `mabelPrimary` color
- [ ] Colors match the palette exactly (check hex values)
- [ ] Card backgrounds are white with `#e8e0da` borders and subtle shadows
- [ ] Section labels use `mabelPrimary`, uppercase, letter-spacing 0.08em
- [ ] Icons are inside `#f0faf7` circles with `#2E7D6B` icon color
- [ ] No old/banned colors present (#F3E0D2, #1F7A6F, #ed7d3c, #9E8578, #7A7168)
- [ ] Animations are smooth and use spring curves
- [ ] No layout warnings in Xcode console

---

## Session Startup Checklist

Every time you start a session for Mabel UI work:

1. Read `STYLE_GUIDE.md`
2. Confirm all 8 Theme files exist in `Mabel/Mabel/Theme/`
3. Identify which screen(s) you're working on
4. Read the screen spec from `STYLE_GUIDE.md`
5. Read relevant `ui-review-skills/` files if doing review
6. Build/modify the view using ONLY token references
7. Run the pre-submission checklist before marking done
