// Questions Page - Generate and View Interview Questions
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
}

interface Interviewee {
  name: string;
  relationship: string;
  topics: string[];
}

export default function QuestionsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [interviewee, setInterviewee] = useState<Interviewee | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
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
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            setGenerating(false);
            setJobProgress(100);
          }
        }
      } catch (err) {
        console.error('Error polling for questions:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [generating, params.id]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setInterviewee(data.data.interviewee);
      setQuestions(data.data.questions || []);
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

  const handleContinue = () => {
    router.push(`/projects/${params.id}/upload`);
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
            description={`Personalized questions for ${interviewee.name}`}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
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

          {/* Generate Questions Section */}
          {questions.length === 0 && !generating && (
            <div className="mt-8 card-elevated p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  Ready to Generate Questions?
                </h3>
                <p className="text-text-secondary mb-6">
                  We'll create personalized interview questions based on {interviewee.name}'s information. This takes about 10-15 seconds.
                </p>
                <PrimaryButton onClick={handleGenerateQuestions} disabled={generating}>
                  Generate Interview Questions
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
                  Generating Questions...
                </h3>
                <p className="text-text-secondary mb-4">
                  Our AI is crafting personalized questions for {interviewee.name}
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

          {/* Questions List */}
          {questions.length > 0 && (
            <>
              <div className="mt-8 space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="card-elevated p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-700">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-text-primary font-medium">{q.question}</p>
                        <p className="text-sm text-text-secondary mt-1">{q.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center">
                <SecondaryButton onClick={() => handleGenerateQuestions()}>
                  Regenerate Questions
                </SecondaryButton>
                <PrimaryButton onClick={handleContinue}>
                  Continue to Audio Upload →
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
