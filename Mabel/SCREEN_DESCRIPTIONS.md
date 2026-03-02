# Mabel — Screen Descriptions

> Detailed descriptions of every screen in the Mabel app, based on Excalidraw wireframes.
> Use these descriptions alongside the wireframe images as the source of truth for UI implementation.

---

## Screen 1 — Intro/Welcome

- Heading: "Welcome to Mabel" — large, bold, centered, positioned in upper-middle area of screen
- Subtext line 1: "Your AI-assisted ghost writer." — centered, subtle weight
- Subtext line 2: "Capture your stories and write a book for future generations." — centered, subtle weight
- Subtext line 3: "No typing, just talking." — centered, subtle weight, acts as the key value proposition hook
- Large empty space between subtext and CTA
- CTA button: "GET STARTED" — full-width teal pill button, pinned near bottom
- Background: brand gradient (teal to cream, top to bottom)

---

## Screen 2 — Setup

- Top: Mabel wordmark/logo centered
- **Section 1 — Name input:**
  - Label: "Tell us your name:" — left-aligned, bold
  - Single text input field, full-width, cream background, placeholder text
- **Section 2 — Writing goal:**
  - Label: "Set a writing goal:" — left-aligned, bold
  - 4 pill buttons in a 2x2 grid layout (single-select):
    - "1x week" | "2x week"
    - "3x week" | "I'll write when I want"
  - This selection drives push notification frequency (post-MVP feature)
- Large empty space between writing goal and CTA
- CTA button: "START RECORDING" — full-width teal pill button, pinned near bottom
- Note: This screen has been simplified from the previous version — relationship selector and topic pills have been removed. The chapter-based structure now handles topic selection instead.
- Background: brand gradient

---

## Screen 3 — Library (Home Page)

- **Top bar:** Mabel wordmark/logo (left) + Profile icon "P" (top-right, navigates to Profile page) + circular progress bar (top-right area)
- **Hero section:**
  - "\<Person's Name\>'s Book" — bold heading, dynamically populated from Setup screen name input
  - "0 of 10 chapters completed" — subtitle with progress count
  - Horizontal progress bar below (fills as chapters are completed)
- **Featured chapter card** (prominent, full-width cream card):
  - Shows the current/next chapter to work on (e.g., "Chapter 1 – Childhood")
  - "0 of 5 memories recorded" — progress within the chapter
  - CTA button: "START CHAPTER" (if new) or "CONTINUE CHAPTER" (if in progress)
- **Section heading:** "All Chapters"
- **Chapter grid:** 2-column grid of 10 chapter cards, each showing chapter number + title:
  - Chapter 1 – Childhood
  - Chapter 2 – Adolescence
  - Chapter 3 – First Love
  - Chapter 4 – First Life Lessons
  - Chapter 5 – College or First Job
  - Chapter 6 – Parenthood or Mid Life Crisis
  - Chapter 7 – Career
  - Chapter 8 – Hard Times
  - Chapter 9 – Triumphs
  - Chapter 10 – Legacy
- Chapter cards must visually indicate state: locked (grayed/lock icon), available, in progress (show progress), completed (checkmark). When a chapter is completed, it should show a conditional element to "start next chapter."
- Chapters 2-10 are locked behind a paywall — user must pay to continue after completing Chapter 1. Paywall screen is post-MVP; for now just show locked state visually.
- **Bottom persistent tab bar:** HOME | MY STORIES (this tab bar appears on ALL screens after onboarding)
- **NOTE:** This Library screen becomes the home page after the user completes onboarding (Screens 1-2). On all subsequent app launches, the user lands here directly.
- Background: brand gradient
- Content is scrollable

---

## Screen 4/6 — Recording Setup (Single View with Conditional States)

> This is ONE SwiftUI view with conditional elements based on recording state, NOT two separate screens.

