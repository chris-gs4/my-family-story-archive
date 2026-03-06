/**
 * Generate Mabel Business Plan PDF
 * Run: npx tsx scripts/generate-business-plan-pdf.ts
 */

import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

const BRAND_GREEN = '#2F6F5E';
const DARK_TEXT = '#111827';
const BODY_TEXT = '#333333';
const MUTED_TEXT = '#666666';
const LIGHT_BG = '#F0FAF6';

function generateBusinessPlanPDF() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Helper: check if we need a new page
  function checkPage(needed: number) {
    if (y + needed > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
  }

  // Helper: add section title
  function sectionTitle(text: string) {
    checkPage(20);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(BRAND_GREEN);
    doc.text(text, margin, y);
    y += 3;
    // Underline
    doc.setDrawColor(BRAND_GREEN);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;
  }

  // Helper: add subsection title
  function subTitle(text: string) {
    checkPage(15);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(DARK_TEXT);
    doc.text(text, margin, y);
    y += 7;
  }

  // Helper: add body text
  function bodyText(text: string, indent: number = 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(BODY_TEXT);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkPage(6);
      doc.text(line, margin + indent, y);
      y += 5.5;
    }
    y += 2;
  }

  // Helper: add bullet point
  function bullet(text: string, indent: number = 5) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(BODY_TEXT);
    const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
    checkPage(6);
    doc.setTextColor(BRAND_GREEN);
    doc.text('•', margin + indent, y);
    doc.setTextColor(BODY_TEXT);
    doc.text(lines[0], margin + indent + 5, y);
    y += 5.5;
    for (let i = 1; i < lines.length; i++) {
      checkPage(6);
      doc.text(lines[i], margin + indent + 5, y);
      y += 5.5;
    }
  }

  // Helper: add highlighted box
  function highlightBox(title: string, text: string) {
    const lines = doc.splitTextToSize(text, contentWidth - 16);
    const boxHeight = 12 + lines.length * 5.5;
    checkPage(boxHeight + 5);
    doc.setFillColor(240, 250, 246); // Light green
    doc.setDrawColor(BRAND_GREEN);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 2, contentWidth, boxHeight, 3, 3, 'FD');
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(BRAND_GREEN);
    doc.text(title, margin + 8, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(BODY_TEXT);
    for (const line of lines) {
      doc.text(line, margin + 8, y);
      y += 5.5;
    }
    y += 5;
  }

  // ================================================================
  // COVER PAGE
  // ================================================================
  // Green header bar
  doc.setFillColor(47, 111, 94);
  doc.rect(0, 0, pageWidth, 100, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(42);
  doc.setTextColor('#FFFFFF');
  doc.text('Mabel', pageWidth / 2, 55, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('Your Stories, Written with Care', pageWidth / 2, 68, { align: 'center' });

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor('#c8e6de');
  doc.text('Business Plan & Product Vision', pageWidth / 2, 82, { align: 'center' });

  // Middle content
  y = 125;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(BODY_TEXT);
  const coverDesc = 'An AI-powered voice journaling app that helps people capture their life stories — one spoken chapter at a time — and transforms them into beautifully written books.';
  const coverLines = doc.splitTextToSize(coverDesc, 140);
  for (const line of coverLines) {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 7;
  }

  // Key stats
  y = 175;
  const stats = [
    ['Platform', 'iOS + Web'],
    ['Stage', 'MVP (Functional Prototype)'],
    ['AI Stack', 'GPT-4o + Whisper + DALL-E 3'],
    ['Date', 'March 2026'],
  ];

  for (const [label, value] of stats) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(BRAND_GREEN);
    doc.text(label, 55, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BODY_TEXT);
    doc.text(value, 95, y);
    y += 8;
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(MUTED_TEXT);
  doc.text('Confidential', pageWidth / 2, 275, { align: 'center' });

  // ================================================================
  // PAGE 2: THE PROBLEM & OPPORTUNITY
  // ================================================================
  doc.addPage();
  y = margin;

  sectionTitle('The Problem & Opportunity');

  bodyText('Everyone carries a lifetime of stories — childhood memories, lessons learned, moments that shaped who they are. But those memories fade if we don\'t capture them. Most people never write their autobiography. Not because their story isn\'t worth telling, but because the process is too hard.');

  subTitle('Why Stories Get Lost');
  bullet('Writing is intimidating — most people don\'t consider themselves writers');
  bullet('Traditional interviews require scheduling, equipment, and interviewing skills');
  bullet('The blank page problem — people don\'t know where to start');
  bullet('Existing tools are fragmented: record here, transcribe there, edit somewhere else');
  bullet('Time pressure — it feels like a massive project that never gets started');

  subTitle('The Market Opportunity');
  bodyText('The global memoir and personal history market is growing rapidly, driven by aging populations and increasing interest in genealogy. StoryWorth (the closest competitor) was acquired for a reported $100M+ with a simple email-based Q&A model. Mabel represents the next evolution: voice-first, AI-powered, and designed for the mobile generation.');

  highlightBox('Key Insight', 'People love to TALK about their memories. They just don\'t like to WRITE about them. Mabel bridges that gap — you speak, the AI writes.');

  // ================================================================
  // PAGE 3: THE SOLUTION
  // ================================================================
  sectionTitle('The Solution: Mabel');

  bodyText('Mabel is a voice-first journaling app that captures your life story through guided conversation. The AI asks thoughtful questions about each chapter of your life, you answer by simply talking, and Mabel transforms your spoken words into polished written narrative. Chapter by chapter, your life story becomes a book.');

  subTitle('Core Experience');
  bullet('Open the app, tap record, and answer a question about your life');
  bullet('Mabel transcribes your voice and polishes it into first-person narrative prose');
  bullet('Each set of answers becomes a chapter (childhood, school, career, love, etc.)');
  bullet('Review, give feedback, regenerate until it reads just right');
  bullet('Approved chapters compile into a PDF book with AI-generated illustrations');

  subTitle('The Mabel Character');
  bodyText('Mabel is more than an app — she\'s a character. A warm, pixel-art grandmother who sits in her armchair with a quill pen, ready to listen. She\'s the guide through the storytelling process, making it feel less like "using an app" and more like sitting down with someone who genuinely wants to hear your story.');

  highlightBox('Design Philosophy', 'Mabel should feel like a conversation with a caring, curious friend — not like filling out a form. The mascot, the warm UI, the guided questions, and the typewriter animation during recording all contribute to an experience that\'s emotionally resonant, not transactional.');

  subTitle('Gamification & Engagement');
  bodyText('We\'re designing Mabel to make memory-capturing feel fun and rewarding, not like a chore:');
  bullet('Chapter completion celebrations — Mabel reacts when you finish a chapter');
  bullet('Memory streak tracking — keep your journaling momentum going');
  bullet('Story progress visualization — watch your book grow chapter by chapter');
  bullet('Surprise prompts — Mabel surfaces unexpected, delightful questions that unlock forgotten memories');
  bullet('Shareable milestones — "I just completed Chapter 5 of my life story!"');
  bullet('The core reframe: this isn\'t "writing a book" — it\'s a tool that helps you re-access your memories in a fun, guided way');

  // ================================================================
  // HOW IT WORKS (DETAILED)
  // ================================================================
  sectionTitle('How It Works');

  subTitle('Step 1: Setup');
  bodyText('Create a project and tell Mabel a bit about yourself — your name, what decade you were born in, and what life themes you want to explore. This helps the AI generate relevant, personalized questions.');

  subTitle('Step 2: Voice Recording');
  bodyText('Mabel presents a question (e.g., "What is your earliest memory?"). You tap the mic button and speak your answer naturally. While you talk, a typewriter animation plays — your words appearing on screen as if being written in real time. When you stop, Mabel processes your recording.');

  subTitle('Step 3: AI Processing Pipeline');
  bullet('Whisper API transcribes your voice recording to text');
  bullet('GPT-4o transforms the raw transcript into polished first-person narrative');
  bullet('The result appears as a "memory card" — a beautifully formatted snippet of your story');
  bullet('Processing happens in seconds, giving near-instant feedback');

  subTitle('Step 4: Chapter Generation');
  bodyText('After answering enough questions (50% minimum), you tap "Generate Chapter." The AI weaves all your memory cards into a cohesive narrative chapter — with proper pacing, transitions, and emotional arc. You can regenerate with specific feedback ("make it warmer," "add more detail about the house").');

  subTitle('Step 5: Book Compilation');
  bodyText('Approved chapters compile into a PDF book with a title page, table of contents, and AI-generated sketch illustrations for each chapter. The result is a keepsake that can be printed, shared, or gifted.');

  // ================================================================
  // WHAT MAKES MABEL DIFFERENT
  // ================================================================
  sectionTitle('What Makes Mabel Different');

  const differentiators = [
    ['Voice-First', 'While competitors use email-based Q&A (StoryWorth) or require typing, Mabel is built around speaking. This is more natural, captures more detail (people talk 3-4x more than they write), and removes the biggest barrier to starting.'],
    ['Context-Learning AI', 'Each chapter builds on the last. Module 2\'s questions reference details from Module 1 ("You mentioned growing up on a farm in Iowa..."). This creates richer, more connected stories than any static question list.'],
    ['Real-Time Feedback', 'Memory cards appear within seconds of recording. You see your story taking shape immediately, which is deeply motivating. No waiting days for a chapter — it\'s nearly instant.'],
    ['Mabel the Character', 'The warm grandmother mascot transforms a utility into an experience. Mabel isn\'t just software — she\'s a companion in the storytelling journey.'],
    ['Chapter-by-Chapter', 'No overwhelming 3-hour interviews. Small, completable sessions (15-20 minutes per chapter) that respect people\'s time and energy.'],
  ];

  for (const [title, desc] of differentiators) {
    subTitle(title);
    bodyText(desc);
  }

  // ================================================================
  // ROADMAP
  // ================================================================
  sectionTitle('Product Roadmap');

  subTitle('Phase 1: MVP (Current — Q1 2026)');
  bullet('Guided voice journaling with AI-generated questions');
  bullet('Automatic transcription (Whisper) and narrative generation (GPT-4o)');
  bullet('Module-based chapter building at your own pace');
  bullet('Memory cards with real-time processing states');
  bullet('Chapter review, regeneration with feedback, and approval');
  bullet('PDF book compilation with AI-generated illustrations (DALL-E 3)');
  bullet('iOS native app via Capacitor + web app');

  subTitle('Phase 2: Richer Storytelling (Q2-Q3 2026)');
  bullet('Photo integration — embed photos into chapters and the final book');
  bullet('Voice-cloned audiobook — hear your book narrated in your own voice (ElevenLabs)');
  bullet('Family Plan — gift Mabel to loved ones at a discounted rate');
  bullet('Family archive — multiple people\'s stories in one shared collection');
  bullet('Gamification v2 — streaks, achievements, memory unlocks');
  bullet('Push notifications with gentle prompts ("Mabel has a question for you today")');

  subTitle('Phase 3: The Story Ecosystem (2027+)');
  bullet('Video story capture — record visual memories alongside voice');
  bullet('Multi-language support — tell your story in any language');
  bullet('Printed hardcover book ordering — professional printing on demand');
  bullet('Collaborative editing — family members contribute to the same story');
  bullet('Family tree connections — link stories across generations');
  bullet('Genealogy platform integration (Ancestry, FamilySearch)');
  bullet('White-label API for professional biographers and memoir services');

  // ================================================================
  // BUSINESS MODEL
  // ================================================================
  sectionTitle('Business Model');

  subTitle('Revenue Streams');
  bullet('Freemium: First chapter free, full book requires subscription');
  bullet('Individual Plan ($9.99/month or $79.99/year): Unlimited chapters, PDF export, illustrations');
  bullet('Family Plan ($19.99/month): Up to 5 family members, shared archive, discounted gifting');
  bullet('Premium add-ons: Voice-cloned audiobook ($29.99), printed hardcover ($49.99+), rush processing');
  bullet('Gift cards: One-time purchase for someone else\'s story ($99.99 for a full book)');

  subTitle('Unit Economics (Target)');
  bullet('AI cost per chapter: ~$0.15 (GPT-4o-mini) + $0.04 (DALL-E illustration) = ~$0.19');
  bullet('AI cost per book (8 chapters): ~$1.52');
  bullet('Voice-cloned audiobook: ~$2-5 per book (ElevenLabs)');
  bullet('Target gross margin: 85%+');

  subTitle('Go-to-Market');
  bullet('Launch with AI/tech community (demo nights, Product Hunt)');
  bullet('Content marketing: "How I wrote my autobiography in 30 days using AI"');
  bullet('Partnership with genealogy communities and family history groups');
  bullet('Gift-driven virality: every completed book is a marketing artifact');
  bullet('Milestone celebrations designed for social sharing');

  // ================================================================
  // TECH STACK
  // ================================================================
  sectionTitle('Technical Architecture');

  subTitle('Frontend');
  bullet('Next.js 14 + React 18 + TypeScript');
  bullet('Tailwind CSS + shadcn/ui component library');
  bullet('Capacitor for iOS native shell (wraps web app)');
  bullet('capacitor-voice-recorder for native AAC audio recording');

  subTitle('Backend');
  bullet('Next.js API Routes (serverless)');
  bullet('PostgreSQL (Neon) with Prisma ORM');
  bullet('NextAuth.js for authentication');
  bullet('Inngest for background job processing');
  bullet('AWS S3 for audio file storage');

  subTitle('AI Pipeline');
  bullet('OpenAI Whisper API — voice-to-text transcription');
  bullet('OpenAI GPT-4o-mini — question generation, narrative writing, polishing');
  bullet('OpenAI DALL-E 3 — chapter illustration generation');
  bullet('ElevenLabs (Phase 2) — voice cloning and audiobook narration');

  subTitle('Deployment');
  bullet('Vercel for hosting and CI/CD');
  bullet('Neon for serverless PostgreSQL');
  bullet('Sentry for error monitoring');

  // ================================================================
  // COMPETITIVE LANDSCAPE
  // ================================================================
  sectionTitle('Competitive Landscape');

  bodyText('The personal storytelling space has several players, but none combine voice-first input, AI narrative generation, and a character-driven experience:');
  y += 3;

  const competitors = [
    ['StoryWorth', 'Email-based weekly questions. Text-only. No AI writing. $99/year. Acquired for ~$100M+. Proves market demand but dated UX.'],
    ['Storyfile', 'Video-based "conversational AI" for celebrities/institutions. Enterprise pricing. Not consumer-friendly.'],
    ['Artifact (Memoir)', 'AI transcription of conversations. Good for raw capture but no narrative generation or book compilation.'],
    ['Mabel', 'Voice-first + AI narrative + character-driven + chapter-by-chapter + book output. The complete package for the mobile generation.'],
  ];

  for (const [name, desc] of competitors) {
    checkPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(name === 'Mabel' ? BRAND_GREEN : DARK_TEXT);
    doc.text(name, margin + 5, y);
    y += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BODY_TEXT);
    const lines = doc.splitTextToSize(desc, contentWidth - 10);
    for (const line of lines) {
      checkPage(6);
      doc.text(line, margin + 5, y);
      y += 5.5;
    }
    y += 3;
  }

  // ================================================================
  // CLOSING
  // ================================================================
  sectionTitle('The Vision');

  bodyText('Mabel\'s mission is simple: make it effortless for anyone to capture their life story. We believe every person has stories worth preserving, and the only thing missing is the right tool to unlock them.');

  bodyText('In the near term, Mabel is a personal voice journaling app that turns your memories into a book. In the mid term, it becomes a family storytelling platform where multiple generations contribute their stories to a shared archive. In the long term, Mabel becomes the standard for how humanity preserves personal history — a living library of human experience.');

  highlightBox('Our North Star', 'Make capturing your life story feel as natural and enjoyable as talking to a friend. Not a chore, not homework, not "writing a book" — just a warm conversation that, over time, becomes something priceless.');

  y += 10;
  checkPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BRAND_GREEN);
  doc.text('Mabel — Your Stories, Written with Care', pageWidth / 2, y, { align: 'center' });

  // ================================================================
  // SAVE
  // ================================================================
  const outputPath = path.join(process.cwd(), 'public', 'Mabel-Business-Plan.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`PDF generated: ${outputPath}`);
  console.log(`Pages: ${doc.getNumberOfPages()}`);
}

generateBusinessPlanPDF();
