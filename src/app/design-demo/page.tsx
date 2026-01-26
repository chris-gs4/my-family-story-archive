'use client';

import { useState } from 'react';

type DesignOption = 'minimal' | 'bold' | 'warm' | 'dark' | 'paper';

export default function DesignDemoPage() {
  const [selectedDesign, setSelectedDesign] = useState<DesignOption>('paper');

  // Mock module data - multiple for grid
  const mockModules = [
    {
      id: '1',
      moduleNumber: 1,
      title: "Early Life & Childhood",
      theme: "Growing up in Iowa",
      status: "IN_PROGRESS" as const,
      completedQuestions: 12,
      totalQuestions: 20,
      hasChapter: false,
      createdAt: new Date().toISOString(),
      coverColor: '#EAF4EF', // Sage
    },
    {
      id: '2',
      moduleNumber: 2,
      title: "Career & Calling",
      theme: "Teaching years",
      status: "IN_PROGRESS" as const,
      completedQuestions: 5,
      totalQuestions: 18,
      hasChapter: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      coverColor: '#BFD8E6', // Powder Blue
    },
    {
      id: '3',
      moduleNumber: 3,
      title: "Family Stories",
      theme: "Love & marriage",
      status: "DRAFT" as const,
      completedQuestions: 0,
      totalQuestions: 15,
      hasChapter: false,
      createdAt: new Date().toISOString(),
      coverColor: '#E7C7C9', // Blush
    },
  ];

  const mockModule = mockModules[0];
  const progressPercent = Math.round((mockModule.completedQuestions / mockModule.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Choose Your Design Style
          </h1>
          <p className="text-lg text-gray-600">
            Pick the style that resonates with you. This will be applied to your entire Module Dashboard.
          </p>
        </div>

        {/* Design Selector */}
        <div className="flex gap-4 justify-center mb-12 flex-wrap">
          <button
            onClick={() => setSelectedDesign('minimal')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDesign === 'minimal'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Option 1: Minimal & Clean
          </button>
          <button
            onClick={() => setSelectedDesign('bold')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDesign === 'bold'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Option 2: Modern & Bold
          </button>
          <button
            onClick={() => setSelectedDesign('warm')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDesign === 'warm'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Option 3: Warm & Personal
          </button>
          <button
            onClick={() => setSelectedDesign('dark')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDesign === 'dark'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg ring-2 ring-amber-400'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dark Mode
          </button>
          <button
            onClick={() => setSelectedDesign('paper')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedDesign === 'paper'
                ? 'text-white shadow-lg ring-2 ring-green-400'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={selectedDesign === 'paper' ? { backgroundColor: '#2F6F5E' } : {}}
          >
            ⭐ Paper Primary (Recommended)
          </button>
        </div>

        {/* Design Preview */}
        <div className={selectedDesign === 'paper' ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'}>
          {selectedDesign === 'minimal' && <MinimalDesign module={mockModule} progressPercent={progressPercent} />}
          {selectedDesign === 'bold' && <BoldDesign module={mockModule} progressPercent={progressPercent} />}
          {selectedDesign === 'warm' && <WarmDesign module={mockModule} progressPercent={progressPercent} />}
          {selectedDesign === 'dark' && <DarkModeDesign module={mockModule} progressPercent={progressPercent} />}
          {selectedDesign === 'paper' && <BookCoverGridDesign modules={mockModules} />}
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg p-8 shadow-sm">
          {selectedDesign === 'minimal' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Minimal & Clean (Linear-inspired)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Lots of white space for breathing room</li>
                <li>✓ Subtle borders and hover effects</li>
                <li>✓ Professional, distraction-free interface</li>
                <li>✓ Focus on content, not decoration</li>
                <li>✓ Perfect for users who want simplicity</li>
              </ul>
            </div>
          )}
          {selectedDesign === 'bold' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Modern & Bold (Notion-inspired)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Rich colors and strong visual hierarchy</li>
                <li>✓ Card-based design with depth</li>
                <li>✓ Icon-driven for quick scanning</li>
                <li>✓ Gradient accents for visual interest</li>
                <li>✓ Perfect for users who love modern UI</li>
              </ul>
            </div>
          )}
          {selectedDesign === 'warm' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Warm & Personal (Stripe-inspired)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Warm color palette (amber/orange) feels inviting</li>
                <li>✓ Soft shadows and rounded corners</li>
                <li>✓ Personal, family-friendly aesthetic</li>
                <li>✓ Smooth animations and transitions</li>
                <li>✓ Perfect for emotional, story-focused content</li>
              </ul>
            </div>
          )}
          {selectedDesign === 'dark' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Heritage Dark Mode - Modern Heirloom</h3>
              <p className="text-gray-700 mb-4 italic">
                Redesigned based on your feedback to feel like "modern heirloom" not "fintech dashboard"
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✅ <strong>Heritage Gold palette</strong> (#E3B341) - warm, nostalgic, timeless</li>
                <li>✅ <strong>Serif typography</strong> (Georgia) for storytelling moments</li>
                <li>✅ <strong>Softer composition</strong> - generous padding (32px), subtle textures</li>
                <li>✅ <strong>Emotional language</strong> - "memories saved", "chapter taking shape"</li>
                <li>✅ <strong>Bookmark progress bar</strong> - segmented like pages with warm glow</li>
                <li>✅ <strong>Writing icon in CTA</strong> - "Continue this chapter"</li>
                <li>✅ <strong>Book icon</strong> in footer timestamp</li>
                <li>✅ <strong>Midnight Ink background</strong> (#0B1220) - soft, not harsh tech dark</li>
                <li>✅ <strong>Subtle texture overlay</strong> - paper/linen feel at 3% opacity</li>
                <li>✅ <strong>Glow effects</strong> - warm amber halos, not neon</li>
              </ul>
              <p className="text-gray-600 mt-4 text-sm">
                This now feels like sitting by a fireplace with a family photo album - warm, intimate, and precious.
              </p>
            </div>
          )}
          {selectedDesign === 'paper' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">⭐ Book Cover Grid - Memoir Shelf Experience</h3>
              <p className="text-gray-700 mb-4 italic">
                The "book cover object" moment - each module feels like a real memoir/book on a shelf
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✅ <strong>3-column grid layout</strong> - library/shelf of memoirs (responsive: 1/2/3 cols)</li>
                <li>✅ <strong>Cover Zone</strong> - colored backgrounds with nested frame lines (signature motif)</li>
                <li>✅ <strong>Curated theme colors</strong> - Sage (#EAF4EF), Powder Blue (#BFD8E6), Blush (#E7C7C9)</li>
                <li>✅ <strong>Photo Window</strong> - large centerpiece (150px height) with "Add cover photo" prompt</li>
                <li>✅ <strong>Bookmark meter</strong> - vertical 6px bar on right edge showing progress</li>
                <li>✅ <strong>Chapter number badge</strong> - volume label sticker (top-left on cover)</li>
                <li>✅ <strong>Status badge</strong> - subtle top-right with pencil icon</li>
                <li>✅ <strong>Emotional copy</strong> - "12 memories saved · 8 prompts remaining"</li>
                <li>✅ <strong>Serif typography</strong> - Georgia for "CHAPTER 1" + module title</li>
                <li>✅ <strong>Clean footer</strong> - date left, CTA ("Continue" / "Start writing") right</li>
                <li>✅ <strong>Card hover</strong> - lift effect (-4px translateY) with enhanced shadow</li>
                <li>✅ <strong>460px card height</strong> - generous, book-like proportions</li>
              </ul>
              <p className="text-gray-600 mt-4 text-sm font-semibold">
                Feels like: A shelf of family memoirs that are becoming real books.
                Each card is a "keepsake object" not a "dashboard widget."
                Warm, intimate, archival, premium.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION 1: MINIMAL & CLEAN (Linear-inspired)
// ============================================
function MinimalDesign({ module, progressPercent }: { module: any; progressPercent: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Story Modules</h2>
          <p className="text-sm text-gray-500">Each module becomes a chapter in your final book</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
          ← Dashboard
        </button>
      </div>

      {/* Module Card - Minimal Style */}
      <div className="group bg-white border border-gray-200 hover:border-gray-300 rounded-lg p-6 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-900 font-mono">
              {module.moduleNumber}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-0.5">
                {module.title}
              </h3>
              {module.theme && (
                <p className="text-sm text-gray-500">{module.theme}</p>
              )}
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            In Progress
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-600">
              {module.completedQuestions}/{module.totalQuestions} questions
            </span>
            <span className="text-sm font-medium text-gray-900">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Created {new Date(module.createdAt).toLocaleDateString()}
          </span>
          <button className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
            Continue Module →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION 2: MODERN & BOLD (Notion-inspired)
// ============================================
function BoldDesign({ module, progressPercent }: { module: any; progressPercent: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Story Modules</h2>
          <p className="text-base text-gray-600">Build your story chapter by chapter</p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
          ← Dashboard
        </button>
      </div>

      {/* Module Card - Bold Style */}
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border-2 border-indigo-100 hover:border-indigo-300">
        {/* Color accent bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-lg">
                {module.moduleNumber}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {module.title}
                </h3>
                {module.theme && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {module.theme}
                  </p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              In Progress
            </span>
          </div>

          {/* Progress */}
          <div className="mb-5 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {module.completedQuestions}/{module.totalQuestions} questions answered
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Created {new Date(module.createdAt).toLocaleDateString()}
            </span>
            <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all">
              Continue Module →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION 3: WARM & PERSONAL (Stripe-inspired)
// ============================================
function WarmDesign({ module, progressPercent }: { module: any; progressPercent: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-2">
            Story Modules
          </h2>
          <p className="text-base text-gray-600">Preserving your family's legacy, one chapter at a time</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
          ← Dashboard
        </button>
      </div>

      {/* Module Card - Warm Style */}
      <div className="group bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-amber-100">
        <div className="p-7">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl font-bold shadow-lg ring-4 ring-amber-100">
                {module.moduleNumber}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {module.title}
                </h3>
                {module.theme && (
                  <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block">
                    {module.theme}
                  </p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-2 border-amber-200">
              In Progress
            </span>
          </div>

          {/* Progress */}
          <div className="mb-5 bg-white/70 rounded-xl p-5 border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Progress on this chapter
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-amber-100/50 rounded-full h-3 shadow-inner mb-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {module.completedQuestions} of {module.totalQuestions} questions answered
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-amber-100">
            <span className="text-xs text-gray-500">
              Started {new Date(module.createdAt).toLocaleDateString()}
            </span>
            <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
              Continue Your Story →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION 5: BOOK COVER GRID ⭐ (Memoir Shelf Experience)
// ============================================
function BookCoverGridDesign({ modules }: { modules: any[] }) {
  return (
    <div className="space-y-12 p-12 rounded-2xl" style={{ backgroundColor: '#FAF8F3' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '48px',
              color: '#111827',
              letterSpacing: '0.3px'
            }}
          >
            Story Modules
          </h1>
          <p className="text-base" style={{ color: 'rgba(17,24,39,0.60)' }}>
            Preserving your family's legacy, one chapter at a time
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          ← Dashboard
        </button>
      </div>

      {/* Book Cover Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <BookCoverCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}

// BookCoverCard Component
function BookCoverCard({ module }: { module: any }) {
  const progressPercent = Math.round((module.completedQuestions / module.totalQuestions) * 100);
  const isNotStarted = module.completedQuestions === 0;

  return (
    <div
      className="rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden relative flex flex-col"
      style={{
        height: '520px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
        border: '1px solid rgba(17, 24, 39, 0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(17, 24, 39, 0.12)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(17, 24, 39, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 1) Cover Zone (memoir cover) */}
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          backgroundColor: module.coverColor,
          height: '210px',
          padding: '62px 20px 28px 20px', // More breathing room - top and bottom
          position: 'relative',
        }}
      >
        {/* Nested frame lines (signature motif) - z-index: 1 */}
        <div
          className="absolute inset-3 rounded-lg pointer-events-none"
          style={{
            border: '1px solid rgba(17, 24, 39, 0.18)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute rounded-lg pointer-events-none"
          style={{
            top: '22px',
            left: '22px',
            right: '22px',
            bottom: '22px',
            border: '1px solid rgba(17, 24, 39, 0.18)',
            zIndex: 1,
          }}
        />

        {/* Chapter number badge (volume label) */}
        <div
          className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{
            backgroundColor: '#2F6F5E',
            boxShadow: '0 2px 4px rgba(17, 24, 39, 0.12)',
            zIndex: 20,
          }}
        >
          {module.moduleNumber}
        </div>

        {/* Status pill with notch effect */}
        <div className="absolute top-3 right-3">
          {/* Mask rectangle behind pill - z-index: 2 - hides frame lines */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '-3px',
              left: '-6px',
              right: '-6px',
              bottom: '-3px',
              backgroundColor: module.coverColor,
              zIndex: 2,
            }}
          />

          {/* Status pill - z-index: 3 - more "printed" feel */}
          <div
            className="relative inline-flex items-center gap-1.5 rounded-full font-medium"
            style={{
              backgroundColor: module.coverColor,
              color: '#2F6F5E',
              padding: '5px 10px',
              border: '1px solid rgba(17, 24, 39, 0.12)',
              fontSize: '12px',
              letterSpacing: '0.2px',
              zIndex: 3,
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="hidden sm:inline">{isNotStarted ? 'Not started' : 'Capturing'}</span>
          </div>
        </div>

        {/* Cover typography - now with safe spacing from badges */}
        <div className="relative z-10 max-w-full px-2">
          <p
            className="uppercase tracking-wider mb-2.5"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'rgba(17, 24, 39, 0.65)',
              letterSpacing: '0.06em',
            }}
          >
            CHAPTER {module.moduleNumber}
          </p>
          <h3
            className="font-semibold"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '22px',
              color: '#111827',
              lineHeight: '1.25',
              marginBottom: '10px',
            }}
          >
            {module.title}
          </h3>
          {module.theme && (
            <p
              className="mt-3.5 px-3 py-1 rounded-full inline-block text-xs"
              style={{
                backgroundColor: 'rgba(47, 111, 94, 0.10)',
                color: '#2F6F5E',
              }}
            >
              {module.theme}
            </p>
          )}
        </div>
      </div>

      {/* 2) Photo Window (centerpiece) */}
      <div className="px-6 py-5 flex-1 flex flex-col">
        <div
          className="rounded-xl flex items-center justify-center flex-col text-center"
          style={{
            height: '150px',
            backgroundColor: 'rgba(17, 24, 39, 0.02)',
            border: '1px dashed rgba(17, 24, 39, 0.18)',
          }}
        >
          <svg
            className="w-12 h-12 mb-2"
            style={{ color: 'rgba(17, 24, 39, 0.25)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs" style={{ color: 'rgba(17, 24, 39, 0.45)' }}>
            Add cover photo
          </p>
        </div>

        {/* 3) Progress stats + bar */}
        <div className="mt-auto pt-4">
          <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
            {module.completedQuestions} memories saved
          </p>
          <p className="text-xs mb-3" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
            {module.totalQuestions - module.completedQuestions} prompts remaining · {progressPercent}% complete
          </p>

          {/* Progress bar - proper component inside card */}
          <div className="relative">
            <div
              className="w-full rounded-full h-1.5 overflow-hidden relative"
              style={{
                backgroundColor: 'rgba(17, 24, 39, 0.08)',
              }}
            >
              {/* Filled portion */}
              <div
                className="h-full transition-all duration-500 relative"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: '#2F6F5E',
                }}
              >
                {/* Subtle page segments overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 9%, rgba(255,255,255,0.12) 9%, rgba(255,255,255,0.12) 10%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4) Footer - dedicated container with proper spacing */}
      <div className="px-6" style={{ paddingBottom: '32px' }}>
        <div
          className="flex items-center justify-between"
          style={{ marginTop: '20px' }}
        >
          <span className="text-xs" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
            Started {new Date(module.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <button
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{
              backgroundColor: '#2F6F5E',
              height: '40px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#275D4F';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(47, 111, 94, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2F6F5E';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isNotStarted ? 'Start writing' : 'Continue writing'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION 5: PAPER PRIMARY ⭐ (Modern Archival Studio)
// ============================================
function PaperPrimaryDesign({ module, progressPercent }: { module: any; progressPercent: number }) {
  return (
    <div className="space-y-6 p-8 rounded-2xl" style={{ backgroundColor: '#FAF8F3' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: 'Georgia, serif',
              color: '#111827',
              letterSpacing: '0.3px'
            }}
          >
            Story Modules
          </h2>
          <p className="text-base" style={{ color: '#6B7280' }}>
            Preserving your family's legacy, one chapter at a time
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          ← Dashboard
        </button>
      </div>

      {/* Module Card - Paper/Archival Style */}
      <div
        className="rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden relative"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08), 0 1px 2px rgba(17, 24, 39, 0.04)',
          border: '1px solid rgba(17, 24, 39, 0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 24, 39, 0.12), 0 2px 4px rgba(17, 24, 39, 0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(17, 24, 39, 0.08), 0 1px 2px rgba(17, 24, 39, 0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              {/* Chapter number with photo placeholder icon */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl text-white text-2xl font-bold relative"
                  style={{
                    backgroundColor: '#2F6F5E',
                    boxShadow: '0 2px 8px rgba(47, 111, 94, 0.2)',
                  }}
                >
                  <span>{module.moduleNumber}</span>
                </div>
                {/* Small photo frame placeholder */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: '#EAF4EF',
                    border: '1.5px solid rgba(47, 111, 94, 0.2)',
                  }}
                >
                  <svg className="w-6 h-6" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div>
                <h3
                  className="text-xl font-bold mb-1.5"
                  style={{
                    color: '#111827',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.2px'
                  }}
                >
                  {module.title}
                </h3>
                {module.theme && (
                  <p
                    className="text-sm px-3 py-1.5 rounded-full inline-block"
                    style={{
                      color: '#2F6F5E',
                      backgroundColor: 'rgba(47, 111, 94, 0.08)',
                    }}
                  >
                    {module.theme}
                  </p>
                )}
              </div>
            </div>

            {/* Status badge - soft fill */}
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'rgba(47, 111, 94, 0.12)',
                color: '#2F6F5E',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Capturing memories
            </span>
          </div>

          {/* Progress Section - Gentle bookmark style */}
          <div
            className="mb-6 rounded-2xl p-6"
            style={{
              backgroundColor: '#F3F4F6',
              border: '1px solid rgba(17, 24, 39, 0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
                Your chapter is taking shape
              </span>
              <span
                className="text-lg font-semibold"
                style={{
                  color: '#2F6F5E',
                  fontFamily: 'Georgia, serif'
                }}
              >
                {progressPercent}%
              </span>
            </div>

            {/* Bookmark-style progress bar */}
            <div className="relative mb-3">
              <div
                className="w-full rounded-full h-2.5 overflow-hidden relative"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(17, 24, 39, 0.06)',
                  boxShadow: 'inset 0 1px 2px rgba(17, 24, 39, 0.04)',
                }}
              >
                {/* Filled portion */}
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: '#2F6F5E',
                  }}
                >
                  {/* Subtle page segments */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 9%, rgba(255,255,255,0.15) 9%, rgba(255,255,255,0.15) 10%)',
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs" style={{ color: '#6B7280' }}>
              <span className="font-medium">{module.completedQuestions} memories saved</span> · {module.totalQuestions - module.completedQuestions} prompts remaining
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-6"
            style={{ borderTop: '1px solid rgba(17, 24, 39, 0.06)' }}
          >
            <span className="text-xs flex items-center gap-2" style={{ color: '#6B7280' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Started {new Date(module.createdAt).toLocaleDateString()}
            </span>

            {/* CTA - Calm premium button */}
            <button
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: '#2F6F5E',
                height: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#275D4F';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(47, 111, 94, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2F6F5E';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Continue this chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION 4: HERITAGE DARK MODE ⭐ (Modern Heirloom)
// ============================================
function DarkModeDesign({ module, progressPercent }: { module: any; progressPercent: number }) {
  return (
    <div className="space-y-6 p-8 rounded-2xl" style={{ backgroundColor: '#0B1220' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#E3B341] to-[#F59E0B] bg-clip-text text-transparent mb-2"
              style={{ fontFamily: 'Georgia, serif' }}>
            Story Modules
          </h2>
          <p className="text-base" style={{ color: 'rgba(243,246,251,0.72)' }}>
            Preserving your family's legacy, one chapter at a time
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: 'rgba(243,246,251,0.72)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F3F6FB'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(243,246,251,0.72)'}>
          ← Dashboard
        </button>
      </div>

      {/* Module Card - Heritage Dark with Warm Glow */}
      <div
        className="group rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden relative"
        style={{
          backgroundColor: '#121F33',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(227,179,65,0.15), inset 0 1px 0 rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(227,179,65,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }}
        />

        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              {/* Chapter number badge - heritage gold */}
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl text-white text-2xl font-bold relative"
                style={{
                  background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                  boxShadow: '0 8px 20px rgba(227,179,65,0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 rounded-2xl"
                     style={{
                       border: '3px solid rgba(227,179,65,0.2)',
                       boxShadow: '0 0 20px rgba(227,179,65,0.15)'
                     }}
                />
                <span className="relative">{module.moduleNumber}</span>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-1.5"
                    style={{
                      color: '#F3F6FB',
                      fontFamily: 'Georgia, serif'
                    }}>
                  {module.title}
                </h3>
                {module.theme && (
                  <p className="text-sm px-3 py-1.5 rounded-lg inline-block"
                     style={{
                       color: '#E3B341',
                       backgroundColor: 'rgba(227,179,65,0.1)',
                       border: '1px solid rgba(227,179,65,0.2)'
                     }}>
                    {module.theme}
                  </p>
                )}
              </div>
            </div>

            {/* Status badge */}
            <span
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(227,179,65,0.15) 0%, rgba(245,158,11,0.15) 100%)',
                color: '#E3B341',
                border: '1px solid rgba(227,179,65,0.25)',
                boxShadow: '0 4px 12px rgba(227,179,65,0.15)'
              }}
            >
              Capturing memories
            </span>
          </div>

          {/* Progress Section - Bookmark Style */}
          <div
            className="mb-6 rounded-xl p-6"
            style={{
              backgroundColor: 'rgba(26,42,66,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'rgba(243,246,251,0.72)' }}>
                Your chapter is taking shape
              </span>
              <span
                className="text-2xl font-bold bg-gradient-to-r from-[#E3B341] to-[#F59E0B] bg-clip-text text-transparent"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {progressPercent}%
              </span>
            </div>

            {/* Bookmark-style progress bar */}
            <div className="relative">
              {/* Background with subtle segments */}
              <div
                className="w-full rounded-full h-3 overflow-hidden relative"
                style={{
                  backgroundColor: '#0F1B2D',
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {/* Filled portion with warm glow */}
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #E3B341 0%, #F59E0B 100%)',
                    boxShadow: '0 0 12px rgba(227,179,65,0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
                  }}
                >
                  {/* Subtle page segments overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 9%, rgba(255,255,255,0.1) 9%, rgba(255,255,255,0.1) 10%)',
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs mt-3" style={{ color: 'rgba(243,246,251,0.48)' }}>
              {module.completedQuestions} memories saved · {module.totalQuestions - module.completedQuestions} prompts remaining
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs flex items-center gap-2" style={{ color: 'rgba(243,246,251,0.48)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Started {new Date(module.createdAt).toLocaleDateString()}
            </span>

            {/* CTA with writing icon */}
            <button
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #E3B341 0%, #F59E0B 100%)',
                boxShadow: '0 4px 16px rgba(227,179,65,0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(227,179,65,0.4), inset 0 1px 2px rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(227,179,65,0.3), inset 0 1px 2px rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Continue this chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
