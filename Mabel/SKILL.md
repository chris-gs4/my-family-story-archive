---
name: design-uplift
description: Audit a Mabel view, generate 3 competing visual concepts with UX science ranking, render as snapshots, show in HTML comparison page, then implement the chosen concept
triggers:
  - /design-uplift
  - uplift this view
  - improve the design
  - make this look better
  - professionalize this
  - design upgrade
  - ux upgrade
---

# /design-uplift -- Competing Visual Concepts with Science Ranking

Generate 3 rendered design concepts for any Mabel view, rank them by UX science, show in a Chrome comparison page, then implement the winner.

## When to Use

Any time a UI view needs visual improvement -- new hierarchy, progress signals, status encoding, visual rhythm, or general "make it professional." Works on any SwiftUI view in the Mabel codebase.

## Usage

```
/design-uplift [view name or screenshot]
/design-uplift "Progress card"
/design-uplift  (with screenshot attached)
```

Can handle multiple views at once: `/design-uplift "ProgressCard + PromptCard + RecordingView"`

## Workflow

### Phase 1: Audit (Research Only -- No Code Yet)

For each target view:

1. **Read the current implementation** -- find the exact file in `Mabel/Mabel/Views/` or `Mabel/Mabel/Components/`, line range, all subcomponents
2. **Read the design system** -- `MabelColors.swift`, `MabelTypography.swift`, `MabelSpacing.swift`, `MabelShadows.swift`, `MabelAnimation.swift`, `MabelHaptics.swift` (all in `Mabel/Mabel/Theme/`)
3. **Read STYLE_GUIDE.md** -- `Mabel/STYLE_GUIDE.md` is the single source of truth for all UI decisions
4. **Inventory reusable components** -- `CTAButton`, `PillButton`, `ProgressCard`, `PromptCard`, `ChapterCircleIndicator`, `SuggestionCard`, `MascotGreetingHeader`, `MabelWordmark`, `WaveformView`, `.mabelCardShadow()`, `.mabelCtaShadow()`, etc.
5. **Identify gaps** -- What's flat? Missing hierarchy? No progress signal? No status encoding? No visual rhythm? Is the mascot underutilized? Does it feel warm enough for a memoir companion?

Use an `Explore` subagent for each view to parallelize audits.

### Phase 2: Build 3 Competing Concepts

For each target view, create 3 concept prototypes as **self-contained SwiftUI views**:

**Rules for concept views:**
- Each is a `struct` conforming to `View`
- Hardcoded mock data (no ViewModels, no services, no async)
- Use ONLY existing design tokens -- never invent new colors/fonts/spacing
- Use realistic memoir data (e.g., chapter titles like "Growing Up in Brooklyn", memory prompts, story excerpts)
- Name pattern: `{View}Concept{A|B|C}` (e.g., `ProgressCardConceptA`)
- Keep each under 100 lines

**Write to:** `Mabel/Mabel/Components/DesignConceptPrototypes.swift`

Each concept must be grounded in a specific UX principle:
- Gestalt principles (similarity, proximity, continuity, closure)
- Fitts's Law, Hick's Law, Miller's Law
- Nielsen's heuristics (visibility, feedback, consistency)
- Wickens' Multiple Resource Theory (encoding redundancy)
- Jakob's Law (familiarity from other apps)
- Cleveland & McGill perceptual accuracy hierarchy
- Pre-attentive processing (color, size, orientation, motion)

**Mabel-specific design considerations:**
- Target audience includes grandparents and older users -- prioritize readability, large tap targets, simple navigation
- The app should feel warm and encouraging, like a skilled biographer, not clinical or data-heavy
- The mascot (Mabel) should enhance the experience where appropriate
- Voice-first UX -- the recording flow should feel natural and low-friction
- Chapter progress should feel motivating without being gamified (no streaks, no points)
- Story cards should invite reading, not feel like a data table
- Reference premium indie apps: Day One, Bear, Craft for warm journal aesthetic

### Phase 3: Render Snapshots

**Create test file:** `Mabel/MabelTests/DesignConceptSnapshotTests.swift`

