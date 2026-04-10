# Mabel — Mascot Design Brief

> **Single source of truth** for the Mabel mascot character.
> All mascot-related decisions, specs, and asset requirements live here.
> When in conflict with any other file, THIS document wins for mascot matters.

---

## Section 1 — Character Identity

- **App name:** Mabel
- **Mascot name:** TBD (may or may not share the app name — to be decided after archetype exploration)
- **Role:** AI memoir companion — a warm, wise guide who interviews you and writes your life story
- **Emotional keywords:** Warm, wise, encouraging, curious, caring, approachable, trustworthy
- **Anti-keywords (NOT this):** Clinical, corporate, techy, formal, fragile, infantilizing, wacky, edgy, cold
- **Archetype:** _TBD — to be filled in after ChatGPT brainstorm and selection_

---

## Section 2 — Visual Description

> To be completed once an archetype is selected and visual development begins.

```
Character type:            ___
Distinguishing features:   ___
Color palette:             ___
Art style:                 ___
Default pose (full):       ___
Default pose (head/icon):  ___
Expression/mood:           ___
```

---

## Section 3 — Required Asset Variants

These are design-agnostic — they define WHAT is needed regardless of the character chosen.

| Variant | Description | Sizes | Where Used in App |
|---------|-------------|-------|-------------------|
| **Full mascot** | Primary character illustration, complete figure | 260pt (hero), 200pt, 140pt (greeting), 80pt (empty state), 60pt (inline), 40pt (decorative) | Welcome hero, Library greeting, empty states |
| **Circular head icon** | Head/face in a hard-edged circle with background fill | 28pt (displayed), export @1x/2x/3x: 28/56/84px | Icon lockup on Screens 3–8 |
| **App icon** | Character adapted to iOS rounded-rect icon frame | 1024x1024px | App Store, home screen |
| **Wordmark** | "Mabel" text logo | 24pt default height | Screen headers — **TBD: keep current wordmark or redesign with mascot** |

### Source File Requirements
- Full mascot: minimum **1024px wide** source for clean downscaling
- Circular icon: minimum **252px** source (84px @3x)
- App icon: exactly **1024x1024px** PNG
- All assets: vector or high-res raster suitable for @3x Retina

---

## Section 4 — Icon Lockup Spec

```
[Circular head icon 28pt] — [8pt gap] — ["Mabel" wordmark 24pt]
```

### Usage Rules
| Screen | Uses lockup? | Notes |
|--------|-------------|-------|
| Welcome | NO | Full mascot hero — no lockup needed |
| Library | NO | MascotGreetingHeader — mascot + greeting text |
| Setup | YES | Top of screen |
| RecordingSetup | YES | Top of screen |
| Recording | YES | Top of screen |
| ChapterReview | YES | Top of screen |
| MyStories | YES | Top of screen |
| Profile | YES | Top of screen |

---

## Section 5 — Personality & Expression Guide

The mascot's expression should adapt to context to reinforce the emotional journey of memoir creation.

| Context | Expression | Energy | Example moment |
|---------|-----------|--------|----------------|
| **Default / idle** | Warm, attentive, gently engaged | Calm, present | Screen headers, navigation |
| **Welcome / greeting** | Open, inviting, friendly | Welcoming | Welcome screen hero, Library greeting |
| **During recording** | Animated, leaning in, curious | Encouraging | "Tell me more" — active listening |
| **On completion** | Proud, delighted, celebratory | Joyful | Chapter complete, memoir finished |
| **Empty state** | Gentle, beckoning, encouraging | Soft | "No stories yet — let's start!" |
| **Error / waiting** | Patient, understanding | Reassuring | Loading states, API failures |

### Never
- Sleeping, bored, disinterested
- Sad, crying, distressed
- Confused, lost, broken
- Angry, frustrated, annoyed

---

## Section 6 — App Color Context

The mascot lives within this color environment. Its own palette should complement — not clash with — these UI colors.

| Token | Hex | Relationship to mascot |
|-------|-----|----------------------|
| primary | `#2E7D6B` | Teal — UI elements surrounding mascot |
| accent | `#f9e269` | Gold — subtle glow/highlight behind mascot |
| primary-light | `#f0faf7` | Mint — default circle fill behind head icon |
| background | `#FFFFFF` | White — primary screen background |
| backgroundGradientEnd | `#D5DFDB` | Sage — gradient background on Welcome/Setup |
| text | `#2d2c2b` | Warm dark brown — all text near mascot |
| border-warm | `#e8e0da` | Warm gray — card borders near mascot |

### Banned Colors (never use in mascot assets)
| Hex | Why |
|-----|-----|
| `#ed7d3c` | Removed orange — not in palette |
| `#F3E0D2` | Old peach background — retired |
| `#1F7A6F` | Old teal — replaced by `#2E7D6B` |
| `#000000` | Pure black — too harsh |

---

## Section 7 — Technical Requirements

### File Format & Transparency
- **All assets:** PNG with transparent background (except app icon)
- **App icon:** PNG, NO transparency, NO baked rounded corners (iOS adds them automatically)
- **Rendering:** SwiftUI `.renderingMode(.original)` — no tinting, preserve original colors

### Resolution
| Asset | Minimum Source Size | Export Sizes |
|-------|-------------------|-------------|
| Full mascot | 1024px wide | @1x, @2x, @3x for each display size |
| Circular icon | 252px (84px @3x) | 28px, 56px, 84px |
| App icon | 1024x1024px | Single size (iOS handles scaling) |

### Scaling
- Full mascot must remain legible and emotionally expressive from 40pt to 260pt
- Circular icon must be recognizable at 28pt — simple silhouette, high contrast
- Icon and full versions must be **recognizably the same character**
- Use `.scaledToFit()` with fixed frames — maintain aspect ratio at all sizes

---

## Section 8 — Universal Do-NOTs

These rules apply to ALL mascot assets regardless of archetype or art style.

| Rule | Reason |
|------|--------|
| No baked-in background scenes | Assets sit on varying backgrounds — transparency required |
| No text or words in mascot images | Text is handled separately in UI code |
| No banned colors (see Section 6) | Palette consistency |
| No fine detail that disappears at small sizes | Must scale to 28pt icon |
| No trendy styles that will date quickly | Brand longevity |
| Icon must match full character | Users must recognize the icon as "that's Mabel" |
| No accessories that read as a specific age/era | Must feel timeless, appeal to 20s–80s |
| No cultural or religious specificity | Global audience |

---

## Revision History

| Date | Change |
|------|--------|
| 2026-03-27 | Initial brief created — Sections 1–2 are templates pending archetype selection, Sections 3–8 complete |
