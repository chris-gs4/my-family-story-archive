# Mabel Demo - Loom Recording Guide (iOS Simulator)

## 🎯 Goal
Record a 3-5 minute Loom video showing the iOS app in simulator - complete user journey from signup to generating a chapter.

---

## 📋 Pre-Recording Setup (5-7 minutes)

### Step 1: Clean Your Database & Seed Test Data

```bash
# Reset database to clean state
npx prisma migrate reset --force

# This will:
# - Drop all tables
# - Re-run migrations
# - Run the default seed (creates test user)
# - You'll need to seed test project separately
```

### Step 2: Seed Complete Test Project

```bash
# Run the complete test project seed
npm run test:seed

# This creates:
# ✅ Test user: demo@mabel.com / password123
# ✅ Project with interviewee (Robert Johnson)
# ✅ Module 1: Complete with chapter
# ✅ Module 2: Complete with chapter
# ✅ Ready for PDF export
```

### Step 3: Start Your Development Server

```bash
npm run dev
```

**IMPORTANT:** Keep this terminal running! The iOS app needs the server at http://localhost:3000

### Step 4: Sync Capacitor & Open Xcode

```bash
# Sync web assets to iOS project
npm run cap:sync

# Open Xcode project
npx cap open ios
```

### Step 5: Configure Simulator in Xcode

1. In Xcode, at the top, select a simulator device:
   - Click the device dropdown (next to "App" scheme)
   - Choose: **iPhone 15 Pro** or **iPhone 14 Pro** (looks good on recording)
2. Press **Cmd+R** or click the Play button (▶️) to build and run
3. Wait for the app to launch in the simulator (30-60 seconds)

### Step 6: Test Login & Verify Data

**Test User Credentials:**
- Email: `demo@mabel.com`
- Password: `password123`

1. In the simulator, open the app
2. Sign in with the credentials above
3. Verify you can see the test project and chapters
4. Navigate around to familiarize yourself with the flow

### Step 7: Position Simulator for Recording

1. In the simulator menubar: **Window → Physical Size** (Cmd+1)
2. Position the simulator window where you want it on screen
3. Consider: Simulator on left, your webcam on right (Loom default layout)

---

## 🎬 Recording Flow (Demo Script)

### Opening (15 seconds)
**What to say:**
> "Hi! I'm Christiano, and I built Mabel - an AI journaling app that transforms your spoken memories into polished narratives. Let me show you how it works."

**What to show:**
- Landing page at http://localhost:3000
- Briefly scroll to show the value proposition

---

### Part 1: Sign Up / Sign In (30 seconds)

**What to do:**
1. Click "Try Mabel Free" or "Start Free"
2. Click "Sign In" (since we already have a test user)
3. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign In"

**What to say:**
> "Let's sign in. Mabel offers a free tier with your first chapter included."

---

### Part 2: Dashboard Overview (30 seconds)

**What to show:**
- Dashboard showing your project "E2E Test Project"
- Interviewee card (Robert Johnson)

**What to say:**
> "Here's my dashboard. I've started a journaling project about my life experiences. Mabel organizes everything into chapters - you can see I already have a couple completed."

**What to do:**
- Hover over/click the project to show the structure
- Show the chapter list

---

### Part 3: View Completed Chapter (45 seconds)

**What to do:**
1. Click into the project
2. Navigate to "Modules" or "Chapters" view
3. Click on Module 1 or Module 2 to view a completed chapter

**What to show:**
- The chapter page with the AI-generated narrative
- Show the polished writing
- Scroll through to show it's a full story

**What to say:**
> "Here's a completed chapter. I recorded voice responses to questions about my childhood, and Mabel's AI transformed my raw thoughts into this polished, first-person narrative. It keeps my voice but makes it more readable."

---

### Part 4: Start New Module/Chapter (60 seconds)

**What to do:**
1. Go back to modules/dashboard
2. Click "Start New Chapter" or navigate to a new module
3. Show the question interface
4. Either:
   - **Option A (Voice):** Click record, speak for 5-10 seconds answering a question
   - **Option B (Text):** Type a quick response to demonstrate

**What to say:**
> "Starting a new chapter is simple. Mabel asks guided questions, and I can respond by voice or text. Let me record a quick memory..."

