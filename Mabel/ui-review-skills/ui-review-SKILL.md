---
name: ui-review
description: "Audit SwiftUI views for HIG compliance, accessibility, Dynamic Type, and tap targets (min 44pt). Auto-invoked by /verify when views change. Use when you say 'check the UI', 'HIG review', or 'accessibility check'."
---

# UI Review (Internal Helper)

Role: You audit SwiftUI views for Human Interface Guidelines compliance, accessibility, font best practices, and visual polish.

This is an internal helper -- typically auto-invoked by `/verify` when view files change, not called directly.

## When this runs

- Auto-invoked by `/verify` when SwiftUI view files changed
- User says `/ui-review` directly
- Before shipping a new screen to TestFlight

If $ARGUMENTS is empty, review all changed SwiftUI view files. If a file path is given, focus there.

## Pre-Ship Visual Verification (Mandatory)

Before marking ANY UI work complete:
1. Build passes -- use **mcp__xcode__BuildProject**
2. Tests pass -- use **mcp__xcode__RunAllTests**
3. Preview renders -- use **mcp__xcode__RenderPreview** on changed views
4. Navigate to changed screen in simulator
5. Take screenshot
6. Show screenshot to user for approval

Never say "design is complete" without step 6.

## Steps

### 1. Identify target views

If $ARGUMENTS specifies a file, review that. Otherwise:

```bash
cd /Users/koossimons/LLYLI/llyli-ios && git diff --name-only | grep -E '(View|Screen|Page)\.swift$'
```

### 2. Read and analyze each view

For each view file, check against these categories:

#### HIG Compliance
- [ ] Standard spacing (8pt grid, 16pt margins)
- [ ] Navigation patterns match platform conventions
- [ ] Colors use semantic system colors or design tokens (`LLYLIColors`)
- [ ] Safe area respected
- [ ] No custom back buttons that break swipe-to-go-back

#### Font and Typography
- [ ] Uses Dynamic Type (no hardcoded font sizes)
- [ ] Text styles use `.font(.body)`, `.font(.headline)`, etc.
- [ ] Font hierarchy is clear (title > headline > body > caption)
- [ ] Long text handles truncation or scrolling

#### Accessibility
- [ ] Interactive elements have accessibility labels
- [ ] Images have `.accessibilityLabel()` or are marked decorative
- [ ] Tap targets are at least 44x44pt
- [ ] Color is not the only way to convey information
- [ ] VoiceOver navigation order makes sense
- [ ] `.accessibilityHint()` for non-obvious actions

#### LLYLI Design Language
- [ ] Moleskine design: `.notebookCard()`, `.embossedText()`, warm palette
- [ ] `LLYLIColors.teal` / `.coral` used consistently
- [ ] Exercise views clearly show word in sentence context (never isolated)
- [ ] Asymmetric padding: `.padding(.leading, LLYLISpacing.bindingLeadingPadding)`

### 3. Verify build and previews

Build: Use **mcp__xcode__BuildProject**. Then **mcp__xcode__XcodeListNavigatorIssues** for warnings.

Previews: Use **mcp__xcode__RenderPreview** for changed views.

## Output

```
UI REVIEW
---
Views reviewed:
  - list of files

HIG Compliance:     PASS or issues
Font/Typography:    PASS or issues
Accessibility:      PASS or issues
LLYLI Design:       PASS or issues

Issues found: N

[If issues found:]
  [severity] file.swift:line -- Description
    Fix: What to do

Verdict: SHIP IT or NEEDS WORK
---
```
