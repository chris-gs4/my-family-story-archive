---
name: design-preview
description: Scaffold a SwiftUI view stub, render with Xcode preview, and get approval before full implementation
triggers:
  - /design-preview
  - design preview
  - preview before building
---

# /design-preview -- Design-First Preview

Render a SwiftUI preview before implementing any UI feature. This is the gate before `/issue` for any feature with a UI component.

## When to Use (and When to Skip)

**Use when:** The change introduces or significantly alters a visible UI surface (new view, new layout, redesigned screen).

**Skip when:** The change is backend-only, logic-only, or modifies an existing view by fewer than ~10 lines. If in doubt, ask: "Would a screenshot help decide whether to build this?" If yes, use `/design-preview`.

## Usage

```
/design-preview "feature description"
```

## Workflow

### Step 1: Understand the Design Intent

Before writing code, clarify:
- **What screen(s) are affected?** New view, or modification of existing?
- **What data does the view display?** Identify the fields, states, and edge cases (empty state, error state, loading, populated).
- **What does the user interact with?** Taps, swipes, text input, toggles.

### Step 2: Generate SwiftUI Stub

Create a minimal SwiftUI view stub:
- **Body ≤ 150 lines** (hard limit -- extract subviews if needed)
- **Hard mock data only** -- no real services, no @Observable, no network calls
- **Cover all visual states** -- at minimum: populated, empty, and one error/edge case
- Interactive where possible (Button with state toggles, navigation shell)
- `#Preview` blocks for: iPhone 17, iPhone SE (compact), and Dark Mode

Write stub to: `Sources/LLYLIKit/Views/<Feature>/<Feature>PreviewView.swift`

Replace `<Feature>` with the actual feature name (e.g., `StreakBadge`, `ProPaywall`).

### Step 3: Render Previews

Use `mcp__xcode__RenderPreview` to render each preview variant:
1. iPhone 17 (default, light mode)
2. iPhone SE (compact layout -- does content overflow? are tap targets ≥ 44pt?)
3. Dark Mode (colors readable? contrast passes WCAG AA?)

Save screenshots to: `docs/design/previews/<feature-name>-YYYY-MM-DD.png`

If `mcp__xcode__RenderPreview` fails, check:
- Does the file compile? Run `mcp__xcode__BuildProject` first.
- Is Xcode open with the LLYLIApp project?

### Step 4: Present for Approval

Show screenshots inline and ask:
> "Design preview ready. Approve to proceed, or request changes."

**Do NOT start full implementation until explicitly approved.** If changes are requested, update the stub and re-render -- do not proceed with a "close enough" version.

### Step 5: Cleanup After Implementation

After the feature is implemented and `/verify` passes, delete the preview stub:
```bash
rm Sources/LLYLIKit/Views/<Feature>/<Feature>PreviewView.swift
```
It's scaffolding, not production code. Never ship preview stubs.

## Auto-invocation

Auto-invoked by `/issue` for any issue tagged with `design`, `feature`, or `ui` label.

## SwiftUI Stub Template

```swift
import SwiftUI

// PREVIEW STUB -- delete after implementation approved
// Generated: YYYY-MM-DD
struct FeatureNamePreviewView: View {
    // ── Mock Data ──
    // Replace with realistic data for the feature being previewed.
    // Use actual types from the codebase where possible (e.g., WordModel).
    @State private var isRevealed = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Populated state here
            }
            .navigationTitle("Feature Name")
        }
    }
}

// ── Empty State ──
struct FeatureNameEmptyPreviewView: View {
    var body: some View {
        NavigationStack {
            ContentUnavailableView("No Items Yet",
                systemImage: "tray",
                description: Text("Items will appear here."))
        }
    }
}

#Preview("iPhone 17") {
    FeatureNamePreviewView()
}

#Preview("iPhone SE") {
    FeatureNamePreviewView()
        .previewDevice(PreviewDevice(rawValue: "iPhone SE (3rd generation)"))
}

#Preview("Dark Mode") {
    FeatureNamePreviewView()
        .preferredColorScheme(.dark)
}

#Preview("Empty State") {
    FeatureNameEmptyPreviewView()
}
```

## Rules

- View body ≤ 150 lines (extract subviews if approaching limit)
- No imports of Services (SupabaseService, FSRSService, etc.)
- No @Observable dependencies
- No async/await or network calls
- All data must be hardcoded constants or @State for interactivity
- Use LLYLI design system tokens (LLYLIColors, LLYLITypography) where available
- Tap targets ≥ 44pt (check in SE preview)
- Test both color schemes -- a preview that only looks right in light mode is incomplete
