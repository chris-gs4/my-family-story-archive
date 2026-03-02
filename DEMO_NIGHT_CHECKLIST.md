# Demo Night Checklist

## 📅 Before Demo Night (Pre-Event)

### Critical Tasks (MUST DO)

- [ ] **Test QR Code on Mobile**
  - [ ] Open http://localhost:3000 on computer
  - [ ] Scan QR code with iPhone
  - [ ] Verify it routes to home page or signup
  - [ ] Test on iOS Safari specifically
  - [ ] If localhost doesn't work remotely, deploy to Vercel and update QR code URL

- [ ] **Rehearse Pitch Script**
  - [ ] Read through DEMO_NIGHT_PITCH_SCRIPT.md
  - [ ] Time yourself with stopwatch (aim for 4:30-4:45)
  - [ ] Memorize the opening 45 seconds
  - [ ] Practice transitions between landing page and iPhone simulator
  - [ ] Rehearse at least 3 times

- [ ] **Test Full Demo Flow End-to-End**
  - [ ] Start dev server: `npm run dev`
  - [ ] Open iPhone simulator with seeded "Grandma Rose" project
  - [ ] Navigate to a new module/chapter
  - [ ] Record a test childhood memory (~60 seconds)
  - [ ] Verify AI processing completes (~1-2 minutes)
  - [ ] Check generated chapter quality
  - [ ] Test PDF download/export
  - [ ] Time the entire flow (should be ~3 minutes)

- [ ] **Prepare Backup Stories**
  - [ ] Write down 2-3 childhood memories to record
  - [ ] Practice speaking them naturally (30-60 seconds each)
  - [ ] Have them printed or on your phone as reference

### Recommended Tasks

- [ ] **Deploy Landing Page to Vercel (if presenting remotely)**
  - [ ] Run `npm run build` to test production build
  - [ ] Deploy to Vercel: `vercel --prod`
  - [ ] Update QR code in src/app/page.tsx to point to production URL
  - [ ] Test QR code with production URL

- [ ] **Prepare Q&A Materials**
  - [ ] Print 2-3 copies of Mabel-Business-Plan.pdf
  - [ ] Have business plan PDF open in browser tab
  - [ ] Review key talking points in DEMO_NIGHT_PITCH_SCRIPT.md
  - [ ] Prepare answers to common questions

- [ ] **Test on Venue Network (if possible)**
  - [ ] Visit venue early and test WiFi
  - [ ] If WiFi is unreliable, prepare to use phone hotspot
  - [ ] Test both landing page and Xcode/simulator on venue network

- [ ] **Create Backup Materials**
  - [ ] Record backup video of demo flow (in case of technical failure)
  - [ ] Print QR code on paper (in case projector fails)
  - [ ] Have screenshots of key screens saved on phone

### Optional Enhancements

- [ ] **Add Demo Night Banner**
  - [ ] Create banner component: "👋 Demo Night Attendees: Get early access"
  - [ ] Add to top of landing page
  - [ ] Bonus: "First 10 signups get early access to voice cloning"

- [ ] **Create Dedicated `/demo` Route**
  - [ ] Simplified landing page for demo night attendees
  - [ ] Prominent QR code
  - [ ] Minimal distractions

---

## 🎒 Day-of Demo Night (What to Bring)

### Equipment

- [ ] **Laptop** (fully charged + charger)
- [ ] **iPhone** (fully charged + charger) - for scanning QR code test
- [ ] **Adapters** (HDMI, USB-C, etc. for projector)
- [ ] **Phone hotspot backup** (in case venue WiFi fails)
- [ ] **Backup battery pack** (just in case)

### Materials

- [ ] **Printed business plan PDFs** (2-3 copies)
- [ ] **Printed QR code** (backup if projector fails)
- [ ] **Printed pitch script** (notes for reference)
- [ ] **Business cards** (if you have them)

### Digital

- [ ] **Xcode project open** with iPhone simulator ready
- [ ] **Dev server running** (`npm run dev`)
- [ ] **Business plan PDF** open in browser tab
- [ ] **Backup demo video** saved locally (if created)
- [ ] **DEMO_NIGHT_PITCH_SCRIPT.md** open for reference

---

## ⏰ 30 Minutes Before Presentation

- [ ] Arrive early to venue
- [ ] Test projector connection with your laptop
- [ ] Test audio (if using speakers for demo)
- [ ] Open all necessary windows:
  - [ ] Landing page (localhost:3000 or production URL)
  - [ ] Xcode with iPhone simulator
  - [ ] Business plan PDF
  - [ ] Pitch script document
- [ ] Test navigation between windows (Cmd+Tab)
- [ ] Verify dev server is running
- [ ] Test QR code one more time
- [ ] Take a deep breath!

---

## 🎤 During Presentation

### Flow

1. [ ] **Intro** (45 seconds)
   - Problem: Memories fade, writing is intimidating
   - Solution: Just talk, Mabel writes
   - Differentiation: Voice-first vs StoryWorth

2. [ ] **Landing Page** (30 seconds)
   - Quick scroll: Hero → How It Works → Problem
   - Point to QR code

3. [ ] **iPhone Demo** (3 minutes)
   - Show seeded project (30s)
   - Live voice recording (60s)
   - Talk during processing (90-120s): tech, economics, vision
   - Show generated chapter (30s)

4. [ ] **Closing** (15 seconds)
   - CTA: Scan QR code
   - Thank audience

### Tips During Presentation

- [ ] Speak slowly and clearly
- [ ] Make eye contact with audience
- [ ] Smile and show enthusiasm
- [ ] If tech fails, stay calm and pivot to backup plan
- [ ] Leave time for Q&A if possible

---

## 🙋 After Presentation

### Immediate

- [ ] Thank attendees for their time
- [ ] Hand out printed business plans to interested people
- [ ] Exchange contact info with potential users/investors
- [ ] Note any feedback or questions you received

### Follow-up

- [ ] Send thank-you emails to instructor and attendees
- [ ] Share landing page link via email/Slack
- [ ] Monitor signups from QR code scans
- [ ] Write down lessons learned for future pitches
- [ ] Update pitch script based on what worked/didn't work

---

## 🚨 Emergency Backup Plans

### If Dev Server Fails

- Use production Vercel URL instead of localhost
- If Vercel is down, show screenshots
- Pivot to storytelling about why you built this

### If iPhone Simulator Fails

- Show pre-recorded demo video
- Walk through screenshots of the app
- Focus more on landing page and business plan

### If Projector Fails

- Hold up printed QR code
- Walk through audience with laptop
- Send landing page link to audience via chat/email

### If Internet Fails

- Use phone hotspot immediately
- Show offline content (screenshots, PDF)
- Shorten demo, extend Q&A

### If You Forget Your Lines

- Take a breath, pause, it's okay
- Reference your printed pitch script
- Speak from the heart about why this matters

---

## ✅ Final Confidence Check

Before you walk on stage, remind yourself:

- ✅ You've built something real and valuable
- ✅ The problem is clear and relatable
- ✅ The solution is elegant and proven (StoryWorth acquisition validates market)
- ✅ The demo works (you've tested it multiple times)
- ✅ The QR code gives audience a clear next step
- ✅ You know your talking points
- ✅ You've prepared for contingencies
- ✅ This is fun! Enjoy the moment.

**You've got this, Chris! 🚀**

---

*Last updated: March 2, 2026*
