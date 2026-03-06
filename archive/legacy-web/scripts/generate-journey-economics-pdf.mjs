#!/usr/bin/env node

/**
 * Generate Demo Night Journey & Unit Economics PDF as a single long page
 * (same format as mabel-landing-page.pdf)
 *
 * Run: node scripts/generate-journey-economics-pdf.mjs
 * Requires: dev server NOT needed — renders self-contained HTML
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BRAND_GREEN = '#2F6F5E';
const BRAND_GREEN_LIGHT = '#F0FAF6';
const DARK_TEXT = '#111827';
const BODY_TEXT = '#333333';
const MUTED_TEXT = '#666666';
const BORDER_COLOR = '#E5E7EB';

function buildHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1200">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: ${BODY_TEXT};
    background: #FFFFFF;
    width: 1200px;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ===== COVER HEADER ===== */
  .cover {
    background: linear-gradient(135deg, ${BRAND_GREEN} 0%, #1a4a3e 100%);
    padding: 80px 80px 60px;
    color: white;
  }
  .cover h1 {
    font-family: 'Comfortaa', sans-serif;
    font-size: 56px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .cover .tagline {
    font-size: 20px;
    opacity: 0.85;
    margin-bottom: 24px;
    font-weight: 400;
  }
  .cover .doc-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .cover .doc-subtitle {
    font-size: 16px;
    opacity: 0.7;
  }

  /* ===== MAIN CONTENT ===== */
  .content {
    padding: 60px 80px 80px;
  }

  /* ===== SECTION DIVIDER ===== */
  .section-divider {
    margin: 56px 0 0;
    padding-top: 48px;
    border-top: 3px solid ${BRAND_GREEN};
  }
  .section-divider:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  /* ===== HEADINGS ===== */
  h2 {
    font-family: 'Comfortaa', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: ${BRAND_GREEN};
    margin-bottom: 28px;
    line-height: 1.2;
  }
  h3 {
    font-size: 22px;
    font-weight: 700;
    color: ${DARK_TEXT};
    margin-top: 32px;
    margin-bottom: 14px;
    line-height: 1.3;
  }
  h4 {
    font-size: 16px;
    font-weight: 700;
    color: ${DARK_TEXT};
    margin-top: 20px;
    margin-bottom: 8px;
  }

  /* ===== BODY TEXT ===== */
  p {
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 14px;
    color: ${BODY_TEXT};
  }
  .lead {
    font-size: 17px;
    line-height: 1.7;
    color: ${BODY_TEXT};
    margin-bottom: 20px;
  }
  strong { color: ${DARK_TEXT}; }

  /* ===== LISTS ===== */
  ul, ol {
    margin: 0 0 16px 0;
    padding-left: 24px;
  }
  li {
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 6px;
    color: ${BODY_TEXT};
  }
  li::marker { color: ${BRAND_GREEN}; }
  li strong { color: ${DARK_TEXT}; }

  /* ===== HIGHLIGHT BOXES ===== */
  .insight-box {
    background: ${BRAND_GREEN_LIGHT};
    border-left: 4px solid ${BRAND_GREEN};
    padding: 20px 24px;
    margin: 20px 0;
    border-radius: 0 8px 8px 0;
  }
  .insight-box .label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${BRAND_GREEN};
    margin-bottom: 6px;
  }
  .insight-box p {
    margin: 0;
    font-size: 15px;
    color: ${BODY_TEXT};
  }

  /* ===== QUOTE BOXES ===== */
  .quote-block {
    background: #F9FAFB;
    border-left: 4px solid ${BRAND_GREEN};
    padding: 20px 24px;
    margin: 16px 0;
    border-radius: 0 8px 8px 0;
  }
  .quote-block .question {
    font-weight: 700;
    color: ${DARK_TEXT};
    margin-bottom: 8px;
    font-size: 15px;
  }
  .quote-block .answer {
    font-style: italic;
    color: ${BODY_TEXT};
    font-size: 15px;
    line-height: 1.7;
  }

  /* ===== TABLES ===== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;
  }
  th {
    background: ${BRAND_GREEN};
    color: white;
    font-weight: 600;
    padding: 12px 16px;
    text-align: left;
  }
  th:first-child { border-radius: 8px 0 0 0; }
  th:last-child { border-radius: 0 8px 0 0; }
  td {
    padding: 11px 16px;
    border-bottom: 1px solid ${BORDER_COLOR};
    color: ${BODY_TEXT};
  }
  tr:nth-child(even) td { background: #F9FAFB; }
  tr:last-child td:first-child { border-radius: 0 0 0 8px; }
  tr:last-child td:last-child { border-radius: 0 0 8px 0; }

  /* ===== PHASE CARDS ===== */
  .phase-card {
    background: #FFFFFF;
    border: 1px solid ${BORDER_COLOR};
    border-radius: 12px;
    padding: 28px 32px;
    margin: 24px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .phase-card h3 {
    margin-top: 0;
    color: ${BRAND_GREEN};
    font-size: 20px;
  }
  .phase-card .label-value {
    margin-bottom: 10px;
  }
  .phase-card .label-value .label {
    font-weight: 700;
    color: ${DARK_TEXT};
  }

  /* ===== CHALLENGE CARDS ===== */
  .challenge {
    margin-bottom: 20px;
  }
  .challenge h4 {
    color: ${BRAND_GREEN};
    margin-bottom: 4px;
  }
  .challenge .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 6px;
  }
  .challenge .pair > div {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
  }
  .challenge .pair .problem {
    background: #FEF2F2;
    border-left: 3px solid #EF4444;
  }
  .challenge .pair .solution {
    background: ${BRAND_GREEN_LIGHT};
    border-left: 3px solid ${BRAND_GREEN};
  }

  /* ===== METRIC CARDS ===== */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 20px 0;
  }
  .metric-card {
    background: #FFFFFF;
    border: 1px solid ${BORDER_COLOR};
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }
  .metric-card .value {
    font-size: 28px;
    font-weight: 700;
    color: ${BRAND_GREEN};
    margin-bottom: 4px;
  }
  .metric-card .label {
    font-size: 13px;
    color: ${MUTED_TEXT};
  }

  /* ===== SCENARIO CARDS ===== */
  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin: 20px 0;
  }
  .scenario-card {
    background: #FFFFFF;
    border: 1px solid ${BORDER_COLOR};
    border-radius: 12px;
    padding: 20px 24px;
  }
  .scenario-card h4 {
    margin-top: 0;
    font-size: 15px;
  }
  .scenario-card .margin-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
  }
  .margin-badge.healthy { background: #DCFCE7; color: #166534; }
  .margin-badge.warning { background: #FEF9C3; color: #854D0E; }
  .margin-badge.danger { background: #FEE2E2; color: #991B1B; }

  /* ===== NUMBERED LIST ===== */
  .numbered-learnings {
    counter-reset: learning;
    list-style: none;
    padding-left: 0;
  }
  .numbered-learnings li {
    counter-increment: learning;
    padding-left: 40px;
    position: relative;
    margin-bottom: 14px;
  }
  .numbered-learnings li::before {
    content: counter(learning);
    position: absolute;
    left: 0;
    top: 2px;
    width: 28px;
    height: 28px;
    background: ${BRAND_GREEN};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
  }

  /* ===== CODE/MONO ===== */
  code {
    background: #F3F4F6;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: ${DARK_TEXT};
  }

  /* ===== FOOTER ===== */
  .footer {
    background: ${BRAND_GREEN};
    padding: 40px 80px;
    color: white;
    text-align: center;
  }
  .footer h2 {
    color: white;
    margin-bottom: 8px;
    font-size: 28px;
  }
  .footer p {
    color: rgba(255,255,255,0.8);
    font-size: 16px;
  }
</style>
</head>
<body>

<!-- ============================================================ -->
<!-- COVER -->
<!-- ============================================================ -->
<div class="cover">
  <h1>Mabel</h1>
  <div class="tagline">Your Stories, Written with Care</div>
  <div class="doc-title">Demo Night: Journey & Unit Economics</div>
  <div class="doc-subtitle">March 2026</div>
</div>

<!-- ============================================================ -->
<!-- CONTENT -->
<!-- ============================================================ -->
<div class="content">

<!-- ===== QUICK PITCH ===== -->
<div class="section-divider" style="border-top:none; padding-top:0; margin-top:0;">
  <h2>Quick Pitch</h2>
  <div class="insight-box">
    <p>"I started with Family Story Archive — a tool to help families interview older generations. But I discovered people didn't want to be interviewers; they wanted to capture <strong>their own</strong> stories.</p>
    <p style="margin-top:12px">So I pivoted to personal voice journaling. But free-form journaling led to abandonment — 'write your life story' felt overwhelming.</p>
    <p style="margin-top:12px">The breakthrough: <strong>module-based storytelling</strong>. Instead of a blank page, users answer 15-20 AI-generated questions per chapter. Voice-first. Mabel transforms spoken memories into polished narratives.</p>
    <p style="margin-top:12px">StoryWorth proved this market with a $100M+ acquisition, but they're still writing-first. <strong>Mabel is voice-first</strong> — that's the unlock. We're 50% cheaper at $4.99/month, and positioning as a 'journaling habit' vs. 'memoir project' opens up a 10x larger market."</p>
  </div>
</div>

<!-- ===== THE EVOLUTION TIMELINE ===== -->
<div class="section-divider">
  <h2>The Evolution Timeline</h2>

  <div class="phase-card">
    <h3>Phase 1: Family Story Archive — January 2026</h3>
    <p class="label-value"><span class="label">Problem:</span> Everyone has a life story worth preserving, but few capture it.</p>
    <p class="label-value"><span class="label">Initial concept:</span> Help families interview and document stories from older generations.</p>
    <h4>Tech foundation established:</h4>
    <ul>
      <li>Next.js + React + TypeScript</li>
      <li>PostgreSQL + Prisma ORM</li>
      <li>NextAuth.js for authentication</li>
      <li>OpenAI for AI-generated questions</li>
      <li>AWS S3 for file storage</li>
      <li>Stripe for payments</li>
      <li>Inngest for background jobs</li>
      <li>Capacitor for iOS native</li>
    </ul>
  </div>

  <div class="phase-card">
    <h3>Phase 2: Audio-First Personal Journaling — Mid-February 2026</h3>
    <p class="label-value"><span class="label">Discovery:</span> The "family interview" format felt intimidating. People wanted to capture <em>their own</em> stories.</p>
    <p class="label-value"><span class="label">Pivot:</span> Repositioned as personal voice journaling app.</p>
    <h4>What I built:</h4>
    <ul>
      <li><code>JournalEntry</code> model with processing pipeline (RECORDING → UPLOADED → PROCESSING → COMPLETE)</li>
      <li>S3 integration with presigned URLs for secure uploads</li>
      <li><strong>Whisper API integration</strong> for audio transcription</li>
      <li><strong>OpenAI integration</strong> for narrative transformation</li>
      <li><code>AudioRecorder</code> component using Web Audio API</li>
      <li>Random prompt suggestions</li>
      <li>Redesigned setup flow for solo journaling</li>
    </ul>
    <div class="insight-box">
      <div class="label">Key Insight</div>
      <p>Shifting from "interview format" to "personal voice journaling" made the product more accessible and emotionally resonant.</p>
    </div>
  </div>

  <div class="phase-card">
    <h3>Phase 3: Module-Based Architecture — Late February 2026</h3>
    <p class="label-value"><span class="label">Discovery:</span> Free-form journaling led to user abandonment. People didn't know what to write about and felt overwhelmed by "write your whole life story."</p>
    <p class="label-value"><span class="label">Solution:</span> <strong>Module-based storytelling</strong> — structure the book into chapters organized by life themes.</p>
    <h4>How it works:</h4>
    <ol>
      <li>Each <strong>module</strong> contains 15-20 AI-generated questions focused on a specific theme</li>
      <li>Users answer questions through voice recording (transcribed → polished)</li>
      <li>AI generates a complete narrative chapter from all answers</li>
      <li>Users can regenerate chapters with feedback</li>
      <li>Once approved, the module is locked and the next begins</li>
    </ol>
    <h4>Database architecture:</h4>
    <ul>
      <li><code>Module</code> table (DRAFT → QUESTIONS_GENERATED → IN_PROGRESS → GENERATING_CHAPTER → CHAPTER_GENERATED → APPROVED)</li>
      <li><code>ModuleQuestion</code> table (voice recording, transcription, narrative)</li>
      <li><code>ModuleChapter</code> table (with versioning for regenerations)</li>
      <li>Job queue for async generation</li>
    </ul>
    <h4>API routes:</h4>
    <ul>
      <li><code>POST /api/projects/:id/modules</code> — Create module & auto-generate questions</li>
      <li><code>PATCH /api/projects/:id/modules/:moduleId/questions/:questionId</code> — Submit voice answer</li>
      <li><code>POST /api/projects/:id/modules/:moduleId/chapter/generate</code> — Generate narrative</li>
      <li><code>POST /api/projects/:id/modules/:moduleId/chapter/regenerate</code> — Regenerate with feedback</li>
      <li><code>POST /api/projects/:id/modules/:moduleId/approve</code> — Lock chapter & advance</li>
    </ul>
    <div class="insight-box">
      <div class="label">Why This Was Transformational</div>
      <p>Users work in manageable "bite-sized" chunks (one module at a time). Prevents overwhelm compared to "write your whole memoir." Context-learning AI analyzes previous responses for smarter follow-ups. Higher completion rates.</p>
    </div>
  </div>

  <div class="phase-card">
    <h3>Phase 4: Rebrand to "Mabel" — Late February 2026</h3>
    <p class="label-value"><span class="label">Discovery:</span> "Family Story Archive" sounded formal and project-based. Positioning as "journaling" felt more accessible.</p>
    <p class="label-value"><span class="label">Solution:</span> Full rebrand to <strong>"Mabel"</strong> with warm pixel-art grandmother mascot.</p>
    <h4>Strategic repositioning:</h4>
    <ul>
      <li>From "preserve family stories" → <strong>"capture your personal life story"</strong></li>
      <li>From "memoir project" → <strong>"journaling habit"</strong></li>
      <li>Family Plan became secondary (gift to loved ones)</li>
      <li>Messaging: "fun, interactive journaling" not "formal memoir writing"</li>
    </ul>
    <h4>Deliverables:</h4>
    <ul>
      <li>Landing page: "Your Stories, Written with Care"</li>
      <li>Business plan PDF for demo night</li>
      <li>Brand assets (logo, mascot, tagline)</li>
      <li>Updated ALL documentation</li>
    </ul>
    <div class="insight-box">
      <div class="label">Key Insight</div>
      <p>Positioning as personal journaling (vs. memoir writing) opened up a much larger addressable market.</p>
    </div>
  </div>

  <div class="phase-card">
    <h3>Phase 5: Journaling-First Landing Page — March 2, 2026</h3>
    <p class="label-value"><span class="label">Discovery:</span> Landing page still felt too "memoir-focused" and didn't clearly differentiate from StoryWorth.</p>
    <p class="label-value"><span class="label">Solution:</span> Complete redesign with <strong>journaling-first positioning</strong>.</p>
    <h4>What changed:</h4>
    <ul>
      <li>New tagline: <strong>"Journal Freely. Share Beautifully."</strong></li>
      <li>Front-loaded problem statement: "raw journal entries are messy and unpublishable"</li>
      <li>Added <strong>StoryWorth comparison table</strong></li>
      <li>Repositioned as <strong>journaling habit</strong> vs. memoir project</li>
      <li>Updated pricing to <strong>$4.99/month (10 chapters) + $49.99/year (unlimited)</strong></li>
      <li>Added QR code with mailto link for demo night audience capture</li>
      <li>Added profile photo and contact info</li>
      <li>Applied gradient background</li>
    </ul>

    <h4>Key differentiators vs. StoryWorth:</h4>
    <table>
      <tr><th>Feature</th><th>Mabel</th><th>StoryWorth</th></tr>
      <tr><td>Mental Model</td><td>Journaling habit</td><td>Memoir project</td></tr>
      <tr><td>Time Commitment</td><td>Journal anytime</td><td>52 weeks, 1 prompt/week</td></tr>
      <tr><td>Input Method</td><td>Voice-first (or text)</td><td>Email prompts → typing</td></tr>
      <tr><td>AI Polish</td><td>Narrative transformation</td><td>Basic formatting</td></tr>
      <tr><td>Pace</td><td>Your schedule</td><td>Weekly deadline</td></tr>
      <tr><td>Output</td><td>Export anytime (PDF/audiobook)</td><td>Hardcover book after 1 year</td></tr>
      <tr><td>Best For</td><td>Active journalers & beginners</td><td>Family gift projects</td></tr>
    </table>

    <div class="insight-box">
      <div class="label">Key Insight</div>
      <p>Mabel says "journal your life, and let AI polish it into something shareable." StoryWorth says "commit to 52 weeks of memoir writing."</p>
    </div>
  </div>
</div>

<!-- ===== KEY CHALLENGES OVERCOME ===== -->
<div class="section-divider">
  <h2>Key Challenges Overcome</h2>

  <div class="challenge">
    <h4>1. Product-Market Fit Evolution</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> Started with "family interview tool" but positioning was too narrow.</div>
      <div class="solution"><strong>Solution:</strong> Pivoted to personal voice journaling → module-based storytelling → journaling habit. Each iteration got closer to genuine product-market fit.</div>
    </div>
  </div>

  <div class="challenge">
    <h4>2. The Overwhelm Problem</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> Free-form journaling led to user abandonment.</div>
      <div class="solution"><strong>Solution:</strong> Module-based architecture broke the task into manageable chunks. Users think in chapters, not "entire memoir."</div>
    </div>
  </div>

  <div class="challenge">
    <h4>3. Voice vs. Writing</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> Most competitors are writing-first. Voice recording felt risky.</div>
      <div class="solution"><strong>Solution:</strong> Voice-first became the competitive advantage. Removing the "blank page" barrier unlocked a larger market.</div>
    </div>
  </div>

  <div class="challenge">
    <h4>4. Integration Complexity</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> Coordinating Whisper, OpenAI, S3, Stripe, Inngest APIs with proper error handling.</div>
      <div class="solution"><strong>Solution:</strong> Built robust async job processing with Inngest. Proper state management ensured reliability.</div>
    </div>
  </div>

  <div class="challenge">
    <h4>5. Context-Learning AI</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> Generic interview questions felt robotic.</div>
      <div class="solution"><strong>Solution:</strong> Each module analyzes previous responses to generate smarter follow-up questions. Required careful prompt engineering.</div>
    </div>
  </div>

  <div class="challenge">
    <h4>6. Multi-Platform Audio</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> iOS requires AAC, web uses WebM. Different recording APIs on each platform.</div>
      <div class="solution"><strong>Solution:</strong> Capacitor Voice Recorder plugin for iOS, MediaRecorder API for web. Backend handles both formats.</div>
    </div>
  </div>

  <div class="challenge">
    <h4>7. Positioning & Messaging</h4>
    <div class="pair">
      <div class="problem"><strong>Challenge:</strong> "Memoir writing" sounds intimidating.</div>
      <div class="solution"><strong>Solution:</strong> Repositioned as "journaling" with Mabel mascot as warm, encouraging companion. Fun over formal.</div>
    </div>
  </div>
</div>

<!-- ===== WHAT I LEARNED ===== -->
<div class="section-divider">
  <h2>What I Learned Through the AI Cohort</h2>
  <ol class="numbered-learnings">
    <li><strong>Product pivots are essential</strong> — Don't fall in love with your first idea. Listen to user signals and iterate.</li>
    <li><strong>Architecture enables product strategy</strong> — The module system wasn't just engineering — it was the key to solving the overwhelm problem.</li>
    <li><strong>AI is a feature, not magic</strong> — Context-learning questions required careful prompt engineering, not just "ask ChatGPT."</li>
    <li><strong>Multi-platform is complex</strong> — Native iOS + web required careful orchestration (different audio formats, APIs, build processes).</li>
    <li><strong>Positioning is everything</strong> — "Journaling habit" > "memoir project" opened up a 10x larger market.</li>
    <li><strong>Demo-driven development</strong> — Keeping landing page and messaging clear throughout helped validate assumptions early.</li>
    <li><strong>Voice-first is differentiated</strong> — Most competitors are still writing-first. Voice removes the biggest barrier (blank page anxiety).</li>
  </ol>
</div>

<!-- ===== CURRENT MVP STATUS ===== -->
<div class="section-divider">
  <h2>Current MVP Status (Ready for Demo)</h2>

  <h3>Core Features Implemented</h3>
  <ul>
    <li><strong>Authentication</strong> — NextAuth.js with email/password and OAuth</li>
    <li><strong>Module-Based Storytelling</strong> — Full workflow from creation → approval</li>
    <li><strong>Voice Recording</strong> — Web (WebM) + iOS native (AAC via Capacitor)</li>
    <li><strong>AI Processing Pipeline:</strong>
      <ul>
        <li>Whisper API for transcription</li>
        <li>OpenAI for question generation (context-aware, learns from previous modules)</li>
        <li>OpenAI for narrative generation (transforms Q&A into polished prose)</li>
      </ul>
    </li>
    <li><strong>Chapter Regeneration</strong> — Users can request revisions with feedback</li>
    <li><strong>PDF Export</strong> — Download individual chapters or compiled books</li>
    <li><strong>Async Job Processing</strong> — Inngest handles long-running tasks</li>
    <li><strong>Dashboard</strong> — View all projects and modules</li>
    <li><strong>Auto-save</strong> — Responses auto-save as users work</li>
  </ul>

  <h3>Platform Support</h3>
  <ul>
    <li>Web (Next.js, fully responsive)</li>
    <li>iOS native (Capacitor shell with native audio)</li>
  </ul>

  <h3>Testing</h3>
  <ul>
    <li>21 unit tests with seed data</li>
    <li>Developer tools UI</li>
    <li>E2E test infrastructure (Playwright)</li>
  </ul>
</div>

<!-- ===== TIMELINE SUMMARY ===== -->
<div class="section-divider">
  <h2>Timeline Summary</h2>
  <table>
    <tr><th>Phase</th><th>Key Change</th><th>Why It Mattered</th></tr>
    <tr><td><strong>Jan 2026</strong></td><td>Family Story Archive MVP</td><td>Validated core tech stack and AI integration</td></tr>
    <tr><td><strong>Mid-Feb</strong></td><td>Audio-first personal journaling</td><td>Shifted from family interview → personal storytelling</td></tr>
    <tr><td><strong>Late Feb</strong></td><td>Module-based architecture</td><td>Solved the overwhelm problem with bite-sized chapters</td></tr>
    <tr><td><strong>Late Feb</strong></td><td>Rebrand to "Mabel"</td><td>Positioned as journaling (accessible) vs. memoir (intimidating)</td></tr>
    <tr><td><strong>Mar 2</strong></td><td>Journaling-first landing page</td><td>Clear differentiation vs. StoryWorth, $4.99 pricing</td></tr>
  </table>
</div>

<!-- ============================================================ -->
<!-- PART 2: UNIT ECONOMICS -->
<!-- ============================================================ -->

<!-- ===== PRICING MODEL ===== -->
<div class="section-divider">
  <h2>Pricing Model</h2>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="value">$0</div>
      <div class="label">Free Tier — First chapter free</div>
    </div>
    <div class="metric-card">
      <div class="value">$4.99</div>
      <div class="label">Starter — /month, up to 10 chapters</div>
    </div>
    <div class="metric-card">
      <div class="value">$49.99</div>
      <div class="label">Annual — /year, unlimited chapters</div>
    </div>
  </div>

  <h3>Free Tier ($0)</h3>
  <ul>
    <li>First chapter free</li>
    <li>Voice & text journaling</li>
    <li>AI narrative polish</li>
    <li>PDF export</li>
  </ul>

  <h3>Starter ($4.99/month)</h3>
  <ul>
    <li>Up to 10 chapters/month</li>
    <li>Voice & text journaling</li>
    <li>AI narrative polish</li>
    <li>PDF export anytime</li>
    <li>Gamification features</li>
    <li>Chapter organization</li>
    <li>Private & secure</li>
  </ul>

  <h3>Annual ($49.99/year — "Best Value")</h3>
  <ul>
    <li>~$4.17/month (save 17%)</li>
    <li><strong>Unlimited chapters</strong></li>
    <li>All Starter features</li>
    <li>Best value for committed users</li>
  </ul>

  <h3>Add-Ons (Available after 10+ chapters)</h3>
  <ul>
    <li><strong>Narrated Audiobook: $29.99</strong> — your story in your AI-cloned voice</li>
    <li><strong>Printed Hardcover: $49.99+</strong> — physical book, professionally bound</li>
  </ul>
</div>

<!-- ===== AI COST BREAKDOWN ===== -->
<div class="section-divider">
  <h2>AI Cost Breakdown (Per Chapter)</h2>

  <table>
    <tr><th>Component</th><th>Details</th><th>Cost</th></tr>
    <tr><td><strong>Whisper API</strong> (Transcription)</td><td>10 questions × 5 min = 50 min @ $0.006/min</td><td>~$0.30</td></tr>
    <tr><td><strong>GPT-4o</strong> (Question Generation)</td><td>Previous chapter context + module theme → 15-20 questions</td><td>~$0.02</td></tr>
    <tr><td><strong>GPT-4o</strong> (Narrative Generation)</td><td>10-15 Q&A pairs → 1000-2000 word narrative chapter</td><td>~$0.15</td></tr>
    <tr><td colspan="2" style="text-align:right; font-weight:700;">Total AI Cost Per Chapter</td><td style="font-weight:700; color:${BRAND_GREEN};">~$0.47</td></tr>
  </table>

  <p style="font-size:13px; color:${MUTED_TEXT}; font-style:italic;">Note: Original estimate was $0.19. After accounting for longer audio recordings and narrative generation, real cost is closer to $0.47 per chapter.</p>
</div>

<!-- ===== GROSS MARGIN ANALYSIS ===== -->
<div class="section-divider">
  <h2>Gross Margin Analysis</h2>

  <div class="scenario-grid">
    <div class="scenario-card">
      <h4>Scenario 1: Light User (1 chapter/month, Starter)</h4>
      <p>Revenue: $4.99 &nbsp;|&nbsp; AI Cost: $0.47 &nbsp;|&nbsp; Gross Profit: $4.52</p>
      <span class="margin-badge healthy">91% Gross Margin</span>
    </div>
    <div class="scenario-card">
      <h4>Scenario 2: Moderate User (3 chapters/month, Starter)</h4>
      <p>Revenue: $4.99 &nbsp;|&nbsp; AI Cost: $1.41 &nbsp;|&nbsp; Gross Profit: $3.58</p>
      <span class="margin-badge healthy">72% Gross Margin</span>
    </div>
    <div class="scenario-card">
      <h4>Scenario 3: Heavy User (10 chapters/month, Starter — at cap)</h4>
      <p>Revenue: $4.99 &nbsp;|&nbsp; AI Cost: $4.70 &nbsp;|&nbsp; Gross Profit: $0.29</p>
      <span class="margin-badge warning">6% Gross Margin</span>
    </div>
    <div class="scenario-card">
      <h4>Scenario 4: Annual User (15 chapters/month, unlimited)</h4>
      <p>Revenue: $4.17/mo &nbsp;|&nbsp; AI Cost: $7.05 &nbsp;|&nbsp; Gross Profit: -$2.88</p>
      <span class="margin-badge danger">-69% Gross Margin</span>
    </div>
  </div>

  <div class="insight-box">
    <div class="label">Key Insight</div>
    <p>The 10-chapter cap on Starter tier protects margins. Annual unlimited pricing is a calculated risk — betting most users won't exceed 10 chapters/month. If they do, you lose money, but you gain upfront cash and higher retention.</p>
  </div>
</div>

<!-- ===== BREAK-EVEN ANALYSIS ===== -->
<div class="section-divider">
  <h2>Break-Even Analysis</h2>

  <h3>At $4.99/month (Starter tier):</h3>
  <ul>
    <li><strong>Break-even point:</strong> 10.6 chapters/month</li>
    <li><strong>Strategy:</strong> 10-chapter cap protects from losses</li>
    <li><strong>Bet:</strong> Most journalers won't hit 10 chapters/month (that's 2-3 entries/week, which is ambitious)</li>
  </ul>

  <h3>At $49.99/year (Annual tier):</h3>
  <ul>
    <li><strong>Break-even point:</strong> ~12 chapters/month average over the year</li>
    <li><strong>Strategy:</strong> Unlimited feels generous, encourages annual commitment</li>
    <li><strong>Bet:</strong> Most annual users will average &lt;10 chapters/month</li>
    <li><strong>Risk:</strong> Power users who consistently do 15+ chapters/month will be unprofitable</li>
  </ul>
</div>

<!-- ===== ADD-ON ECONOMICS ===== -->
<div class="section-divider">
  <h2>Add-On Economics (High Margin)</h2>

  <div class="scenario-grid">
    <div class="scenario-card">
      <h4>Narrated Audiobook ($29.99)</h4>
      <p>AI Cost (ElevenLabs voice cloning + generation): ~$5-8</p>
      <p>Requirement: 10+ chapters</p>
      <span class="margin-badge healthy">70-80% Gross Margin</span>
    </div>
    <div class="scenario-card">
      <h4>Printed Hardcover ($49.99+)</h4>
      <p>Print Cost (Blurb/Lulu): ~$15-25 (depending on page count)</p>
      <p>Requirement: 10+ chapters</p>
      <span class="margin-badge healthy">50-70% Gross Margin</span>
    </div>
  </div>

  <div class="insight-box">
    <div class="label">Key Insight</div>
    <p>Add-ons are where you make real money. The subscription gets users hooked; the add-ons monetize commitment.</p>
  </div>
</div>

<!-- ===== COMPETITIVE PRICING ===== -->
<div class="section-divider">
  <h2>Competitive Pricing Comparison</h2>

  <table>
    <tr><th>Service</th><th>Price</th><th>Model</th><th>Mabel's Advantage</th></tr>
    <tr><td><strong>StoryWorth</strong></td><td>$99/year (~$8.25/mo)</td><td>52 prompts, 1 book/year</td><td>50% cheaper</td></tr>
    <tr><td><strong>Remento</strong></td><td>$10-15/month</td><td>Unlimited voice + book</td><td>50-70% cheaper</td></tr>
    <tr><td><strong>Day One Premium</strong></td><td>$2.99/month</td><td>Journaling (no AI)</td><td>AI narrative polish</td></tr>
    <tr><td><strong>Notion AI</strong></td><td>$10/month</td><td>AI writing assistant</td><td>Journaling-specific</td></tr>
    <tr><td><strong>Otter.ai</strong></td><td>$8.33/month</td><td>Transcription only</td><td>Generates narrative</td></tr>
  </table>

  <div class="insight-box">
    <div class="label">Positioning</div>
    <p>Most affordable AI-powered journaling-to-book tool. Undercutting StoryWorth (market leader) by 50% while offering voice-first (they're still writing-first).</p>
  </div>
</div>

<!-- ===== STRATEGIC PRICING RATIONALE ===== -->
<div class="section-divider">
  <h2>Strategic Pricing Rationale</h2>

  <h3>Why $4.99/month works:</h3>
  <ol>
    <li><strong>Lower barrier to entry</strong> → higher conversion from free tier</li>
    <li><strong>Competitive advantage</strong> → undercut StoryWorth and Remento significantly</li>
    <li><strong>Land grab strategy</strong> → capture users early, upsell to add-ons later</li>
    <li><strong>Psychological pricing</strong> → "$4.99" feels like impulse buy vs. "$9.99" requires consideration</li>
    <li><strong>Sustainable if usage is moderate</strong> → most users won't hit 10 chapters/month</li>
  </ol>

  <h3>Risks of $4.99/month:</h3>
  <ol>
    <li>Lower revenue per user → harder to reach profitability quickly</li>
    <li>Risk of power users → need strict 10-chapter cap or you lose money</li>
    <li>Perceived value → "too cheap = low quality?" (some users trust higher prices)</li>
    <li>Hard to raise later → grandfathered users will resist price increases</li>
  </ol>

  <h3>Why $49.99/year works:</h3>
  <ol>
    <li><strong>Upfront cash</strong> → improves runway and cash flow</li>
    <li><strong>Higher commitment</strong> → annual users are stickier, higher LTV</li>
    <li><strong>Feels generous</strong> → "unlimited" sounds premium</li>
    <li><strong>Calculated risk</strong> → betting most users average &lt;12 chapters/month over a year</li>
  </ol>
</div>

<!-- ===== REVENUE PROJECTION ===== -->
<div class="section-divider">
  <h2>Revenue Projection: 10,000 Paying Users at Scale</h2>

  <h3>User Mix Assumption</h3>
  <ul>
    <li><strong>60%</strong> on Starter ($4.99/month) — Light users (1-3 chapters/month avg)</li>
    <li><strong>30%</strong> on Annual ($49.99/year) — Moderate users (5-8 chapters/month avg)</li>
    <li><strong>10%</strong> on Starter with Add-ons — Heavy users (8-10 chapters/month + audiobook/hardcover)</li>
  </ul>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="value">$45K</div>
      <div class="label">Monthly Recurring Revenue</div>
    </div>
    <div class="metric-card">
      <div class="value">$19.7K</div>
      <div class="label">Monthly AI Cost</div>
    </div>
    <div class="metric-card">
      <div class="value">56%</div>
      <div class="label">Gross Margin</div>
    </div>
  </div>

  <h3>Monthly Recurring Revenue (MRR) Breakdown</h3>
  <table>
    <tr><th>Segment</th><th>Users</th><th>Rate</th><th>MRR</th></tr>
    <tr><td>Starter users</td><td>6,000</td><td>$4.99/mo</td><td><strong>$29,940</strong></td></tr>
    <tr><td>Annual users</td><td>3,000</td><td>$4.17/mo</td><td><strong>$12,510</strong></td></tr>
    <tr><td>Add-on revenue (10% buy audiobook)</td><td>1,000</td><td>$29.99 ÷ 12</td><td><strong>$2,499</strong></td></tr>
    <tr><td colspan="3" style="text-align:right; font-weight:700;">Total MRR</td><td style="font-weight:700; color:${BRAND_GREEN};">~$45,000</td></tr>
  </table>

  <h3>Operating Costs (Estimated)</h3>
  <table>
    <tr><th>Category</th><th>Monthly Cost</th></tr>
    <tr><td>Hosting (Vercel, Neon DB, S3)</td><td>~$500</td></tr>
    <tr><td>Stripe fees (2.9% + $0.30)</td><td>~$1,350</td></tr>
    <tr><td>Customer support</td><td>~$2,000</td></tr>
    <tr><td>Marketing</td><td>~$5,000</td></tr>
    <tr><td>Salaries (1-2 people)</td><td>~$10,000</td></tr>
    <tr><td style="text-align:right; font-weight:700;">Total OpEx</td><td style="font-weight:700;">~$18,850</td></tr>
  </table>

  <h3>Net Profit</h3>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="value">$25.3K</div>
      <div class="label">Monthly Gross Profit</div>
    </div>
    <div class="metric-card">
      <div class="value">$18.9K</div>
      <div class="label">Monthly Operating Costs</div>
    </div>
    <div class="metric-card">
      <div class="value">$6.4K</div>
      <div class="label">Monthly Net Profit (~$77K/yr)</div>
    </div>
  </div>

  <div class="insight-box">
    <div class="label">Key Insight</div>
    <p>At 10,000 users with current pricing, you can be profitable with a lean team. The real upside comes from add-on sales and Family Plan (future).</p>
  </div>
</div>

<!-- ===== DEMO NIGHT Q&A ===== -->
<div class="section-divider">
  <h2>Demo Night Q&A Responses</h2>

  <div class="quote-block">
    <div class="question">"Why is Mabel so much cheaper than StoryWorth?"</div>
    <div class="answer">"We're 50% cheaper because we're voice-first and AI-powered. StoryWorth still relies on manual curation and printing. Our costs are purely AI (Whisper + GPT-4o), which scale efficiently. We make money on high-margin add-ons like audiobooks and hardcovers once users are hooked."</div>
  </div>

  <div class="quote-block">
    <div class="question">"What's your AI cost per chapter?"</div>
    <div class="answer">"About 47 cents per chapter using Whisper for transcription and GPT-4o for narrative generation. An 8-chapter book costs ~$3.76 in AI. At $4.99/month for 10 chapters, we maintain a 60-90% gross margin depending on usage."</div>
  </div>

  <div class="quote-block">
    <div class="question">"What if users abuse unlimited annual plan?"</div>
    <div class="answer">"We're betting most journalers won't exceed 10-12 chapters/month average. That's 2-3 entries per week, which is ambitious. Annual commitment also means we get cash upfront, which improves runway. If power users emerge, we can introduce a 'Pro' tier at $9.99/month for truly unlimited."</div>
  </div>

  <div class="quote-block">
    <div class="question">"How do you make money long-term?"</div>
    <div class="answer">"Three revenue streams: (1) Subscription base at $4.99-49.99, (2) High-margin add-ons like audiobooks ($29.99) and hardcovers ($49.99+), and (3) Future Family Plan at $19.99/month for gifting to multiple family members. Add-ons are 70-80% margin — that's where real profitability comes from."</div>
  </div>

  <div class="quote-block">
    <div class="question">"What's your unit economics target?"</div>
    <div class="answer">"We target 60-85% gross margin on subscriptions and 70-80% on add-ons. At scale with 10,000 paying users, we'd have ~$45K MRR with ~$25K gross profit. Operating costs would be covered by add-on sales and Family Plan upsells."</div>
  </div>

  <div class="quote-block">
    <div class="question">"How do you defend against competition?"</div>
    <div class="answer">"Three moats: (1) Context-learning AI — each chapter learns from previous ones, producing smarter questions. That's proprietary tech. (2) Voice-first positioning — most competitors are still writing-first. We own the 'blank page anxiety' solution. (3) Land grab pricing — at $4.99/month, we're capturing market share before competitors can react."</div>
  </div>

  <div class="quote-block">
    <div class="question">"What's your customer acquisition cost (CAC) assumption?"</div>
    <div class="answer">"Early stage, targeting $10-20 CAC through organic and paid. With $4.99/month pricing and 70% annual retention, LTV is ~$42. That's a 2-3x LTV:CAC ratio, which is healthy. Once we add high-margin add-ons, LTV jumps to $60-80."</div>
  </div>

  <div class="quote-block">
    <div class="question">"What's your churn assumption?"</div>
    <div class="answer">"Targeting 30% annual churn, which is standard for consumer subscription apps. Key retention drivers: (1) Sunk cost — once you've recorded 5+ chapters, you're invested. (2) Habit formation — gamification keeps users coming back. (3) Emotional lock-in — your life story is irreplaceable."</div>
  </div>
</div>

<!-- ===== SUMMARY: THE PRICING BET ===== -->
<div class="section-divider">
  <h2>Summary: The Pricing Bet</h2>

  <p class="lead">You're making a <strong>calculated land grab play</strong>:</p>
  <ol>
    <li><strong>Undercut the market</strong> by 50% to capture users from StoryWorth</li>
    <li><strong>Free tier</strong> hooks users (first chapter free)</li>
    <li><strong>$4.99 Starter tier</strong> converts free users (10-chapter cap protects margins)</li>
    <li><strong>$49.99 Annual tier</strong> locks in committed users (upfront cash, bet they won't abuse unlimited)</li>
    <li><strong>Add-ons</strong> are the profit engine (70-80% margins on audiobooks/hardcovers)</li>
  </ol>

  <div class="insight-box">
    <div class="label">The Risk</div>
    <p>Power users on Annual plan could be unprofitable.</p>
  </div>

  <div class="insight-box">
    <div class="label">The Mitigation</div>
    <p>Strict 10-chapter cap on Starter, and betting most Annual users average &lt;12 chapters/month.</p>
  </div>

  <div class="insight-box" style="background: ${BRAND_GREEN}; border-color: ${BRAND_GREEN};">
    <div class="label" style="color: rgba(255,255,255,0.8);">For Demo Night</div>
    <p style="color: white; font-weight: 600;">Position this as strategic aggressive pricing to capture market share from StoryWorth while maintaining healthy 60-85% margins.</p>
  </div>
</div>

<!-- ===== KEY METRICS DASHBOARD ===== -->
<div class="section-divider">
  <h2>Key Metrics Dashboard (At Scale: 10K Users)</h2>

  <table>
    <tr><th>Metric</th><th>Value</th><th>Notes</th></tr>
    <tr><td><strong>MRR</strong></td><td>$45,000</td><td>60% Starter, 30% Annual, 10% Add-ons</td></tr>
    <tr><td><strong>AI Cost</strong></td><td>$19,740</td><td>~$0.47 per chapter</td></tr>
    <tr><td><strong>Gross Margin</strong></td><td>56%</td><td>Target: 60-85% as user mix optimizes</td></tr>
    <tr><td><strong>Operating Costs</strong></td><td>$18,850</td><td>Hosting, Stripe, support, marketing, salaries</td></tr>
    <tr><td><strong>Net Profit</strong></td><td>$6,410/mo</td><td>~$77K/year at 10K users</td></tr>
    <tr><td><strong>CAC</strong></td><td>$10-20</td><td>Organic + paid marketing</td></tr>
    <tr><td><strong>LTV</strong></td><td>$42 (base)</td><td>$60-80 with add-ons</td></tr>
    <tr><td><strong>LTV:CAC</strong></td><td>2-3x</td><td>Healthy for consumer SaaS</td></tr>
    <tr><td><strong>Annual Churn</strong></td><td>30%</td><td>Industry standard</td></tr>
    <tr><td><strong>Break-Even Users</strong></td><td>~5,000</td><td>With current cost structure</td></tr>
  </table>
</div>

<!-- ===== WHAT SUCCESS LOOKS LIKE ===== -->
<div class="section-divider">
  <h2>What Success Looks Like</h2>

  <div class="scenario-grid" style="grid-template-columns: repeat(3, 1fr);">
    <div class="scenario-card">
      <h4>Year 1 Goals</h4>
      <ul>
        <li>1,000 paying users</li>
        <li>$5K MRR</li>
        <li>10% month-over-month growth</li>
        <li>Validate pricing and retention</li>
      </ul>
    </div>
    <div class="scenario-card">
      <h4>Year 2 Goals</h4>
      <ul>
        <li>10,000 paying users</li>
        <li>$45K MRR</li>
        <li>Profitable with lean team</li>
        <li>Launch Family Plan and add-ons</li>
        <li>Expand to Android</li>
      </ul>
    </div>
    <div class="scenario-card">
      <h4>Year 3 Goals</h4>
      <ul>
        <li>50,000 paying users</li>
        <li>$225K MRR</li>
        <li>Raise Series A or remain bootstrapped</li>
        <li>International expansion</li>
        <li>Voice-cloned audiobook at scale</li>
      </ul>
    </div>
  </div>

  <div class="insight-box" style="background: ${BRAND_GREEN}; border-color: ${BRAND_GREEN}; margin-top: 32px;">
    <div class="label" style="color: rgba(255,255,255,0.8);">The Vision</div>
    <p style="color: white; font-weight: 600;">Become the default tool for personal journaling-to-book. Own the "voice-first life story" category before StoryWorth can pivot.</p>
  </div>
</div>

</div><!-- end .content -->

<!-- ===== FOOTER ===== -->
<div class="footer">
  <h2>Mabel</h2>
  <p>Your Stories, Written with Care</p>
</div>

</body>
</html>`;
}

async function generatePDF() {
  console.log('Starting PDF generation...');

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    const html = buildHTML();
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Wait for fonts to load
    await page.waitForFunction(() => document.fonts.ready.then(() => true), { timeout: 10000 }).catch(() => {
      console.log('Font loading timed out, proceeding anyway');
    });
    await page.waitForTimeout(2000);

    console.log('Content ready');

    // Get the full page height
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Page height: ${bodyHeight}px`);

    const pdfPath = join(projectRoot, 'Demo-Night-Journey-Economics.pdf');

    await page.pdf({
      path: pdfPath,
      width: '1200px',
      height: `${bodyHeight}px`,
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      pageRanges: '1',
    });

    console.log(`PDF generated: ${pdfPath}`);
    return pdfPath;
  } finally {
    await browser.close();
  }
}

generatePDF()
  .then((path) => {
    console.log(`\nDone! PDF is at: ${path}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error.message);
    process.exit(1);
  });
