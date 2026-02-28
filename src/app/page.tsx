'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const { status } = useSession();

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #A8E6DC 0%, #ccf6e9 10%, #F5F0E8 35%, #FAF8F3 60%, #FAF8F3 100%)' }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* Mascot */}
          <div className="mb-6">
            <Image
              src="/images/mabel-mascot.png"
              alt="Mabel mascot"
              width={180}
              height={180}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>

          {/* Logo Text */}
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-3"
            style={{ color: '#2F6F5E' }}
          >
            Mabel
          </h1>

          {/* Tagline */}
          <p
            className="text-xl md:text-2xl mb-8"
            style={{ fontFamily: 'Georgia, serif', color: '#4a6b5e' }}
          >
            Your Stories, Written with Care
          </p>

          {/* Value Prop */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#3d3d3d' }}>
            Capture your life story through guided voice journaling.
            Just talk &mdash; Mabel listens, transcribes, and transforms your
            spoken memories into beautifully written chapters that become
            a book you can hold forever.
          </p>

          {/* CTA */}
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
            style={{ backgroundColor: '#2F6F5E' }}
          >
            Start Your Story
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="mt-4 text-sm" style={{ color: '#7a8a82' }}>
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            How It Works
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
            Three simple steps to turn a lifetime of memories into a book
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: 'Speak Your Memories',
                desc: 'Mabel asks thoughtful questions about each chapter of your life — childhood, school, career, love, and more. You just tap record and talk.',
              },
              {
                step: '2',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                title: 'Mabel Writes Your Chapter',
                desc: 'Your voice is transcribed and transformed into polished, first-person narrative. Review it, give feedback, and approve when it reads just right.',
              },
              {
                step: '3',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: 'Get Your Book',
                desc: 'Chapters compile into a beautifully formatted PDF book with illustrations. Your life story, in your words, ready to share or keep forever.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl p-8 text-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 12px rgba(17, 24, 39, 0.06)',
                  border: '1px solid rgba(17, 24, 39, 0.06)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: 'rgba(47, 111, 94, 0.1)', color: '#2F6F5E' }}
                >
                  {item.icon}
                </div>
                <div
                  className="absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#2F6F5E' }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Mabel Different */}
      <section className="py-16 px-6" style={{ backgroundColor: 'rgba(47, 111, 94, 0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            What Makes Mabel Different
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
            Built with care for the stories that matter most
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Just Talk, Never Type',
                desc: 'Tap record and speak naturally. No writing skills needed, no staring at a blank page. Mabel turns your voice into beautiful prose.',
                icon: '🎙️',
              },
              {
                title: 'AI That Learns Your Story',
                desc: 'Each chapter builds on the last. Mabel remembers what you\'ve shared to ask smarter, deeper follow-up questions that draw out the richest details.',
                icon: '🧠',
              },
              {
                title: 'One Chapter at a Time',
                desc: 'No pressure to write your whole autobiography in a weekend. Build your book at your own pace — one manageable chapter at a time, over days or months.',
                icon: '📖',
              },
              {
                title: 'Your Story, Your Way',
                desc: 'Review every chapter before it goes in the book. Regenerate with feedback, re-record answers, or approve as-is. You stay in complete control.',
                icon: '✨',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 8px rgba(17, 24, 39, 0.05)',
                  border: '1px solid rgba(17, 24, 39, 0.06)',
                }}
              >
                <span className="text-3xl flex-shrink-0 mt-1">{item.icon}</span>
                <div>
                  <h3 className="text-base font-semibold mb-1.5" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift It / Family Plan */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(47, 111, 94, 0.08) 0%, rgba(168, 230, 220, 0.15) 100%)',
              border: '1px solid rgba(47, 111, 94, 0.15)',
            }}
          >
            <div className="p-8 md:p-12 text-center">
              <span className="text-4xl mb-4 block">👨‍👩‍👧‍👦</span>
              <h2
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
              >
                Give the Gift of a Lifetime
              </h2>
              <p className="text-lg max-w-2xl mx-auto mb-6 leading-relaxed" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
                Know someone whose stories deserve to be preserved? Gift Mabel to
                your parents, grandparents, or anyone whose memories matter. They
                just open the app and start talking &mdash; Mabel does the rest.
              </p>
              <div
                className="inline-block rounded-2xl p-6 mb-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(47, 111, 94, 0.15)',
                }}
              >
                <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#2F6F5E' }}>
                  Coming Soon
                </p>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                  Family Plan
                </h3>
                <p className="text-sm leading-relaxed max-w-md" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                  Invite loved ones at a discounted rate. Each person records their own
                  story, and the whole family&apos;s chapters come together in one shared archive.
                  Multiple voices, one legacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Roadmap */}
      <section className="py-16 px-6" style={{ backgroundColor: 'rgba(47, 111, 94, 0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            The Vision
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
            Everyone has a story worth telling. Mabel makes it effortless to
            capture yours &mdash; and eventually, your whole family&apos;s &mdash;
            so those stories live on for generations.
          </p>

          {/* Roadmap Timeline */}
          <div className="max-w-3xl mx-auto">
            {[
              {
                phase: 'Now',
                label: 'MVP',
                title: 'Voice-to-Book Pipeline',
                items: [
                  'Guided voice journaling with AI-generated questions',
                  'Automatic transcription and narrative generation',
                  'Module-based chapter building at your own pace',
                  'PDF book compilation with AI illustrations',
                  'iOS native app via Capacitor',
                ],
                active: true,
              },
              {
                phase: 'Next',
                label: 'Phase 2',
                title: 'Richer Storytelling',
                items: [
                  'Photo integration into chapters',
                  'Voice-cloned audiobook narration',
                  'Family Plan: gift Mabel to loved ones at a discount',
                  'Family archive: multiple stories in one collection',
                ],
                active: false,
              },
              {
                phase: 'Future',
                label: 'Phase 3',
                title: 'The Story Ecosystem',
                items: [
                  'Video story capture',
                  'Multi-language support',
                  'Printed hardcover book ordering',
                  'Collaborative editing with family members',
                  'Family tree connections across stories',
                ],
                active: false,
              },
            ].map((phase, idx) => (
              <div key={phase.phase} className="flex gap-6 mb-8 last:mb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: phase.active ? '#2F6F5E' : 'rgba(47, 111, 94, 0.15)',
                      color: phase.active ? '#FFFFFF' : '#2F6F5E',
                    }}
                  >
                    {phase.label.split(' ')[0] === 'MVP' ? 'MVP' : `P${idx + 1}`}
                  </div>
                  {idx < 2 && (
                    <div
                      className="w-0.5 flex-1 mt-2"
                      style={{ backgroundColor: 'rgba(47, 111, 94, 0.2)' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-2xl p-6 mb-2"
                  style={{
                    backgroundColor: phase.active ? 'rgba(47, 111, 94, 0.06)' : '#FFFFFF',
                    border: phase.active ? '2px solid rgba(47, 111, 94, 0.2)' : '1px solid rgba(17, 24, 39, 0.06)',
                    boxShadow: '0 1px 6px rgba(17, 24, 39, 0.04)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2F6F5E' }}>
                      {phase.phase}
                    </span>
                    {phase.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#2F6F5E', color: '#FFFFFF' }}>
                        Building
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                    {phase.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem / Emotional Close */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            Your Story Deserves to Be Told
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
            We all carry stories worth preserving &mdash; childhood memories,
            lessons learned, moments that shaped who we are. But life moves fast,
            and those memories fade if we don&apos;t capture them.
          </p>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
            Mabel makes it effortless. No writing skills needed &mdash; the AI
            asks the right questions. No time pressure &mdash; build your book
            one chapter at a time. Just open the app, start talking, and watch
            your life story come together.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
            style={{ backgroundColor: '#2F6F5E' }}
          >
            Start Writing Your Story
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Tech Stack / Built With (for demo night) */}
      <section className="py-12 px-6" style={{ backgroundColor: 'rgba(47, 111, 94, 0.04)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'rgba(17, 24, 39, 0.4)' }}>
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ color: 'rgba(17, 24, 39, 0.4)' }}>
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'OpenAI GPT-4o', 'Whisper', 'DALL-E 3', 'Capacitor iOS', 'Vercel'].map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <Image
          src="/images/mabel-app-icon.png"
          alt="Mabel"
          width={48}
          height={48}
          className="mx-auto mb-3 rounded-xl"
        />
        <p className="text-sm" style={{ color: 'rgba(17, 24, 39, 0.4)' }}>
          Mabel &mdash; Your Stories, Written with Care
        </p>
      </footer>
    </div>
  );
}
