# 005 — Comfortaa (body) + Nunito (headlines) typography system

**Status:** Accepted
**Date:** 2026-02-07

## Decision
Two-font system: **Nunito ExtraBold 800** for headlines (hero and section), **Comfortaa** for everything else (body, helper, labels, buttons). System fonts are never an acceptable fallback — if a font doesn't load, debug the loading, don't silently fall back.

## Context
Mabel's tone is "warm, encouraging, like a skilled biographer" — we needed rounded forms to feel approachable, but with enough weight contrast to hold a clear visual hierarchy. Single-font systems felt either too childish (Comfortaa alone at heavy weight) or too neutral (system fonts).

## Alternatives considered
- **Single font (Comfortaa everywhere)** — rejected: heroes and section titles lacked punch; hierarchy collapsed
- **Single font (Nunito everywhere)** — rejected: body copy felt too assertive; warmth lost at small sizes
- **System fonts (SF Pro)** — rejected: doesn't match the "not a productivity tool" brand feel; too associated with iOS system apps
- **Serif for body (e.g. Merriweather, Lora)** — rejected: reading on phones at body size, sans-serif was more legible for the older-user audience

## Consequences
- `Mabel/Mabel/Theme/MabelFonts.swift` loads both variable TTFs (Comfortaa-Variable + Nunito)
- `Mabel/Mabel/Theme/MabelTypography.swift` maps semantic styles to the right font
- Banned: `.font(.system(...))` anywhere in views; if Comfortaa or Nunito fails to load, FIX the loading, do not fall back
- "Should we use SF Pro to save the custom-font step?" is settled — no
- See `MISTAKES.md` for the silent-fallback pattern that keeps creeping back in
