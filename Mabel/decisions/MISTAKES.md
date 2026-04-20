# Mistakes to Avoid

Append-only, user-curated log of specific errors Claude Code has made on Mabel. When the user corrects Claude, Claude proposes a new entry here and the user approves. Do NOT auto-generate entries — they have to earn their place.

Format: `- [YYYY-MM-DD] Mistake → Correct answer → Reason`

---

## UI / Styling

- [2026-02-07] Using `Text("Mabel")` for the wordmark → use `Image("MabelWordmark")` → the wordmark is a specific hand-tuned image asset; text rendering of "Mabel" doesn't match the brand
- [2026-02-07] `.foregroundColor(.black)` or `#000000` for body text → use `Color.mabelText` (`#2d2c2b`) → pure black is too stark against the warm backgrounds; see decision `006-mabel-text-not-pure-black.md`
- [2026-02-07] Using a literal gray color for helper / caption text → use `Color.mabelText.opacity(0.6)` → we don't keep a second text color token; see decision `006`
- [2026-02-07] `.font(.system(...))` as a fallback when Comfortaa/Nunito fails to load → fix the font loading, never fall back → silent system-font fallback has shipped to TestFlight twice; see decision `005-comfortaa-plus-nunito-typography.md`
- [2026-02-07] Using orange `#ed7d3c` anywhere → banned color; use `mabelAccent` (`#f9e269`) for decorative or `mabelPrimary` (`#2E7D6B`) for interactive → left over from an earlier palette
- [2026-02-07] Using the old peach background `#F3E0D2` → banned; backgrounds are white (`mabelBackground`) or warm-off-white (`mabelBackgroundAlt` `#f8f4f2`) → palette changed, references keep re-appearing
- [2026-02-07] Using the old teal `#1F7A6F` → banned; current primary is `mabelPrimary` (`#2E7D6B`) → slightly-off hex keeps getting copied from older screens
- [2026-02-07] Hardcoding spacing (`.padding(24)`) or corner radius (`.cornerRadius(20)`) → use the token (`.padding(MabelSpacing.screenPadH)`, `.cornerRadius(MabelSpacing.cornerRadiusCard)`) → magic numbers bypass the design system and drift over time
- [2026-02-07] Using `mabelAccent` (`#f9e269`) as a fill/background → decorative only; never a large surface → the accent is a spot color, not a background

## Architecture / Scope

- [2026-02-07] Proposing "let's add Android support via React Native / KMP" → out of scope; see decision `001-native-swiftui-not-cross-platform.md` → we deliberately rewrote off a hybrid stack; don't re-open without a new decision
- [2026-02-07] Proposing a backend / auth flow for MVP → local JSON only; see decision `004-local-json-persistence.md` → sync/auth is a future decision, not an MVP one
- [2026-02-07] Suggesting user-defined chapter counts or variable memoir length → fixed 10 chapters / 5 memories; see decision `002-ten-chapter-structure.md` → the fixed structure is the product

## Process

- [2026-02-07] Skipping the pre-submission checklist in `STYLE_GUIDE.md` before marking a screen done → run the checklist; also run `/ui-review` for any new or modified view → the checklist exists because these mistakes ship without it
