'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import QRCodeCTA from '@/components/QRCodeCTA';

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
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #A8E6DC 0%, #F5F0E8 50%, #FAF8F3 100%)' }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
          {/* Mascot */}
          <div className="mb-6">
            <Image
              src="/images/mabel-mascot.png"
              alt="Mabel mascot"
              width={140}
              height={140}
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
            className="text-xl md:text-2xl mb-6"
            style={{ fontFamily: 'Georgia, serif', color: '#4a6b5e' }}
          >
            Journal Freely. Share Beautifully.
          </p>

          {/* One-liner */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#3d3d3d' }}>
            A journaling app that transforms your thoughts into polished narratives
          </p>

          {/* App Screenshots */}
          <div className="flex justify-center gap-4 mt-12 px-4">
            {[
              { src: '/images/screen-welcome.png', alt: 'Mabel welcome screen' },
              { src: '/images/screen-chapters.png', alt: 'Mabel chapters screen' },
              { src: '/images/screen-recording.png', alt: 'Mabel recording screen' },
              { src: '/images/screen-my-story.png', alt: 'Mabel my stories screen' },
            ].map((screen) => (
              <div
                key={screen.src}
                className="overflow-hidden shadow-lg"
                style={{ maxWidth: '22%', borderRadius: '36px' }}
              >
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={200}
                  height={433}
                  className="w-full h-auto block"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Mabel */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6 text-center"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            What is Mabel?
          </h2>

          <div className="space-y-6 text-lg leading-relaxed text-center" style={{ color: 'rgba(17, 24, 39, 0.8)' }}>
            <p>
              <strong style={{ color: '#2F6F5E' }}>Mabel is a journaling tool that transforms your thoughts into polished narrative.</strong>
            </p>

            <p>
              Unlike traditional memoir services that ask you to commit to a year-long writing project,
              Mabel lets you capture life as it happens. Journal whenever inspiration strikes—by voice or text—and
              Mabel does the polishing work in the background.
            </p>

            <p>
              Over time, your entries become chapters. Your chapters become a story. And when you're ready,
              you can export a PDF book or order a fully narrated audiobook of your own life.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            How It Works
          </h2>
          <p className="text-center mb-16 max-w-2xl mx-auto text-lg" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
            Mabel is designed to fit into your life, not force you into a rigid schedule
          </p>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {[
              {
                step: '1',
                icon: '🎙️',
                title: 'Capture Your Thoughts',
                desc: 'Journal whenever inspiration strikes. Speak into the app or type your thoughts. No prompts, no pressure, no blank page anxiety.',
              },
              {
                step: '2',
                icon: '✨',
                title: 'AI Polishes Your Words',
                desc: 'Mabel transcribes your voice and transforms your entries into polished, first-person narrative. Your voice, just more readable.',
              },
              {
                step: '3',
                icon: '📖',
                title: 'Build Your Story',
                desc: 'As you journal, Mabel organizes entries into chapters. When you have enough chapters, export a PDF book or order a narrated audiobook.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center rounded-2xl p-8 relative"
                style={{
                  border: '2px solid rgba(47, 111, 94, 0.2)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Step number - top left corner */}
                <div
                  className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: '#2F6F5E' }}
                >
                  {item.step}
                </div>

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                  style={{ backgroundColor: 'rgba(47, 111, 94, 0.1)' }}
                >
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-base leading-relaxed" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* The Habit Loop */}
          <div
            className="rounded-2xl p-8 md:p-10 max-w-2xl mx-auto"
            style={{
              backgroundColor: 'rgba(47, 111, 94, 0.06)',
              border: '2px solid rgba(47, 111, 94, 0.15)',
            }}
          >
            <h3 className="text-xl font-semibold mb-3 text-center" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
              Building the Journaling Habit
            </h3>
            <p className="text-base leading-relaxed text-center" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
              Mabel includes gentle reminders and gamified features (streaks, milestones, chapter completion)
              to help you develop a consistent journaling practice. The goal isn't to finish a book in a year—it's
              to capture life as you live it.
            </p>
          </div>
        </div>
      </section>

      {/* Mabel vs StoryWorth */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            How Mabel Is Different
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto text-lg" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
            Mabel vs. traditional memoir services like StoryWorth
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(47, 111, 94, 0.06)' }}>
                  <th className="p-4 text-left font-semibold" style={{ color: '#111827', fontFamily: 'Georgia, serif' }}>
                    Feature
                  </th>
                  <th className="p-4 text-center font-semibold" style={{ color: '#2F6F5E', fontFamily: 'Georgia, serif' }}>
                    Mabel
                  </th>
                  <th className="p-4 text-center font-semibold" style={{ color: 'rgba(17, 24, 39, 0.5)', fontFamily: 'Georgia, serif' }}>
                    StoryWorth
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Mental Model', mabel: 'Journaling habit', storyworth: 'Memoir project' },
                  { feature: 'Time Commitment', mabel: 'Journal anytime', storyworth: '52 weeks, 1 prompt/week' },
                  { feature: 'Input Method', mabel: 'Voice-first (or text)', storyworth: 'Email prompts → typing' },
                  { feature: 'AI Polish', mabel: 'Narrative transformation', storyworth: 'Basic formatting' },
                  { feature: 'Pace', mabel: 'Your schedule', storyworth: 'Weekly deadline' },
                  { feature: 'Output', mabel: 'Export anytime (PDF/audiobook)', storyworth: 'Hardcover book after 1 year' },
                  { feature: 'Best For', mabel: 'Active journalers & beginners', storyworth: 'Family gift projects' },
                ].map((row, idx) => (
                  <tr
                    key={row.feature}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'rgba(245, 240, 232, 0.3)',
                      borderBottom: '1px solid rgba(17, 24, 39, 0.1)',
                    }}
                  >
                    <td className="p-4 font-medium" style={{ color: '#111827' }}>
                      {row.feature}
                    </td>
                    <td className="p-4 text-center" style={{ color: '#2F6F5E', fontWeight: '500' }}>
                      {row.mabel}
                    </td>
                    <td className="p-4 text-center" style={{ color: 'rgba(17, 24, 39, 0.5)' }}>
                      {row.storyworth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 max-w-3xl mx-auto text-center">
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
              <strong style={{ color: '#2F6F5E' }}>In short:</strong> StoryWorth says "write your memoir."
              Mabel says "journal your life, and let AI polish it into something shareable."
              Journaling is a daily habit. Memoir writing is a daunting project. We chose the former.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            Pricing
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto text-lg" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
            Start for free. Upgrade when you're ready.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(17, 24, 39, 0.1)',
                boxShadow: '0 2px 8px rgba(17, 24, 39, 0.04)',
              }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                Free
              </h3>
              <p className="text-4xl font-bold mb-4" style={{ color: '#2F6F5E' }}>
                $0
              </p>
              <p className="text-sm mb-6" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                Try Mabel risk-free
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'First chapter free',
                  'Voice & text journaling',
                  'AI narrative polish',
                  'PDF export',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-6 rounded-full font-semibold transition-all"
                style={{
                  backgroundColor: 'rgba(47, 111, 94, 0.1)',
                  color: '#2F6F5E',
                  border: '2px solid rgba(47, 111, 94, 0.2)',
                }}
              >
                Start Free
              </button>
            </div>

            {/* Starter Tier (Monthly) */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(17, 24, 39, 0.1)',
                boxShadow: '0 2px 8px rgba(17, 24, 39, 0.04)',
              }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                Starter
              </h3>
              <p className="text-4xl font-bold mb-1" style={{ color: '#2F6F5E' }}>
                $4.99
              </p>
              <p className="text-sm mb-6" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                per month
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Up to 10 chapters/month',
                  'Voice & text journaling',
                  'AI narrative polish',
                  'PDF export anytime',
                  'Gamification features',
                  'Chapter organization',
                  'Private & secure',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-6 rounded-full font-semibold transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'rgba(47, 111, 94, 0.1)',
                  color: '#2F6F5E',
                  border: '2px solid rgba(47, 111, 94, 0.2)',
                }}
              >
                Get Started
              </button>
            </div>

            {/* Annual Tier (Best Value) */}
            <div
              className="rounded-2xl p-8 flex flex-col relative"
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #2F6F5E',
                boxShadow: '0 4px 16px rgba(47, 111, 94, 0.15)',
              }}
            >
              <div
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#2F6F5E' }}
              >
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                Annual
              </h3>
              <div className="mb-1">
                <p className="text-4xl font-bold inline" style={{ color: '#2F6F5E' }}>
                  $49.99
                </p>
                <p className="text-base inline ml-2" style={{ color: 'rgba(17, 24, 39, 0.5)' }}>
                  /year
                </p>
              </div>
              <p className="text-sm mb-6" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
                ~$4.17/month · Save 17%
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unlimited chapters',
                  'Voice & text journaling',
                  'AI narrative polish',
                  'PDF export anytime',
                  'Gamification features',
                  'Chapter organization',
                  'Private & secure',
                  'Best value',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-6 rounded-full font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: '#2F6F5E' }}
              >
                Go Annual
              </button>
            </div>
          </div>

          {/* Add-Ons Section (Below Pricing Grid) */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-4" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
              Add-Ons
            </h3>
            <p className="text-center text-sm mb-6" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>
              Available after 10+ chapters
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Narrated Audiobook', price: '$29.99', desc: 'Your story, in your voice (AI cloned)' },
                { name: 'Printed Hardcover', price: '$49.99+', desc: 'Physical book, professionally bound' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'rgba(47, 111, 94, 0.04)',
                    border: '1px solid rgba(47, 111, 94, 0.15)',
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm" style={{ color: '#111827' }}>{item.name}</span>
                    <span className="font-bold text-sm" style={{ color: '#2F6F5E' }}>{item.price}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(17, 24, 39, 0.6)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: 'rgba(17, 24, 39, 0.5)' }}>
            All plans include secure storage, privacy controls, and the ability to delete your data anytime.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-8"
            style={{ fontFamily: 'Georgia, serif', color: '#111827' }}
          >
            Connect with Me
          </h2>

          {/* Profile Photo */}
          <div className="mb-6">
            <Image
              src="/images/christiano-squeff.jpg"
              alt="Christiano Squeff"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-lg"
            />
          </div>

          <p className="text-lg leading-relaxed mb-3" style={{ color: 'rgba(17, 24, 39, 0.7)' }}>
            Built by <strong style={{ color: '#2F6F5E' }}>Christiano Squeff</strong>
          </p>

          <div className="flex flex-col items-center gap-3 mb-10">
            <a
              href="mailto:cgsqueff@gmail.com"
              className="inline-flex items-center gap-2 text-base hover:underline"
              style={{ color: '#2F6F5E' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              cgsqueff@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/christiano-squeff/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base hover:underline"
              style={{ color: '#2F6F5E' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              linkedin.com/in/christiano-squeff
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
                style={{ backgroundColor: '#2F6F5E' }}
              >
                Try Mabel Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-sm" style={{ color: '#7a8a82' }}>
                First chapter free. No credit card required.
              </p>
            </div>

            {/* OR divider */}
            <div className="hidden md:flex items-center gap-3">
              <div className="h-px w-8" style={{ backgroundColor: 'rgba(47, 111, 94, 0.2)' }} />
              <span className="text-sm font-medium" style={{ color: '#7a8a82' }}>OR</span>
              <div className="h-px w-8" style={{ backgroundColor: 'rgba(47, 111, 94, 0.2)' }} />
            </div>

            {/* QR Code - Email */}
            <QRCodeCTA
              url="mailto:cgsqueff@gmail.com"
              label="Get in Touch"
              size={120}
            />
          </div>
        </div>
      </section>

      {/* Tech Stack / Built With */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'rgba(17, 24, 39, 0.4)' }}>
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ color: 'rgba(17, 24, 39, 0.4)' }}>
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'OpenAI GPT-4o', 'Whisper', 'Capacitor iOS', 'Vercel'].map((tech) => (
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
          Mabel &mdash; Journal Freely. Share Beautifully.
        </p>
      </footer>
    </div>
  );
}
