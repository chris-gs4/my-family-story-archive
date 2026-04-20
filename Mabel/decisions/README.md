# Mabel Decision Log

This folder records **why** we made the architecture and UX decisions that shape Mabel. Code and commits answer "what"; this folder answers "why," including what we rejected and why those alternatives are still rejected.

## When to add an entry

Add a new decision entry when any of these happens:

- A non-trivial architecture choice is made (framework, library, data model, API, platform)
- A UX pattern is chosen over an alternative (flow, component, copy approach)
- We reverse a prior decision (supersede with a new entry; mark the old one superseded)
- We explicitly decide *not* to do something that keeps coming up

Do **not** add entries for:

- Code-level details (those belong in `STYLE_GUIDE.md` or the code itself)
- Personal mistakes / corrections (those belong in `MISTAKES.md`)
- In-progress thinking that hasn't been decided

## File format

One decision per file. Naming: `NNN-short-slug.md` with zero-padded number, e.g. `007-family-plan-pricing-model.md`. Numbers are chronological, not semantic.

```markdown
# NNN — Short title

**Status:** Accepted | Superseded by NNN
**Date:** YYYY-MM-DD

## Decision
One sentence. The thing we decided to do.

## Context
Why this came up. What problem we were solving.

## Alternatives considered
- Option A — rejected because...
- Option B — rejected because...

## Consequences
What this locks in. What becomes harder. What gets easier.
```

## How Claude Code uses this

The `/check-past-decisions` skill and the top-of-session instruction in `Mabel/CLAUDE.md` tell Claude to:

1. Grep `decisions/` for related terms before proposing any architecture, library, or UX change
2. If a match is found, cite it and confirm with the user before re-opening the question
3. Update `MISTAKES.md` when the user corrects a repeated error (manual — Claude proposes the line, user approves)

If you (the user) find Claude re-opening something that's already settled here, add the keywords from its suggestion into the relevant decision entry so future greps match.