```swift
#if os(iOS)
import SwiftUI
import XCTest

@testable import Mabel

@MainActor
final class DesignConceptSnapshotTests: XCTestCase {
    func testProgressCardConceptA() {
        let view = ProgressCardConceptA()
            .frame(width: 380)
            .padding()
            .background(Color.mabelBackground)

        let hostingController = UIHostingController(rootView: view)
        hostingController.view.frame = UIScreen.main.bounds

        let renderer = UIGraphicsImageRenderer(bounds: hostingController.view.bounds)
        let image = renderer.image { _ in
            hostingController.view.drawHierarchy(in: hostingController.view.bounds, afterScreenUpdates: true)
        }

        let data = image.pngData()!
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("progress_card_concept_a.png")
        try! data.write(to: url)
        print("Snapshot saved to: \(url.path)")
    }
    // ... one test per concept
}
#endif
```

1. Verify compilation:
```bash
xcodebuild build -scheme Mabel -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

2. Run snapshot tests:
```bash
xcodebuild test -scheme Mabel -only-testing MabelTests/DesignConceptSnapshotTests -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

### Phase 4: HTML Comparison Page

Create `Mabel/screenshots/concepts/index.html` with:

- **Dark theme** background (#1a1a2e)
- **One section per view** with the view name as header
- **3-column grid** per section, one card per concept
- Each card contains:
  - Rendered screenshot (from snapshot test output)
  - Concept label (A/B/C) and name
  - 1-2 sentence description
  - **Science box**: UX principle name + evidence/citation
  - **Rank badge** (1/2/3, color-coded gold/silver/bronze)
  - **"RECOMMENDED" badge** on the top-ranked concept
- **Light/Dark toggle** button (top-right) that swaps `_light.png` / `_dark.png` suffixes
- Concepts ordered by scientific rank (best = left)

Open in Chrome:
```bash
open -a "Google Chrome" Mabel/screenshots/concepts/index.html
```

### Phase 5: User Picks

Wait for the user to pick one concept per view. Do NOT proceed without explicit approval.

### Phase 6: Implement

After user picks:

1. Enter plan mode with implementation plan (file, line range, changes, tokens to reuse)
2. Implement the chosen concepts into the actual production views
3. Verify compilation:
```bash
xcodebuild build -scheme Mabel -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```
4. Run the pre-submission checklist from `STYLE_GUIDE.md`:
   - [ ] Background is white (`#FFFFFF`) filling entire screen
   - [ ] MabelWordmark IMAGE at top (not text)
   - [ ] All text uses Comfortaa font
   - [ ] ALL body text uses `mabelText` (#2d2c2b)
   - [ ] 24pt horizontal padding
   - [ ] ScrollView if content exceeds screen
   - [ ] CTA is full-width, 56pt, capsule, `mabelPrimary`
   - [ ] Colors match hex values exactly
   - [ ] Cards have `#e8e0da` borders and subtle shadows
   - [ ] Section labels uppercase, `mabelPrimary`, 0.08em tracking
   - [ ] Icons inside `#f0faf7` circles
   - [ ] No old/banned colors (#F3E0D2, #1F7A6F, #ed7d3c, #9E8578, #7A7168)
5. Delete `DesignConceptPrototypes.swift` and `DesignConceptSnapshotTests.swift` (scaffolding, not production)

### Phase 7: Ship (if requested)

Commit, push, create PR if requested.

## Design Token Quick Reference

When building concepts, use ONLY these tokens. Never hardcode values.

**Colors** (from `MabelColors` / `Color.mabelXxx`):
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

**Typography** (from `MabelTypography`):
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

**View modifiers:** `.heroHeadingStyle()`, `.headingStyle()`, `.bodyStyle()`, `.helperStyle()`, `.sectionLabelStyle()`

**Spacing** (from `MabelSpacing`):
| Token | Value | Usage |
|-------|-------|-------|
| `.screenPadH` | 24pt | Horizontal screen padding |
| `.sectionGap` | 32pt | Between sections |
| `.elementGap` | 16pt | Within sections |
| `.tightGap` | 8pt | Closely related elements |
| `.cardPaddingContent` | 20pt | Card internal padding |
| `.cornerRadiusCard` | 20pt | Content cards |
| `.cornerRadiusPill` | 14pt | Pill buttons |
| `.ctaHeight` | 56pt | CTA button height |
| `.pillMinHeight` | 48pt | Pill button min height |

**View modifiers:** `.screenPadding()`, `.cardPadding()`, `.sectionSpacing()`, `.mabelCardShadow()`, `.mabelCtaShadow()`, `.mabelPillShadow(selected:)`

**Shadows** (from `MabelShadows` view modifiers):
- `.mabelCardShadow()` -- content cards
- `.mabelCtaShadow()` -- CTA buttons
- `.mabelPillShadow(selected:)` -- pill buttons
- `.mabelSubtleShadow()` -- secondary elements
- `.mabelInputShadow(focused:)` -- text inputs

**Animations** (from `MabelAnimation`):
- `.ctaPress` / `.ctaPressScale` -- CTA button press
- `.pillSelect` / `.pillPressScale` -- pill selection
- `.micPulse` / `.micPulseScale` -- recording mic pulse
- `.focusTransition` -- input focus
- `.cardTap` / `.cardTapScale` -- card tap feedback

**Haptics** (from `MabelHaptics`):
- `.buttonTap()` -- any button press
- `.pillSelected()` -- pill tap
- `.startRecording()` / `.stopRecording()` -- mic interaction
- `.memorySaved()` -- memory saved success
- `.chapterComplete()` -- chapter milestone

## Mabel Screens Reference

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

## Scientific Ranking Methodology

Every concept MUST be scored. This is not optional -- the ranking is the core value of the skill.

### Scoring Dimensions (rate each 1-5)

Each concept is rated on 6 dimensions. The final rank is the weighted total.

| Dimension | Weight | 1 (Poor) | 3 (Average) | 5 (Excellent) | Source |
|-----------|--------|----------|-------------|---------------|--------|
| **Encoding Redundancy** | 25% | Single channel (text only) | Two channels (color + text) | Three+ channels (color + shape + number + motion) | Wickens' Multiple Resource Theory (1984) |
| **Pre-attentive Processing** | 20% | Requires reading to understand state | Partial -- color hints at state | State understood at a glance before conscious reading | Treisman & Gelade (1980), Feature Integration Theory |
| **Information Density** | 15% | Shows 1 data point, wastes space | Shows key data, some dead space | Maximum useful info per pixel, no clutter | Tufte's data-ink ratio (1983) |
| **Familiarity** | 15% | Novel pattern, no mental model exists | Somewhat familiar from other contexts | Exact pattern from apps user already knows (Day One, Bear, Apple Journal, etc.) | Jakob's Law (Jakob Nielsen) |
| **Perceptual Accuracy** | 15% | Relies on color/density (lowest accuracy) | Uses length or angle | Uses position on common scale (highest accuracy) | Cleveland & McGill (1984), graphical perception hierarchy |
| **Implementation Efficiency** | 10% | Large effort, many new components | Moderate, reuses some tokens | Minimal code, reuses existing components | Minimal change principle |

### How to Apply

1. **Score each concept** on all 6 dimensions (1-5)
2. **Calculate weighted total** for each concept
3. **Rank** by total score (highest = #1)
4. **Document the scores** in the HTML comparison page

### Score Table Format (include in HTML page)

For each view section, include a score breakdown table below the concept cards:

| Dimension | Concept A | Concept B | Concept C |
|-----------|-----------|-----------|-----------|
| Encoding Redundancy (25%) | 3 | 2 | 5 |
| Pre-attentive (20%) | 4 | 3 | 4 |
| Info Density (15%) | 3 | 2 | 4 |
| Familiarity (15%) | 2 | 4 | 3 |
| Perceptual Accuracy (15%) | 4 | 3 | 4 |
| Implementation (10%) | 3 | 4 | 2 |
| **Weighted Total** | **3.25** | **2.85** | **3.90** |
| **Rank** | **#2** | **#3** | **#1** |

### HTML Card Science Section

Each concept card in the HTML page MUST include:

```html
<div class="science-box">
  <div class="science-label">UX SCIENCE</div>
  <div class="science-principle">[Primary UX principle name]</div>
  <div class="science-evidence">[1-2 sentences: what the research says and why it applies here]</div>
  <div class="score-summary">
    Score: <strong>X.XX</strong>/5.00 --
    Encoding: X | Pre-attentive: X | Density: X | Familiar: X | Accuracy: X | Effort: X
  </div>
</div>
```

### Ranking Hierarchy (tiebreaker rules)

If two concepts tie on weighted total:
1. Higher Encoding Redundancy wins (most impactful dimension)
2. Higher Pre-attentive Processing wins
3. Higher Implementation Efficiency wins (ship faster)

### Reference: UX Principles Library

Use these when grounding each concept. Pick the MOST specific principle that applies -- don't just say "Gestalt."

**Perception & Cognition:**
- **Wickens' Multiple Resource Theory** -- Parallel encoding channels (visual, auditory, spatial) reduce load. More channels = faster comprehension.
- **Treisman's Feature Integration** -- Pre-attentive features (color, size, orientation) are processed in parallel; conjunctions require serial attention.
- **Cleveland & McGill hierarchy** -- Perceptual accuracy: position > length > angle > area > color saturation > color hue > density.
- **Miller's Law** -- Chunking into 7+/-2 groups aids working memory. Letter labels (A/B/C/D) create scannable chunks.
- **Tufte's data-ink ratio** -- Maximize data per unit of ink. Remove non-data elements.

**Interaction & Behavior:**
- **Fitts's Law** -- Time to target = f(distance, size). Larger targets for primary actions. *Critical for Mabel's older user demographic.*
- **Hick's Law** -- Decision time = f(number of choices). Fewer visually distinct options = faster selection.
- **Jakob's Law** -- Users spend most time on OTHER apps. Match patterns they already know.
- **Norman's Affordance Theory** -- Visual properties suggest interaction (shadows = tappable, depth = draggable).

**Gestalt Principles (be specific -- say WHICH one):**
- **Similarity** -- Elements sharing visual properties (color, shape) are perceived as grouped.
- **Proximity** -- Elements near each other are perceived as related.
- **Continuity** -- Elements arranged on a line/curve are perceived as related.
- **Closure** -- Mind completes incomplete shapes (progress rings, chapter circles, partial fills).
- **Common fate** -- Elements moving together are perceived as grouped.
- **Figure-ground** -- Contrast between foreground elements and background surface.

**Heuristics (Nielsen):**
- **Visibility of system status** -- Always show what's happening (recording state, processing, chapter progress).
- **Match real world** -- Use language/metaphors users already understand (chapters, stories, memoirs -- not "entries" or "notes").
- **Consistency** -- Same action = same result everywhere in the app.
- **Recognition over recall** -- Show options rather than requiring memory.
- **Aesthetic-minimalist** -- Remove irrelevant information; every element competes for attention.

## Cleanup

After implementation is complete and approved:
```bash
rm Mabel/Mabel/Components/DesignConceptPrototypes.swift
rm Mabel/MabelTests/DesignConceptSnapshotTests.swift
rm -rf Mabel/screenshots/concepts
```

These are scaffolding files. Never ship them.

## Example Session

```
User: /design-uplift "ProgressCard"

Claude:
1. Audits ProgressCard.swift + ChapterCircleIndicator
2. Reads STYLE_GUIDE.md for Progress Card spec
3. Builds ProgressCardConceptA/B/C in DesignConceptPrototypes.swift
4. Renders 6 PNGs (3 concepts x 2 color schemes)
5. Creates HTML comparison page, opens in Chrome
6. "Pick your favorite -- concepts are ranked by UX science."

User: C looks great

Claude:
7. Plans implementation
8. Implements ProgressCardConceptC into ProgressCard.swift
9. Runs pre-submission checklist
10. Cleans up prototype files
11. Commits if requested
```
