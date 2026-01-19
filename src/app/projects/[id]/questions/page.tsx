// Questions Page - Conversational Interview Flow
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import { useToast } from '@/lib/hooks/useToast';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
  batch: number;
  response?: string;
}

interface Interviewee {
  name: string;
  relationship: string;
  topics: string[];
}

const MINIMUM_RESPONSES_FOR_NARRATIVE = 15;

export default function QuestionsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [interviewee, setInterviewee] = useState<Interviewee | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [jobProgress, setJobProgress] = useState(0);

  // Fetch project data
  useEffect(() => {
    fetchProjectData();
  }, []);

  // Poll for job progress when generating
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}/questions`);
        if (response.ok) {
          const data = await response.json();
          if (data.questions && data.questions.length > questions.length) {
            setQuestions(data.questions);
            setGenerating(false);
            setJobProgress(100);

            // Initialize responses from existing data
            const existingResponses: Record<string, string> = {};
            data.questions.forEach((q: Question) => {
              if (q.response) {
                existingResponses[q.id] = q.response;
              }
            });
            setResponses(existingResponses);
          }
        }
      } catch (err) {
        console.error('Error polling for questions:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [generating, params.id, questions.length]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setInterviewee(data.data.interviewee);
      setQuestions(data.data.questions || []);

      // Initialize responses from existing data
      const existingResponses: Record<string, string> = {};
      if (data.data.questions) {
        data.data.questions.forEach((q: Question) => {
          if (q.response) {
            existingResponses[q.id] = q.response;
          }
        });
      }
      setResponses(existingResponses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setJobProgress(10);
    setError('');

    try {
      const response = await fetch(`/api/projects/${params.id}/questions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate questions');
      }

      // Job is now running in background
      setJobProgress(25);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGenerating(false);
      setJobProgress(0);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    setError('');

    try {
      // Save current responses
      const saveResponse = await fetch(`/api/projects/${params.id}/questions/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.error || 'Failed to save responses');
      }

      showToast('Responses saved!', 'success');

      // Check if we have enough responses for narrative
      const totalResponses = Object.keys(responses).length;
      if (totalResponses >= MINIMUM_RESPONSES_FOR_NARRATIVE) {
        showToast('You have enough responses to generate your story!', 'success');
        await fetchProjectData();
        return;
      }

      // Auto-generate follow-up questions
      setGenerating(true);
      const followUpResponse = await fetch(`/api/projects/${params.id}/questions/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!followUpResponse.ok) {
        const data = await followUpResponse.json();
        throw new Error(data.error || 'Failed to generate follow-up questions');
      }

      const followUpData = await followUpResponse.json();
      showToast(
        `Great answers! ${followUpData.questionsGenerated} more questions generated.`,
        'success'
      );

      // Refresh project data to show new questions
      await fetchProjectData();
      setGenerating(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save responses';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNarrative = async () => {
    // First save responses
    try {
      const saveResponse = await fetch(`/api/projects/${params.id}/questions/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.error || 'Failed to save responses');
      }

      // Navigate to narrative generation
      router.push(`/projects/${params.id}/narrative`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save responses';
      showToast(errorMessage, 'error');
    }
  };

  // Calculate stats
  const currentBatch = questions.length > 0 ? Math.max(...questions.map((q) => q.batch)) : 0;
  const totalResponses = Object.keys(responses).filter((id) => responses[id]?.trim().length > 0).length;
  const currentBatchQuestions = questions.filter((q) => q.batch === currentBatch);
  const currentBatchAnswered = currentBatchQuestions.filter((q) => responses[q.id]?.trim().length > 0).length;
  const allCurrentBatchAnswered = currentBatchAnswered === currentBatchQuestions.length && currentBatchQuestions.length > 0;
  const canGenerateNarrative = totalResponses >= MINIMUM_RESPONSES_FOR_NARRATIVE;
  const progressPercentage = Math.min((totalResponses / MINIMUM_RESPONSES_FOR_NARRATIVE) * 100, 100);

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

  if (!interviewee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary">No interviewee information found.</p>
          <button
            onClick={() => router.push(`/projects/${params.id}/setup`)}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Add interviewee information →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <PageHeading
            title="Interview Questions"
            subtitle={`Share ${interviewee.name}'s story, one question at a time`}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Progress Tracker */}
          {questions.length > 0 && (
            <div className="mt-8 card-elevated p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-text-primary">Story Progress</h3>
                <span className="text-sm font-medium text-primary-600">
                  {totalResponses} / {MINIMUM_RESPONSES_FOR_NARRATIVE} responses
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-text-secondary">
                {canGenerateNarrative
                  ? 'You have enough responses to generate your story!'
                  : `Answer ${MINIMUM_RESPONSES_FOR_NARRATIVE - totalResponses} more questions to generate your narrative`}
              </p>
            </div>
          )}

          {/* Interviewee Summary */}
          <div className="mt-8 card-elevated p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">About the Interviewee</h3>
            <div className="text-text-secondary">
              <p><strong>Name:</strong> {interviewee.name}</p>
              <p><strong>Relationship:</strong> {interviewee.relationship}</p>
              {interviewee.topics.length > 0 && (
                <p><strong>Topics:</strong> {interviewee.topics.join(', ')}</p>
              )}
            </div>
          </div>

          {/* Generate Initial Questions */}
          {questions.length === 0 && !generating && (
            <div className="mt-8 card-elevated p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  Ready to Start?
                </h3>
                <p className="text-text-secondary mb-6">
                  We'll create personalized interview questions based on {interviewee.name}'s information. Let's begin the conversation.
                </p>
                <PrimaryButton onClick={handleGenerateQuestions} disabled={generating}>
                  Start Interview
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Generating Progress */}
          {generating && (
            <div className="mt-8 card-elevated p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  {questions.length === 0 ? 'Generating Questions...' : 'Generating Follow-up Questions...'}
                </h3>
                <p className="text-text-secondary mb-4">
                  {questions.length === 0
                    ? `Our AI is crafting personalized questions for ${interviewee.name}`
                    : 'Based on your answers, we\'re creating deeper follow-up questions'}
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

          {/* Questions with Text Input */}
          {questions.length > 0 && !generating && (
            <>
              {/* Instructions */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Round {currentBatch} Questions</p>
                    <p>Answer these questions in your own words. The more detail you provide, the richer the story will be. After you finish, we'll generate more personalized follow-up questions.</p>
                  </div>
                </div>
              </div>

              {/* Questions List with Text Input */}
              <div className="mt-6 space-y-6">
                {currentBatchQuestions.map((q, index) => (
                  <div key={q.id} className="card-elevated p-6">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-700">{q.order}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-text-primary font-medium text-lg mb-1">{q.question}</p>
                        <p className="text-sm text-text-secondary">{q.category}</p>
                      </div>
                    </div>

                    {/* Text Input */}
                    <textarea
                      value={responses[q.id] || ''}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      placeholder="Share your thoughts here..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[100px] text-text-primary placeholder-text-secondary"
                    />

                    {/* Character count */}
                    {responses[q.id] && (
                      <p className="text-xs text-text-secondary mt-2">
                        {responses[q.id].length} characters
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-4">
                {/* Primary action: Continue or Generate Narrative */}
                {allCurrentBatchAnswered && (
                  <div>
                    {canGenerateNarrative ? (
                      <PrimaryButton
                        onClick={handleGenerateNarrative}
                        disabled={saving}
                        className="w-full"
                      >
                        Generate Your Story →
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton
                        onClick={handleSaveAndContinue}
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? 'Saving...' : 'Continue to Next Questions →'}
                      </PrimaryButton>
                    )}
                  </div>
                )}

                {/* Progress indicator */}
                {!allCurrentBatchAnswered && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">
                      Answer all {currentBatchQuestions.length} questions in this round to continue
                      ({currentBatchAnswered} / {currentBatchQuestions.length} complete)
                    </p>
                  </div>
                )}

                {/* Secondary actions */}
                {currentBatch > 1 && (
                  <div className="flex justify-center">
                    <SecondaryButton onClick={handleGenerateQuestions}>
                      Regenerate All Questions
                    </SecondaryButton>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