*[Record/type response]*

> "Once I submit my responses, Mabel's AI processes them in the background and generates a polished chapter."

---

### Part 5: Show Chapter Generation (30 seconds)

**What to show:**
- Navigate to show the processing state (if available)
- Or show the completed chapter from the seed data

**What to say:**
> "The AI typically takes a minute or two to generate a chapter. Once ready, I can review it, edit if needed, and when I have enough chapters, export everything as a PDF book or even order a narrated audiobook."

---

### Part 6: Export / Future Features (30 seconds)

**What to show:**
- Navigate to export/download options (if available)
- Show the PDF export button or settings

**What to say:**
> "Mabel makes it easy to export your story as a PDF anytime. In the future, I'm adding voice-cloned audiobooks, photo integration, and family sharing features. The goal is to make preserving your life story as easy as having a conversation."

---

### Closing (15 seconds)

**What to say:**
> "That's Mabel - journaling made easy, with AI doing the heavy lifting. Thanks for watching!"

**What to show:**
- Quick return to landing page or contact info

---

## 🎥 Loom Recording Tips

### Before You Record:
1. ✅ Close unnecessary apps/windows (show only simulator)
2. ✅ Turn on Do Not Disturb (to prevent notifications)
3. ✅ Test your microphone
4. ✅ Have the iOS simulator running with app open
5. ✅ Reset simulator to home screen, then open Mabel app
6. ✅ Position simulator window nicely on screen
7. ✅ Hide Xcode window (only show simulator)
8. ✅ Set simulator to "Physical Size" (Window → Physical Size)

### During Recording:
- **Speak clearly and at a moderate pace**
- **Don't worry about perfection** - conversational is good
- **Show, don't just tell** - click through the actual features
- **Keep it under 5 minutes** - demo nights have tight schedules
- **Smile!** Your enthusiasm is contagious

### Loom Settings:
- **Screen + Camera:** Show both simulator screen and webcam
- **Screen selection:** Select the window with iOS Simulator (not entire screen)
- **Recording quality:** 1080p (if available)
- **Frame rate:** 30fps
- **Audio:** Use a good microphone if you have one

### iOS Simulator Recording Tips:
- **Use a modern iPhone simulator** (iPhone 15 Pro or 14 Pro looks professional)
- **Physical Size mode** makes it look like a real phone
- **Hide Xcode** - only show the simulator window
- **Use simulator gestures** - swipe, tap naturally (use your mouse/trackpad)
- **If you mess up**, just close the app in simulator and restart recording

---

## 🐛 Troubleshooting

### "No user found" error when seeding:
```bash
# Run the main seed first
npx prisma db seed

# Then run test project seed
npm run test:seed
```

### Can't log in with test credentials:
Check `prisma/seed.ts` for the actual email/password

### Database issues:
```bash
# Nuclear option: completely reset everything
npx prisma migrate reset --force
npx prisma db seed
npm run test:seed
```

### Server not starting:
```bash
# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

---

## 📝 Quick Reference: Commands

```bash
# Setup sequence:
npx prisma migrate reset --force  # Clean slate
npx prisma db seed               # Create test user
npm run test:seed                # Create test project with chapters
npm run dev                      # Start server

# Alternative: Just seed test data (keeps existing data)
npm run test:seed

# View database:
npm run db:studio
```

---

## ✅ Post-Recording Checklist

- [ ] Watch the recording to ensure everything is clear
- [ ] Trim any awkward pauses or mistakes (Loom has built-in editing)
- [ ] Add a thumbnail if Loom allows
- [ ] Test the Loom link before sharing
- [ ] Add Loom link to your demo materials

---

## 🎯 Key Messages to Emphasize

1. **Problem:** Traditional memoir writing is daunting and time-consuming
2. **Solution:** Mabel makes it as easy as talking - just speak your thoughts
3. **AI Magic:** Transforms raw journal entries into polished narratives
4. **Flexibility:** Journal anytime, no rigid schedules like StoryWorth
5. **Output:** Export PDF books or order narrated audiobooks

---

Good luck with your demo! 🚀

*Need help? Check the console logs or run `npm run db:studio` to inspect the database.*
