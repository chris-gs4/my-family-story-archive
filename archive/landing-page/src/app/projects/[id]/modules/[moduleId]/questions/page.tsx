'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import ErrorAlert from '@/components/ui/error-alert';
import { ModuleAudioRecorder } from '@/components/module/module-audio-recorder';
import { Mic, Type, Trash2, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
  response: string | null;
  respondedAt: string | null;
  audioFileKey: string | null;
  rawTranscript: string | null;
  narrativeText: string | null;
  processingStatus: string | null;
  errorMessage: string | null;
  duration: number | null;
}

interface Stats {
  total: number;
  answered: number;
  processing: number;
  errors: number;
  progress: number;
  canGenerateChapter: boolean;
}

export default function QuestionsPage({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textDraft, setTextDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params.id, params.moduleId]);

  // Polling: refetch when any question is processing
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const hasProcessing = questions.some(
      (q) =>
        q.processingStatus &&
        ['RECORDING', 'UPLOADING', 'PROCESSING'].includes(q.processingStatus)
    );

    if (hasProcessing) {
      pollRef.current = setInterval(() => {
        fetchQuestions();
      }, 2000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/questions`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load questions');
      }

      const result = await response.json();
      setQuestions(result.data.questions);
      setStats(result.data.stats);

      if (result.data.questions.length === 0) {
        setTimeout(() => {
          fetchQuestions();
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Find the next unanswered question (no response, not processing)
  const currentQuestion = questions.find(
    (q) => !q.respondedAt && !q.processingStatus
  );

  // Answered/processing questions (memory cards)
  const memoryCards = questions.filter(
    (q) => q.respondedAt || q.processingStatus
  );

  const handleTextSubmit = async () => {
    if (!currentQuestion || !textDraft.trim()) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/questions/${currentQuestion.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: textDraft.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save answer');
      }

      setTextDraft('');
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceComplete = () => {
    // Refetch to see the new processing card
    fetchQuestions();
  };

  const handleDeleteRecording = async (questionId: string) => {
    setDeletingId(questionId);
    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/questions/${questionId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }

      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateChapter = async () => {
    setGeneratingChapter(true);
    setError('');

    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/chapter/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            narrativePerson: 'first-person',
            narrativeTone: 'warm',
            narrativeStyle: 'descriptive',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chapter');
      }

      // Navigate to chapter page to see generation progress
      router.push(`/projects/${params.id}/modules/${params.moduleId}/chapter`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratingChapter(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = questions.filter((q) => q.respondedAt).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const canGenerateChapter = stats?.canGenerateChapter ?? false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
              &larr; Back to My Stories
            </SecondaryButton>

            <div className="mt-12 card-elevated p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">
                Generating Questions...
              </h2>
              <p className="text-text-secondary mb-6">
                We are creating personalized questions for this module. This usually takes about 5-10 seconds.
              </p>
              <p className="text-sm text-text-secondary">
                This page will automatically refresh when questions are ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6">
          <SecondaryButton
            theme="paper-primary"
            variant="ghost"
            onClick={() => router.push(`/projects/${params.id}/modules`)}
          >
            &larr; Back to My Stories
          </SecondaryButton>

          <div className="mt-4">
            <PageHeading
              title="Share Your Memories"
              subtitle="Record your voice or type your answers. Each response becomes a memory."
              theme="paper-primary"
            />
          </div>

          {error && (
            <div className="mt-4">
              <ErrorAlert message={error} onDismiss={() => setError('')} />
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4 rounded-2xl p-4" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08)',
            border: '1px solid rgba(17, 24, 39, 0.08)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#111827' }}>
                {completedCount}/{totalCount} memories captured
              </span>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#2F6F5E' }}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, backgroundColor: '#2F6F5E' }}
              ></div>
            </div>
            {canGenerateChapter && (
              <p className="mt-2 text-sm font-medium" style={{ color: '#16A34A' }}>
                You have enough memories to generate a chapter!
              </p>
            )}
          </div>
        </div>

        {/* Current Question with Dual-Mode Input */}
        {currentQuestion && (
          <div className="mb-8 rounded-2xl overflow-hidden" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08)',
            border: '1px solid rgba(17, 24, 39, 0.08)',
          }}>
            {/* Question Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: '#2F6F5E' }}
                >
                  {currentQuestion.order}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(17, 24, 39, 0.5)' }}>
                  {currentQuestion.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                {currentQuestion.question}
              </h3>
            </div>

            {/* Input Mode Toggle */}
            <div className="px-6 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setInputMode('voice')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    inputMode === 'voice'
                      ? 'text-white'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={inputMode === 'voice' ? { backgroundColor: '#2F6F5E' } : {}}
                >
                  <Mic className="w-4 h-4" />
                  Voice
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    inputMode === 'text'
                      ? 'text-white'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={inputMode === 'text' ? { backgroundColor: '#2F6F5E' } : {}}
                >
                  <Type className="w-4 h-4" />
                  Text
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 pt-4">
              {inputMode === 'voice' ? (
                <ModuleAudioRecorder
                  projectId={params.id}
                  moduleId={params.moduleId}
                  questionId={currentQuestion.id}
                  prompt={currentQuestion.question}
                  onRecordingComplete={handleVoiceComplete}
                  onError={(msg) => setError(msg)}
                />
              ) : (
                <div>
                  <textarea
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all resize-y"
                    placeholder="Share your story here..."
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      {textDraft ? textDraft.split(/\s+/).filter((w) => w).length : 0} words
                    </span>
                    <PrimaryButton
                      theme="paper-primary"
                      onClick={handleTextSubmit}
                      disabled={saving || !textDraft.trim()}
                    >
                      {saving ? 'Saving...' : 'Submit Answer'}
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All questions answered state */}
        {!currentQuestion && completedCount === totalCount && (
          <div className="mb-8 rounded-2xl p-8 text-center" style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08)',
            border: '2px solid rgba(47, 111, 94, 0.3)',
          }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(47, 111, 94, 0.1)' }}
            >
              <svg className="w-8 h-8" style={{ color: '#2F6F5E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
              All Memories Captured!
            </h3>
            <p className="text-gray-500 mb-4">
              You&apos;ve answered all the questions. Ready to create your chapter?
            </p>
          </div>
        )}

        {/* Memory Cards */}
        {memoryCards.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
              Your Memories ({memoryCards.length})
            </h3>
            <div className="space-y-3">
              {memoryCards.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    backgroundColor: q.processingStatus === 'ERROR'
                      ? '#FEF2F2'
                      : '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(17, 24, 39, 0.06)',
                    border: q.processingStatus === 'ERROR'
                      ? '1px solid #FECACA'
                      : '1px solid rgba(17, 24, 39, 0.08)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Question prompt */}
                      <p className="text-sm font-medium mb-1" style={{ color: 'rgba(17, 24, 39, 0.5)' }}>
                        Q{q.order}: {q.question}
                      </p>

                      {/* Processing state */}
                      {q.processingStatus && ['RECORDING', 'UPLOADING', 'PROCESSING'].includes(q.processingStatus) && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#2F6F5E' }}></div>
                          <span className="text-sm" style={{ color: '#2F6F5E' }}>
                            {q.processingStatus === 'RECORDING' ? 'Recording...' :
                             q.processingStatus === 'UPLOADING' ? 'Uploading...' :
                             'Transcribing & writing...'}
                          </span>
                        </div>
                      )}

                      {/* Error state */}
                      {q.processingStatus === 'ERROR' && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600 mb-2">
                            {q.errorMessage || 'Processing failed'}
                          </p>
                          <button
                            onClick={() => handleDeleteRecording(q.id)}
                            disabled={deletingId === q.id}
                            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {deletingId === q.id ? 'Clearing...' : 'Clear & Retry'}
                          </button>
                        </div>
                      )}

                      {/* Complete state */}
                      {q.processingStatus === 'COMPLETE' && (
                        <div className="mt-2">
                          {q.narrativeText && (
                            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#111827', fontFamily: 'Georgia, serif' }}>
                              {q.narrativeText}
                            </p>
                          )}
                          {!q.narrativeText && q.rawTranscript && (
                            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#111827' }}>
                              {q.rawTranscript}
                            </p>
                          )}
                          {q.duration && (
                            <p className="text-xs mt-1" style={{ color: 'rgba(17, 24, 39, 0.4)' }}>
                              {formatDuration(q.duration)} recording
                            </p>
                          )}
                        </div>
                      )}

                      {/* Text-only response (no audio) */}
                      {!q.processingStatus && q.response && (
                        <p className="text-sm mt-2 leading-relaxed line-clamp-3" style={{ color: '#111827' }}>
                          {q.response}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    {q.respondedAt && q.processingStatus !== 'PROCESSING' && (
                      <button
                        onClick={() => handleDeleteRecording(q.id)}
                        disabled={deletingId === q.id}
                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete this memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Chapter Section */}
        <div className="rounded-2xl p-6" style={{
          backgroundColor: canGenerateChapter ? 'rgba(47, 111, 94, 0.06)' : '#FFFFFF',
          boxShadow: '0 2px 8px rgba(17, 24, 39, 0.08)',
          border: canGenerateChapter ? '2px solid rgba(47, 111, 94, 0.2)' : '1px solid rgba(17, 24, 39, 0.08)',
        }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#111827' }}>
                Ready to Generate Your Chapter?
              </h3>
              <p className="text-sm" style={{ color: 'rgba(17, 24, 39, 0.60)' }}>
                {canGenerateChapter
                  ? "You have enough memories to create a narrative chapter. We'll combine your responses into a cohesive story."
                  : `Capture at least ${Math.ceil(totalCount * 0.5)} memories (50%) to generate a chapter. You have ${completedCount} so far.`}
              </p>
            </div>
            <PrimaryButton
              theme="paper-primary"
              onClick={handleGenerateChapter}
              disabled={!canGenerateChapter || generatingChapter}
            >
              {generatingChapter ? 'Generating...' : 'Generate Chapter'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
