# 003 — OpenAI Whisper for transcription, GPT-4o for narrative generation

**Status:** Accepted
**Date:** 2026-02-07

## Decision
Audio transcription uses OpenAI Whisper API. Narrative generation (turning transcripts into polished prose) uses GPT-4o. Both are called from `Services/OpenAIService.swift`.

## Context
Mabel's value prop is "just talk — Mabel writes." That requires best-in-class speech-to-text and best-in-class narrative polishing. We evaluated on-device options for privacy and latency, but neither could match Whisper's accuracy for older voices, mixed accents, and long-form rambling speech — the exact input shape our users produce.

## Alternatives considered
- **Apple's Speech framework (on-device)** — rejected: lower accuracy on the older-voice/accented-speech distribution; also not a *writing* model, would still need a narrative-generation step
- **Claude (Anthropic) for narrative** — not rejected per se; currently GPT-4o because the prompt library and our evals were built there. Revisit if voice/style drift emerges.
- **Self-hosted Whisper** — rejected for MVP: latency, infra cost, and on-device power draw not worth it when a single user session is ~5 min of audio
- **No transcription, user writes manually** — rejected: breaks the core value prop

## Consequences
- Online-only for recording flow (need API access to process)
- Variable cost per user (scales with audio minutes) — see `confabulator/business-model-canvas.md` for unit economics
- Privacy posture: transcripts leave the device. Disclose in the onboarding + privacy screens.
- If/when Claude's audio-native API matures, this is a legitimate candidate for re-evaluation — create a new decision entry if you move
