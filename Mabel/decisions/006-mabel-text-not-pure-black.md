# 006 — Body text color is `mabelText` (#2d2c2b), never pure black

**Status:** Accepted
**Date:** 2026-02-07

## Decision
All body text uses `mabelText` (`#2d2c2b`) via the token. Pure black (`#000000`) is banned. Gray is also banned for body copy — helper/subtle text uses `mabelText` at 60% opacity, not a separate gray token.

## Context
Pure black on white is too high contrast for long-form reading, especially for older users and for the soft, warm brand feel. `#2d2c2b` is a near-black that reads comfortably against both the white background (`mabelBackground`) and the warm-off-white alternate (`mabelBackgroundAlt` `#f8f4f2`).

## Alternatives considered
- **`#000000` pure black** — rejected: brand feel too stark; legibility *worse* against warm backgrounds for extended reading
- **A distinct mid-gray for helper text** (e.g., `#7A7168`) — rejected and actively banned: two text colors on one screen muddies the hierarchy; 60% opacity of `mabelText` achieves the "subtle" read without introducing a new token
- **System label color** — rejected: doesn't pass the brand feel; also varies between iOS versions

## Consequences
- `Color.mabelText` is the single body color token
- `.foregroundColor(.black)` and literal `Color(hex: "000000")` are banned — `ui-review` skill flags both
- Gray-on-white for body copy is banned — use opacity, not a second color
- "Can we use a softer gray for captions?" is settled — no. Use `mabelText` at 60%.
- See `MISTAKES.md` — this is one of the mistakes Claude has repeatedly made
