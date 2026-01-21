// Chapter Review & Approval Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

interface Chapter {
  id: string;
  moduleId: string;
  content: string;
  wordCount: number;
  version: number;
  narrativePerson: string;
  narrativeTone: string;
  narrativeStyle: string;
  structure: any;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: string;
  moduleNumber: number;
  title: string;
  status: string;
  theme: string | null;
  approvedAt: string | null;
}

export default function ChapterPage({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchChapter();
  }, [params.id, params.moduleId]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/chapter`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load chapter');
      }

      const result = await response.json();
      setChapter(result.data.chapter);
      setModule(result.data.module);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this module? This will mark it as complete.')) {
      return;
    }

    setApproving(true);
    setError('');

    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/approve`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve module');
      }

      // Redirect back to modules dashboard
      router.push(`/projects/${params.id}/modules`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApproving(false);
    }
  };

  const handleBackToQuestions = () => {
    router.push(`/projects/${params.id}/modules/${params.moduleId}/questions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error || 'Chapter not found'}
            </div>
            <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
              ← Back to Modules
            </SecondaryButton>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = module?.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
                ← Back to Modules
              </SecondaryButton>
              {!isApproved && (
                <SecondaryButton onClick={handleBackToQuestions}>
                  Edit Answers
                </SecondaryButton>
              )}
            </div>

            <PageHeading
              title={module?.title || 'Chapter Review'}
              subtitle={
                module?.theme
                  ? `Theme: ${module.theme} • Module ${module.moduleNumber}`
                  : `Module ${module?.moduleNumber}`
              }
            />

            {isApproved && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Module Approved</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Chapter Metadata */}
          <div className="card-elevated p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Word Count</p>
                <p className="text-2xl font-display font-semibold text-text-primary">
                  {chapter.wordCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Version</p>
                <p className="text-2xl font-display font-semibold text-text-primary">
                  {chapter.version}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Narrative</p>
                <p className="text-sm font-medium text-text-primary capitalize">
                  {chapter.narrativePerson}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Tone</p>
                <p className="text-sm font-medium text-text-primary capitalize">
                  {chapter.narrativeTone}
                </p>
              </div>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="card-elevated p-8 mb-8">
            <div
              className="prose prose-lg max-w-none"
              style={{
                fontFamily: 'Georgia, serif',
                lineHeight: '1.8',
                color: '#1a1a1a'
              }}
            >
              {chapter.content.split('\n').map((paragraph, index) => {
                if (!paragraph.trim()) return null;

                // Check if it's a heading (starts with #)
                if (paragraph.startsWith('#')) {
                  const headingText = paragraph.replace(/^#+\s/, '');
                  return (
                    <h2
                      key={index}
                      className="text-3xl font-display font-bold text-text-primary mt-8 mb-4 first:mt-0"
                    >
                      {headingText}
                    </h2>
                  );
                }

                return (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
                ← Back to Modules
              </SecondaryButton>
              {!isApproved && (
                <SecondaryButton onClick={handleBackToQuestions}>
                  Edit Answers
                </SecondaryButton>
              )}
            </div>

            {!isApproved && (
              <div className="flex gap-3">
                <SecondaryButton
                  onClick={() => alert('Regenerate feature coming soon!')}
                >
                  Regenerate Chapter
                </SecondaryButton>
                <PrimaryButton onClick={handleApprove} disabled={approving}>
                  {approving ? 'Approving...' : 'Approve Module ✓'}
                </PrimaryButton>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <p className="font-medium mb-1">💡 Next Steps:</p>
            {isApproved ? (
              <p>This module is complete. You can continue working on other modules or compile your book.</p>
            ) : (
              <p>
                Review the chapter above. If you're satisfied, click "Approve Module" to mark it as complete.
                You can also edit your answers or regenerate the chapter with different settings.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
