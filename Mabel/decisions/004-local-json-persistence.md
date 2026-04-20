# 004 — Local JSON persistence, no backend (for MVP)

**Status:** Accepted
**Date:** 2026-02-07

## Decision
All user data (profile, chapters, memories, audio file references, generated narratives) is stored in local JSON files on device. No cloud database, no account system, no sync server for MVP.

## Context
MVP needs to ship fast, prove the core loop (record → transcribe → narrative → book), and keep the privacy story simple ("your stories stay on your phone except when we briefly send audio to transcribe"). A backend + auth + sync adds weeks of work and a second privacy surface area for very little MVP value.

## Alternatives considered
- **Core Data / SwiftData** — rejected for MVP: migration complexity, overkill for a fixed 10-chapter schema; JSON is human-readable for debugging
- **Firebase / Supabase backend** — rejected: auth flow, privacy review, cost-per-user all premature
- **CloudKit sync** — rejected: ties us to Apple ID, adds UX friction for the gift-recipient flow, still requires cross-device reconciliation logic we don't need yet
- **iCloud Drive file sync** — considered for future (automatic, native, no auth needed) — not MVP, but the JSON-file format makes this a clean upgrade path

## Consequences
- Losing the phone = losing the book (until we ship export/backup — PDFKit export already exists; add iCloud Drive sync before public launch)
- "Can we use iCloud for sync?" is a legitimate *future* decision — add a new entry when the time comes
- Multi-device support is not a thing. Don't design flows that assume it.
- User data models live in `Mabel/Models/` and serialize to JSON via `Codable`
