# 001 — Native SwiftUI, not cross-platform

**Status:** Accepted
**Date:** 2026-02-07

## Decision
Mabel ships as a native iOS SwiftUI app. No React Native, Flutter, Capacitor, or web wrapper.

## Context
An earlier iteration of the product used a web stack (Prisma, Playwright, Capacitor-style iOS shell — preserved in `archive/legacy-web/`). Voice recording latency, haptics fidelity, Dynamic Type handling, and the "feels like iOS" bar for our older-user audience were all worse in the hybrid setup than they needed to be. We rewrote native.

## Alternatives considered
- **React Native** — rejected: audio recording + waveform + haptics all require bridging, and the Comfortaa/Nunito typography system depends on UIKit-level font loading that RN makes awkward
- **Flutter** — rejected: same bridging cost, plus non-native feel on iOS which conflicts with the "warm and familiar" tone for grandparent users
- **Capacitor / web shell** — already tried (see `archive/legacy-web/`); audio latency and PDF export were blockers
- **SwiftUI + Kotlin Multiplatform** — rejected as premature; we don't have an Android audience yet and aren't maintaining two codebases until we do

## Consequences
- Locks us to Apple platforms until we ship a separate Android codebase later
- All `@Observable` state, `AVFoundation` audio, and `PDFKit` export are first-party (no plugins)
- "Can we share code with Android / the web?" is settled — the answer is no until a dedicated Android effort is scoped
