// Narrative Page - Generate and view narrative from transcription
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import { useToast } from '@/lib/hooks/useToast';

interface Narrative {
  id: string;
  content: string;
  wordCount: number;
  status: string;
  structure: {
    chapters: Array<{ title: string; startPage: number }>;
  };
}

interface Job {
  id: string;
  type: string;
  status: string;
  progress: number;
}

export default function NarrativePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [narrativeStyle, setNarrativeStyle] = useState<'first-person' | 'third-person'>('first-person');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch project data
  useEffect(() => {
    fetchProjectData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for generation progress
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(async () => {
      await fetchProjectData();
      await checkJobProgress();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generating, params.id]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();

      if (data.data.narrative) {
        setNarrative(data.data.narrative);
        setGenerating(false);
        setJobProgress(100);
      }

      // Check if narrative generation is in progress
      if (data.data.status === 'GENERATING_NARRATIVE') {
        setGenerating(true);
      } else if (data.data.status === 'NARRATIVE_COMPLETE') {
        setGenerating(false);
        setJobProgress(100);
      }

      // Check if responses exist
      const hasResponses = data.data.questions?.some(
        (question: any) => question.response
      );

      if (!hasResponses && !loading) {
        showToast('No responses found. Please answer interview questions first.', 'warning');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkJobProgress = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const narrativeJob = data.data.jobs?.find(
          (job: Job) => job.type === 'GENERATE_NARRATIVE' && job.status === 'RUNNING'
        );

        if (narrativeJob) {
          setJobProgress(narrativeJob.progress);
        }
      }
    } catch (err) {
      console.error('Error checking job progress:', err);
    }
  };

  const handleGenerateNarrative = async () => {
    setGenerating(true);
    setJobProgress(10);

    try {
      const response = await fetch(`/api/projects/${params.id}/narrative/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: narrativeStyle,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate narrative');
      }

      setJobProgress(25);
      showToast('Narrative generation started!', 'info');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An error occurred', 'error');
      setGenerating(false);
      setJobProgress(0);
    }
  };

  const handleDownloadNarrative = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!narrative || downloading) return;

    setDownloading(true);
    setShowExportMenu(false);

    try {
      // Call the export API endpoint
      const response = await fetch(`/api/projects/${params.id}/narrative/export?format=${format}`);

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `family-story.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create temporary URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${format.toUpperCase()} successfully!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to download narrative', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleBackToQuestions = () => {
    router.push(`/projects/${params.id}/questions`);
  };

  const handleEditNarrative = () => {
    if (narrative) {
      setEditedContent(narrative.content);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleSaveNarrative = async () => {
    if (!editedContent.trim() || !narrative) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${params.id}/narrative`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save narrative');
      }

      const data = await response.json();
      setNarrative(data.data);
      setIsEditing(false);
      showToast('Narrative saved successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save narrative', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <PageHeading
            title="Story Narrative"
            subtitle="Generate a beautiful written narrative from your interview"
          />

          {/* Generate Narrative Section */}
          {!narrative && !generating && (
            <div className="mt-8 space-y-6">
              {/* Style Selection */}
              <div className="card-elevated p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Choose Narrative Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setNarrativeStyle('first-person')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      narrativeStyle === 'first-person'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          narrativeStyle === 'first-person'
                            ? 'border-primary-600'
                            : 'border-gray-300'
                        }`}>
                          {narrativeStyle === 'first-person' && (
                            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-text-primary mb-1">First Person</h4>
                        <p className="text-sm text-text-secondary">
                          &quot;I remember it was a beautiful spring day...&quot;
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setNarrativeStyle('third-person')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      narrativeStyle === 'third-person'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          narrativeStyle === 'third-person'
                            ? 'border-primary-600'
                            : 'border-gray-300'
                        }`}>
                          {narrativeStyle === 'third-person' && (
                            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-text-primary mb-1">Third Person</h4>
                        <p className="text-sm text-text-secondary">
                          &quot;The memories begin on a beautiful spring day...&quot;
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <div className="card-elevated p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                    Ready to Create Your Story?
                  </h3>
                  <p className="text-text-secondary mb-6">
                    We'll transform your transcription into a beautifully written narrative.
                    This takes about 15-30 seconds.
                  </p>
                  <PrimaryButton onClick={handleGenerateNarrative}>
                    Generate Narrative
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}

          {/* Generating Progress */}
          {generating && (
            <div className="mt-8 card-elevated p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  Creating Your Story...
                </h3>
                <p className="text-text-secondary mb-4">
                  Our AI is crafting a beautiful narrative from your interview
                </p>
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${jobProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">{jobProgress}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Narrative Complete */}
          {narrative && !generating && (
            <div className="mt-8 space-y-6">
              {/* Success Banner */}
              <div className="card-elevated p-6 bg-green-50 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                      Story Complete!
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Your family story has been beautifully written and is ready to share.
                    </p>
                    <div className="flex gap-2 text-sm text-text-secondary">
                      <span><strong>Word Count:</strong> {narrative.wordCount.toLocaleString()} words</span>
                      <span className="text-gray-300">|</span>
                      <span><strong>Chapters:</strong> {narrative.structure.chapters.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative Content */}
              <div className="card-elevated p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-display font-semibold text-text-primary">Your Story</h3>

                  {/* Download Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={downloading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Story
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {showExportMenu && !downloading && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                        <div className="py-2">
                          <button
                            onClick={() => handleDownloadNarrative('pdf')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text-primary transition-colors"
                          >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <div className="font-medium">PDF</div>
                              <div className="text-xs text-text-secondary">Portable Document</div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleDownloadNarrative('docx')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text-primary transition-colors"
                          >
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <div className="font-medium">DOCX</div>
                              <div className="text-xs text-text-secondary">Word Document</div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleDownloadNarrative('txt')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text-primary transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <div className="font-medium">TXT</div>
                              <div className="text-xs text-text-secondary">Plain Text</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chapters */}
                {narrative.structure.chapters.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Chapters</h4>
                    <div className="flex flex-wrap gap-2">
                      {narrative.structure.chapters.map((chapter, index) => (
                        <span
                          key={index}
                          className="text-sm px-3 py-1 bg-white border border-gray-200 rounded-full text-text-secondary"
                        >
                          {chapter.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-y text-text-primary leading-relaxed font-sans"
                        placeholder="Edit your narrative..."
                      />
                      <div className="mt-4 flex justify-end gap-3">
                        <SecondaryButton onClick={handleCancelEdit} disabled={saving}>
                          Cancel
                        </SecondaryButton>
                        <PrimaryButton onClick={handleSaveNarrative} disabled={saving || !editedContent.trim()}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-text-primary leading-relaxed">
                      {narrative.content}
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleEditNarrative}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Narrative
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <SecondaryButton onClick={handleBackToQuestions}>
                  ← Back to Questions
                </SecondaryButton>
                <div className="flex gap-3">
                  <SecondaryButton onClick={handleGenerateNarrative}>
                    Regenerate
                  </SecondaryButton>
                  <PrimaryButton onClick={handleBackToDashboard}>
                    Back to Dashboard
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}

          {/* Back button when no narrative exists */}
          {!narrative && !generating && (
            <div className="mt-8">
              <SecondaryButton onClick={handleBackToQuestions}>
                ← Back to Questions
              </SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
