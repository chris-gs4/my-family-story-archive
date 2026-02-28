// Chapter Review & Approval Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import ErrorAlert from '@/components/ui/error-alert';

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
  illustrationUrl: string | null;
  illustrationPrompt: string | null;
  illustrationGeneratedAt: string | null;
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
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchChapter();
  }, [params.id, params.moduleId]);

  // Poll for updates while chapter is generating
  useEffect(() => {
    const isGenerating = chapter && (!chapter.content || chapter.content.trim().length === 0 || !chapter.wordCount);
    if (!isGenerating) return;

    const interval = setInterval(() => {
      fetchChapter();
    }, 5000);

    return () => clearInterval(interval);
  }, [chapter]);

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

      const result = await response.json();

      // Redirect back to modules dashboard immediately
      // The dashboard will show the updated progress and status
      router.push(`/projects/${params.id}/modules`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApproving(false);
    }
  };

  const handleBackToQuestions = () => {
    router.push(`/projects/${params.id}/modules/${params.moduleId}/questions`);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/chapter/export`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download PDF');
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'chapter.pdf';

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
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerateChapter = async () => {
    if (!regenerateFeedback.trim()) {
      setError('Please provide feedback for regeneration');
      return;
    }

    setRegenerating(true);
    setError('');

    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/chapter/regenerate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedback: regenerateFeedback.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate chapter');
      }

      const result = await response.json();

      // Close modal and reset
      setShowRegenerateModal(false);
      setRegenerateFeedback('');

      // Show inline success message
      setError('');

      // Refresh page after a short delay to show the new version
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate chapter');
      setRegenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    console.log('🎨 [DEBUG] handleGenerateImage called');
    console.log('🎨 [DEBUG] Current state:', { generatingImage, isApproved: module?.status });

    setGeneratingImage(true);
    setError('');

    try {
      console.log('🎨 [DEBUG] Fetching:', `/api/projects/${params.id}/modules/${params.moduleId}/chapter/image/generate`);

      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/chapter/image/generate`,
        { method: 'POST' }
      );

      console.log('🎨 [DEBUG] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🎨 [DEBUG] API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const result = await response.json();
      console.log('🎨 [DEBUG] Success! Result:', result);

      // Update chapter with new illustration
      setChapter((prev) =>
        prev
          ? {
              ...prev,
              illustrationUrl: result.imageUrl,
              illustrationPrompt: result.prompt,
              illustrationGeneratedAt: new Date().toISOString(),
            }
          : null
      );

      console.log('✅ Image generated successfully:', result.imageUrl);
    } catch (err) {
      console.error('❌ [DEBUG] Error in handleGenerateImage:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      alert(`Image Generation Failed: ${errorMessage}`); // Temporary visual feedback
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image too large. Maximum size is 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const response = await fetch(
          `/api/projects/${params.id}/modules/${params.moduleId}/chapter/image/upload`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: base64Data,
              mimeType: file.type,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const result = await response.json();

        // Update chapter with uploaded illustration
        setChapter((prev) =>
          prev
            ? {
                ...prev,
                illustrationUrl: result.imageUrl,
                illustrationPrompt: 'User-uploaded custom image',
                illustrationGeneratedAt: new Date().toISOString(),
              }
            : null
        );

        console.log('Image uploaded successfully');
        setUploadingImage(false);
      };

      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setUploadingImage(false);
    }
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
            <ErrorAlert
              message={error || 'Chapter not found'}
              onDismiss={() => setError('')}
            />
            <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
              ← Back to Modules
            </SecondaryButton>
          </div>
        </div>
      </div>
    );
  }

  // Check if chapter is still being generated
  const isGenerating = !chapter.content || chapter.content.trim().length === 0 || !chapter.wordCount;

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <div className="card-elevated p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
                Generating Your Chapter
              </h2>
              <p className="text-text-secondary mb-6">
                The AI is creating Version {chapter.version} of your chapter. This typically takes 1-2 minutes.
              </p>
              <p className="text-sm text-text-secondary mb-8">
                You&apos;ll be automatically redirected when it&apos;s ready, or you can check back in a moment.
              </p>
              <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
                ← Back to Modules
              </SecondaryButton>
            </div>
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
          </div>

          {/* Error Alert */}
          {error && (
            <ErrorAlert
              message={error}
              onDismiss={() => setError('')}
            />
          )}

          <div className="mb-8">
            {isApproved && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Module Approved</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  This chapter is locked and included in your book compilation. You can still download the PDF or go back to edit your original answers.
                </p>
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
                  {chapter.wordCount?.toLocaleString() || '0'}
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

          {/* Chapter Illustration Section */}
          <div className="card-elevated p-8 mb-8">
            <h3 className="text-xl font-display font-semibold text-text-primary mb-4">
              Chapter Illustration
            </h3>

            {chapter.illustrationUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={chapter.illustrationUrl}
                    alt="Chapter illustration"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                </div>
                {!isApproved && (
                  <div className="flex gap-3">
                    <SecondaryButton
                      onClick={handleGenerateImage}
                      disabled={generatingImage}
                    >
                      {generatingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        '🔄 Regenerate Image'
                      )}
                    </SecondaryButton>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleUploadImage}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <span className="relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg bg-transparent text-muted-foreground border border-border hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.98] h-11 px-5 text-base cursor-pointer" style={uploadingImage ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                        {uploadingImage ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          '📤 Replace with Upload'
                        )}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-secondary mb-4">
                  Add a hand-drawn sketch illustration to bring this chapter to life. Choose to generate one automatically or upload your own.
                </p>
                {isApproved && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ This module is approved. Adding an image won&apos;t affect the chapter content.
                  </div>
                )}
                <div className="flex gap-3">
                  <PrimaryButton
                    onClick={() => {
                      console.log('🔘 [DEBUG] Button clicked! isApproved:', isApproved, 'generatingImage:', generatingImage);
                      handleGenerateImage();
                    }}
                    disabled={generatingImage}
                  >
                    {generatingImage ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating image...
                      </>
                    ) : (
                      '🎨 Auto-generate Image'
                    )}
                  </PrimaryButton>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleUploadImage}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <span className="relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg bg-transparent text-muted-foreground border border-border hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.98] h-11 px-5 text-base cursor-pointer" style={uploadingImage ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                      {uploadingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        '📤 Upload Own Image'
                      )}
                    </span>
                  </label>
                </div>
                {generatingImage && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    <p className="font-medium mb-1">✨ Generating your sketch illustration...</p>
                    <p>This typically takes 20-30 seconds. The AI will create a minimalist hand-drawn style image based on your chapter content.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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

            <div className="flex flex-wrap gap-3 justify-end">
              {/* Download PDF Button */}
              <SecondaryButton onClick={handleDownloadPDF} disabled={downloading}>
                {downloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    📄 Download PDF
                  </>
                )}
              </SecondaryButton>

              {!isApproved && (
                <>
                  <SecondaryButton
                    onClick={() => setShowRegenerateModal(true)}
                  >
                    🔄 Regenerate
                  </SecondaryButton>
                  <PrimaryButton onClick={handleApprove} disabled={approving}>
                    {approving ? 'Approving...' : 'Approve Module ✓'}
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <p className="font-medium mb-1">💡 {isApproved ? 'Module Complete!' : 'Next Steps:'}</p>
            {isApproved ? (
              <div>
                <p className="mb-2">Great work! This chapter is complete and ready for your book.</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Download this chapter as a PDF anytime</li>
                  <li>Continue working on other modules</li>
                  <li>When you have 3+ chapters, compile your complete book</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="mb-2">Review the chapter above carefully:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click &quot;Regenerate Chapter&quot; to improve it with specific feedback</li>
                  <li>Click &quot;Edit Answers&quot; to modify your responses</li>
                  <li>Click &quot;Approve Module ✓&quot; when you&apos;re satisfied</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-text-primary">
                  Regenerate Chapter
                </h2>
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                  disabled={regenerating}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-text-secondary mb-4">
                Tell the AI how you&apos;d like to improve this chapter. Be specific about what changes you want.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={regenerateFeedback}
                  onChange={(e) => setRegenerateFeedback(e.target.value)}
                  placeholder="Example: Make it more emotional and descriptive. Add more details about the childhood home. Use a warmer tone throughout."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  disabled={regenerating}
                />
                <p className="mt-2 text-xs text-text-secondary">
                  Suggested prompts: &quot;Add more details about...&quot;, &quot;Make it more emotional&quot;, &quot;Use a warmer tone&quot;, &quot;Focus more on...&quot;
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Note:</p>
                    <p>Regeneration will create a new version (Version {(chapter?.version || 0) + 1}). This typically takes 1-2 minutes.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <SecondaryButton
                  onClick={() => setShowRegenerateModal(false)}
                  disabled={regenerating}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleRegenerateChapter}
                  disabled={regenerating || !regenerateFeedback.trim()}
                >
                  {regenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Regenerating...
                    </>
                  ) : (
                    '🔄 Regenerate Chapter'
                  )}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
