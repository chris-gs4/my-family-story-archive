---
name: check-past-decisions
description: Search the Mabel decision log and mistakes log before proposing architecture, library, or UX changes. Use when the user (or you) is about to propose "should we use X", "let's switch to Y", "I want to add Z", or any non-trivial design direction — this skill catches cases where the question was already settled.
allowed-tools: [Read, Glob, Grep]
---

# check-past-decisions

Before answering any question that proposes a non-trivial architecture, library, platform, data model, or UX-pattern change, check whether the question is already settled in `Mabel/decisions/` or flagged in `Mabel/decisions/MISTAKES.md`. If it is, cite the entry and confirm with the user before re-opening it.

## When this skill activates

Invoke this skill — either by the user typing `/check-past-decisions` or automatically whenever a proposal matches patterns like:

- "Should we use / switch to / try X?"
- "Let's add / rewrite / migrate to Y"
- "I want to move from / replace Z"
- Any suggestion of a new library, framework, platform target, data model change, or chapter/memory-structure change
- Any color / font / spacing suggestion that isn't already in the design tokens

## What to do

1. **Extract search terms** from the proposal. Prefer specific technical names over generic words:
   - "React Native" → search `react native`, `cross-platform`, `hybrid`
   - "Add Firebase" → search `backend`, `firebase`, `auth`, `sync`
   - "Change font to SF Pro" → search `comfortaa`, `nunito`, `system font`, `typography`
   - "Let users create custom chapters" → search `chapter`, `schema`, `structure`

2. **Grep both logs**, in order:
   ```
   Grep(pattern="<term>", path="Mabel/decisions/", output_mode="content", -C=2, -i=true)
   Grep(pattern="<term>", path="Mabel/decisions/MISTAKES.md", output_mode="content", -C=1, -i=true)
   ```

3. **If matches are found in decisions/**, read the full matching entry. Then respond to the user in this format:

   ```
   This is covered by decision NNN — <title>.
   Decision: <one-sentence summary>
   Alternatives previously rejected: <list>
   Status: Accepted (YYYY-MM-DD)

   Do you want to re-open this decision, or proceed with the existing one?
   ```

   Wait for explicit user direction before proceeding.

4. **If matches are found in MISTAKES.md**, quote the line and point at the correct behavior. Do not ask permission for MISTAKES entries — just apply the correct behavior (it's already been decided).

5. **If no matches are found**, say so in one sentence ("No prior decision on `<term>` found in `decisions/`") and proceed with your answer. If the outcome is a non-trivial decision, suggest adding a new `NNN-*.md` entry after it's settled — but draft it only when the user agrees.

## When NOT to use this skill

- Pure implementation tasks ("build this view", "fix this bug", "run the tests")
- Questions with an obvious answer from the code or `STYLE_GUIDE.md`
- Routine refactors that don't change behavior or introduce new dependencies

## Output format

Keep it tight. The value is speed — you're a pre-flight check, not a meeting. If nothing relevant is on file, say that and move on.
