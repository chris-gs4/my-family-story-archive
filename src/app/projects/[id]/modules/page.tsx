// Module Dashboard - List of all modules for a project
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import ErrorAlert from '@/components/ui/error-alert';
import SuccessAlert from '@/components/ui/success-alert';
import {
  StoryCard,
  StoryCardCover,
  StoryCardBadge,
  StoryCardPhotoWindow,
  StoryCardProgressBar,
} from '@/components/ui/story-card';

interface Module {
  id: string;
  moduleNumber: number;
  title: string;
  status: 'DRAFT' | 'QUESTIONS_GENERATED' | 'IN_PROGRESS' | 'GENERATING_CHAPTER' | 'CHAPTER_GENERATED' | 'APPROVED';
  theme: string | null;
  completedQuestions: number;
  totalQuestions: number;
  hasChapter: boolean;
  approvedAt: string | null;
  coverImageUrl: string | null;
  createdAt: string;
}

interface ModulesData {
  modules: Module[];
  currentModule: number;
  totalCompleted: number;
}

// Paper Primary cover colors - rotates through these
const COVER_COLORS = ['#EAF4EF', '#BFD8E6', '#E7C7C9']; // Sage, Powder Blue, Blush

const getCoverColor = (moduleNumber: number): string => {
  return COVER_COLORS[(moduleNumber - 1) % COVER_COLORS.length];
};