- **Top bar:** Mabel wordmark/logo + Profile icon "P" (top-right)
- **Chapter heading:** e.g., "Chapter 1 – Childhood" — bold
- **Progress:** "X of 5 memories recorded" — subtitle, dynamically updated
- **Progress bar:** visual bar showing memory completion within this chapter
- **CONDITIONAL:** "CONTINUE LAST RECORDING" button — appears ONLY if user previously used "Stop & Save" (saved progress but didn't finish a memory). Allows resuming an incomplete recording.
- **Mic button:** large teal circle, centered, with mic icon. Tapping starts recording and transitions to Recording Active state (Screen 5)
- **Instruction text:** "Pick a topic related to [chapter topic] and start recording:" — centered, subtle
- **3 AI-generated suggestion cards** (cream cards, full-width, tappable):
  - Suggestions are contextual to the current chapter topic
  - On return visits: randomly suggest NEW topics, excluding what has been previously selected AND submitted
- **"Or write here..."** — expandable text box at the bottom for users who prefer typing
- Tapping a suggestion card OR the mic button starts recording
- **Persistent bottom tab bar:** HOME | MY STORIES
- Background: brand gradient

---

## Screen 5 — Recording (Active)

- **Top:** Mabel wordmark/logo
- **Chapter heading:** "Chapter 1 – Childhood" — bold
- **Progress:** "X of 5 memories recorded"
- **Mic button:** large circle, changes from teal to burgundy/red (#A3243B) when actively recording, with pulsing glow rings around it
- **Waveform visualization:** animated audio bars below the mic, appear once recording starts
- **Timer:** "00:40" format — large, counting up
- **Status label:** "Recording..." or "Paused" — below timer
- **Control buttons row (3 buttons):**
  - "Clear" — destructive, resets current recording
  - "Pause" — pauses/resumes recording
  - "Stop & Save" — saves progress so user can continue this memory later (partial save, does NOT submit the memory)
- **"SAVE MEMORY"** — full-width teal CTA button at bottom. This submits the completed memory and triggers AI processing. Navigates back to Recording Setup with updated progress.
- **Persistent bottom tab bar:** HOME | MY STORIES
- Background: brand gradient

---

## Screen 7 — My Stories (Book Reader)

- **Top:** Chapter title (e.g., "Chapter 1 – Childhood") + Profile icon "P" (top-right)
- **Content:** Clean reading experience — should look and feel like a Kindle/PDF reader opened within the app, like a virtual book
- Each chapter displayed as a cream card/page containing the AI-polished narrative text
- Chapters stacked vertically in order, user scrolls down to read all generated chapters
- Only completed chapters appear here (chapters with submitted memories that have been processed by AI)
- Minimal UI — the text is the focus. No distracting elements.
- **Persistent bottom tab bar:** HOME | MY STORIES
- Background: brand gradient or white/cream for reading comfort

---

## Screen 8 — Library Finished (Book Complete)

- Same layout as Screen 3 (Library) but in completed state
- **Top bar:** Mabel wordmark/logo + Profile icon "P"
- "\<Person's Name\>'s Book"
- "10 of 10 chapters completed" — full progress
- **Progress bar:** completely filled
- **Heading:** "Congratulations!" — bold, celebratory
- **Subtext:** "Your book is ready. Choose your format and export:"
- **Two export option buttons** (large, full-width cream cards):
  - "PDF DOWNLOAD" — included in basic/paid tier
  - "AUDIOBOOK" — requires additional payment (premium upsell, post-MVP)
- "MY STORIES" button — navigates to the reader view (Screen 7)
- **Persistent bottom tab bar:** HOME | MY STORIES
- Background: brand gradient

---

## Screen 9 — Profile Page

- **Heading:** "Edit Profile"
- **Subheading:** "Profile Information"
- **Display Name:** text input field (pre-populated from Setup)
- **Gender:** single-select pill buttons — "Male" | "Female" | "Other"
- **Payment Method:** text input or linked payment display (post-MVP, placeholder for now)
- **Bottom buttons:** "SAVE" | "HOME"
- **Persistent bottom tab bar:** HOME | MY STORIES
- Background: brand gradient
