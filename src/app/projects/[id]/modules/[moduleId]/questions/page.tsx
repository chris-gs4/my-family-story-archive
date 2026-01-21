'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
  response: string | null;
  respondedAt: string | null;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [params.id, params.moduleId]);

  // Set initial question index to first unanswered question
  useEffect(() => {
    if (questions.length > 0) {
      const firstUnanswered = questions.findIndex((q) => !q.response);
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered);
      }
    }
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

  const handleAnswerChange = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setQuestions((prev) =>
      prev.map((q) => (q.id === currentQuestion.id ? { ...q, response: value } : q))
    );
  };

  const handleSaveAnswer = async (moveNext: boolean = false) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.response) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        `/api/projects/${params.id}/modules/${params.moduleId}/questions/${currentQuestion.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: currentQuestion.response }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save answer');
      }

      const result = await response.json();
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestion.id
            ? { ...q, response: result.data.response, respondedAt: result.data.respondedAt }
            : q
        )
      );

      // Move to next question if requested
      if (moveNext && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
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

      router.push(`/projects/${params.id}/modules/${params.moduleId}/chapter`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGeneratingChapter(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const completedCount = questions.filter((q) => q.response).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const canGenerateChapter = completedCount >= Math.ceil(totalCount * 0.5);

  const currentQuestion = questions[currentQuestionIndex];

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
              ← Back to Modules
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
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <SecondaryButton onClick={() => router.push(`/projects/${params.id}/modules`)}>
              ← Back to Modules
            </SecondaryButton>

            <div className="mt-6">
              <PageHeading
                title="Answer Questions"
                subtitle="Share your story by answering these questions. You can save and come back anytime."
              />
            </div>

            <div className="mt-6 card-elevated p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">
                  Progress: {completedCount}/{totalCount} questions answered
                </span>
                <span className="text-2xl font-display font-bold text-blue-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {canGenerateChapter && (
                <p className="mt-3 text-sm text-green-600 font-medium">
                  ✓ You have answered enough questions to generate a chapter!
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && (
            <div className="space-y-6">
              <div className={`card-elevated p-8 ${currentQuestion.response ? 'border-l-4 border-l-green-500' : ''}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                        {currentQuestionIndex + 1}
                      </span>
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                        {currentQuestion.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {currentQuestion.question}
                    </h3>
                  </div>
                  {currentQuestion.response && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </span>
                  )}
                </div>

                <textarea
                  value={currentQuestion.response || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
                  placeholder="Share your story here..."
                />

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-text-secondary">
                    {currentQuestion.response ? currentQuestion.response.split(/\s+/).filter(w => w).length : 0} words
                  </span>
                  <div className="flex items-center gap-3">
                    <SecondaryButton
                      onClick={() => handleSaveAnswer(false)}
                      disabled={saving || !currentQuestion.response}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={() => handleSaveAnswer(true)}
                      disabled={saving || !currentQuestion.response || currentQuestionIndex >= questions.length - 1}
                    >
                      Submit Answer →
                    </PrimaryButton>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <SecondaryButton
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </SecondaryButton>
                <span className="text-sm text-text-secondary">
                  Question {currentQuestionIndex + 1} of {totalCount}
                </span>
                <SecondaryButton
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex >= questions.length - 1}
                >
                  Next →
                </SecondaryButton>
              </div>
            </div>
          )}

          {/* Generate Chapter Section */}
          <div className="mt-8 card-elevated p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
                  Ready to Generate Your Chapter?
                </h3>
                <p className="text-sm text-text-secondary">
                  {canGenerateChapter
                    ? "You have answered enough questions to create a narrative chapter. We will combine your responses into a cohesive story."
                    : `Answer at least ${Math.ceil(totalCount * 0.5)} questions (50%) to generate a chapter. You have ${completedCount} so far.`}
                </p>
              </div>
              <PrimaryButton
                onClick={handleGenerateChapter}
                disabled={!canGenerateChapter || generatingChapter}
              >
                {generatingChapter ? 'Generating...' : 'Generate Chapter →'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