export default function ModulesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ModulesData | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);
  const [downloadingBook, setDownloadingBook] = useState(false);
  const [showGeneratingMessage, setShowGeneratingMessage] = useState(false);

  useEffect(() => {
    fetchModules();

    // Check if we just started generating a chapter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('generated') === 'true') {
      setShowGeneratingMessage(true);
      // Clear the query param
      window.history.replaceState({}, '', `/projects/${params.id}/modules`);
    }
  }, [params.id]);

  // Poll for updates if any module is generating
  useEffect(() => {
    if (!data) return;

    const hasGenerating = data.modules.some(m => m.status === 'GENERATING_CHAPTER');
    if (!hasGenerating) return;

    const interval = setInterval(() => {
      fetchModules();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [data]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/modules`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load modules');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createNewModule = async () => {
    setCreatingModule(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${params.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: '' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create module');
      }

      // Refresh modules list
      await fetchModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreatingModule(false);
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleModuleClick = (module: Module) => {
    if (module.status === 'APPROVED') {
      // View the approved chapter
      router.push(`/projects/${params.id}/modules/${module.id}/chapter`);
    } else if (module.status === 'GENERATING_CHAPTER' || module.status === 'CHAPTER_GENERATED') {
      // View the chapter (will show loading state if still generating, or completed chapter)
      router.push(`/projects/${params.id}/modules/${module.id}/chapter`);
    } else {
      // Go to questions (will show loading state if not ready yet)
      router.push(`/projects/${params.id}/modules/${module.id}/questions`);
    }
  };

  const handleDownloadCompleteBook = async () => {
    setDownloadingBook(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${params.id}/book/export`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download book');
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'family-story-complete-book.pdf';

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download book');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDownloadingBook(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading modules...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    // Check if the error is about missing interviewee setup
    const needsIntervieweeSetup = error.includes('interviewee setup');

    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto">
            {needsIntervieweeSetup ? (
              <div className="card-elevated p-12 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  Setup Required
                </h3>
                <p className="text-text-secondary mb-6">
                  Before creating modules, please tell us about the person you&apos;re interviewing.
                </p>
                <PrimaryButton onClick={() => router.push(`/projects/${params.id}/setup`)}>
                  Setup Interviewee →
                </PrimaryButton>
              </div>
            ) : (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            <div className="mt-4">
              <SecondaryButton onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canCompileBook = data && data.totalCompleted >= 3;
  const paperBg = '#FAF8F3';
  const totalModules = data?.modules.length || 0;
  const completedModules = data?.totalCompleted || 0;
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: paperBg }}>
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex items-center justify-between mb-8">
          <PageHeading
            title="My Stories"
            subtitle="Preserving your family's legacy, one chapter at a time"
            theme="paper-primary"
          />
          <SecondaryButton
            theme="paper-primary"
            variant="ghost"
            onClick={() => router.push('/dashboard')}
          >
            ← Dashboard
          </SecondaryButton>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {/* Success Message - Chapter Generation Started */}
        {showGeneratingMessage && (
          <SuccessAlert
            message="Your chapter is being generated! You can continue working while we create it. The status will update automatically when it's ready."
            onDismiss={() => setShowGeneratingMessage(false)}
          />
        )}

        {/* Overall Progress Indicator */}
        {totalModules > 0 && (
          <div className="mb-8 rounded-2xl p-6" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08)',
            border: '1px solid rgba(17, 24, 39, 0.08)',
          }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                  Overall Progress
                </h3>
                <p className="text-sm" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                  {completedModules} of {totalModules} {totalModules === 1 ? 'chapter' : 'chapters'} completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#2F6F5E' }}>
                  {progressPercentage}%
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: '#2F6F5E',
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Ready to Compile Book Notice */}
        {canCompileBook && (
          <div
            className="mb-8 rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(47, 111, 94, 0.06)',
              border: '2px solid rgba(47, 111, 94, 0.2)',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: '#111827',
                  }}
                >
                  📖 Your Book is Ready!
                </h3>
                <p style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                  You&apos;ve completed {data?.totalCompleted} {data?.totalCompleted === 1 ? 'chapter' : 'chapters'}. Download your complete book as a beautifully formatted PDF.
                </p>
              </div>
              <PrimaryButton
                theme="paper-primary"
                onClick={handleDownloadCompleteBook}
                disabled={downloadingBook}
              >
                {downloadingBook ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  '📥 Download Complete Book'
                )}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Modules Grid - Book Cover Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.modules.map((module) => {
            const progressPercent = getProgressPercentage(module.completedQuestions, module.totalQuestions);
            const isNotStarted = module.completedQuestions === 0;
            const coverColor = getCoverColor(module.moduleNumber);

            return (
              <StoryCard
                key={module.id}
                variant="book-cover"
                interactive
                onClick={() => handleModuleClick(module)}
              >
                {/* Cover Zone */}
                <StoryCardCover coverColor={coverColor}>
                    {/* Chapter Badge */}
                    <StoryCardBadge position="top-left">
                      {module.moduleNumber}
                    </StoryCardBadge>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {/* Mask to hide frame lines behind badge */}
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          top: '-3px',
                          left: '-6px',
                          right: '-6px',
                          bottom: '-3px',
                          backgroundColor: coverColor,
                          zIndex: 2,
                        }}
                      />
                      {/* Status badge */}
                      <div
                        className="relative inline-flex items-center gap-1.5 rounded-full font-medium"
                        style={{
                          backgroundColor: coverColor,
                          color: '#2F6F5E',
                          padding: '5px 10px',
                          border: '1px solid rgba(17, 24, 39, 0.12)',
                          fontSize: '12px',
                          letterSpacing: '0.2px',
                          zIndex: 3,
                        }}
                      >
                        {module.status === 'GENERATING_CHAPTER' ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <span className="hidden sm:inline">Generating...</span>
                          </>
                        ) : module.status === 'CHAPTER_GENERATED' ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="hidden sm:inline">Ready</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                            <span className="hidden sm:inline">
                              {isNotStarted
                                ? 'Not started'
                                : module.status === 'APPROVED'
                                ? 'Complete'
                                : 'Capturing'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cover Typography */}
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
                  </StoryCardCover>

                  {/* Photo Window & Progress */}
                  <div className="px-6 py-5 flex-1 flex flex-col">
                    <StoryCardPhotoWindow imageUrl={module.coverImageUrl} />

                    {/* Progress Stats */}
                    {module.status === 'APPROVED' ? (
                      <div className="mt-auto pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: '#16A34A' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Chapter approved
                        </div>
                        <p className="text-xs" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                          {module.completedQuestions} memories preserved
                        </p>
                      </div>
                    ) : (
                      <div className="mt-auto pt-4">
                        <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
                          {module.completedQuestions} memories saved
                        </p>
                        <p className="text-xs mb-3" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                          {module.totalQuestions - module.completedQuestions} prompts remaining · {progressPercent}% complete
                        </p>
                        <StoryCardProgressBar progress={progressPercent} />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6" style={{ paddingBottom: '40px' }}>
                    <div className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                      <span className="text-xs" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                        Started{' '}
                        {new Date(module.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <PrimaryButton
                        theme={module.status === 'CHAPTER_GENERATED' ? 'action-required' : 'paper-primary'}
                        size="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleClick(module);
                        }}
                      >
                        {module.status === 'GENERATING_CHAPTER'
                          ? 'Generating chapter...'
                          : module.status === 'CHAPTER_GENERATED'
                          ? 'Review & Approve'
                          : isNotStarted
                          ? 'Start writing'
                          : module.status === 'APPROVED'
                          ? 'View chapter'
                          : 'Continue writing'}
                      </PrimaryButton>
                    </div>
                  </div>
                </StoryCard>
              );
            })}
          </div>

          {/* Create New Module Button */}
          {data && data.modules.length > 0 && (
            <div className="mt-8 text-center">
              <SecondaryButton
                theme="paper-primary"
                variant="outline"
                onClick={createNewModule}
                disabled={creatingModule}
              >
                {creatingModule ? 'Creating Module...' : '+ Create Next Module'}
              </SecondaryButton>
            </div>
          )}

          {/* Empty State */}
          {data && data.modules.length === 0 && (
            <div
              className="rounded-3xl p-12 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08)',
                border: '1px solid rgba(17, 24, 39, 0.08)',
              }}
            >
              <div className="max-w-md mx-auto">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(47, 111, 94, 0.1)' }}
                >
                  <svg className="w-8 h-8" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: '#111827',
                  }}
                >
                  No Modules Yet
                </h3>
                <p className="mb-6" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                  Create your first module to start building your story.
                </p>
                <PrimaryButton theme="paper-primary" onClick={createNewModule} disabled={creatingModule}>
                  {creatingModule ? 'Creating...' : 'Create First Module'}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
