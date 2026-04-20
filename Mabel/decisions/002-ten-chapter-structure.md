# 002 — Ten-chapter story structure with five memories per chapter

**Status:** Accepted
**Date:** 2026-02-07

## Decision
A user's memoir in Mabel is exactly **10 chapters**, each containing **5 memories** — a fixed 50-memory scaffold. The chapters are pre-defined (not user-created) and guide the AI interview flow.

## Context
Memoir writing is paralyzing without structure. A blank "start writing" prompt fails the target user (first-time storytellers, grandparents, people prompted by a gift). We needed a fixed skeleton that feels like a real book's table of contents but is finishable in a realistic number of sessions.

## Alternatives considered
- **User-defined chapters** — rejected: too much upfront cognitive load; users can't chapterize a memoir they haven't written yet
- **Variable chapter count** — rejected: progress feels endless; "Chapter 7 of ???" can't drive motivation
- **Continuous story (no chapters)** — rejected: loses the "a book in your pocket" feel and makes the AI interview flow harder to scope
- **3 chapters / 10 chapters / 20 chapters** — 10 won: short enough to complete, long enough to feel like a real memoir (~50 memories = typical 200-page audio-sourced book)

## Consequences
- `Chapter` and `Memory` models can be fixed-schema, simpler code
- Progress UI ("Chapter 3 of 10", "2/5 memories in this chapter") is trivially renderable
- The AI interview flow (`StoryProcessingService`) can be tuned per-chapter
- "Let users add an 11th chapter" is settled — no. If users outgrow 10, that's a future feature (potentially a "Volume 2") not a change to the core schema
