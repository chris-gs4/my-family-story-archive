// Audio Upload Page - Upload interview audio or use dummy data
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

interface Session {
  id: string;
  audioFileKey: string;
  duration: number;
  status: string;
  uploadedAt: string;
  transcription?: {
    id: string;
    text: string;
    wordCount: number;
  };
}

interface Job {
  id: string;
  type: string;
  status: string;
  progress: number;
}

export default function AudioUploadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [projectStatus, setProjectStatus] = useState('');
  const [jobProgress, setJobProgress] = useState(0);
  const [transcribing, setTranscribing] = useState(false);

  // Fetch initial project data
  useEffect(() => {
    fetchUploadStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for transcription progress
  useEffect(() => {
    if (!transcribing) return;

    const interval = setInterval(async () => {
      await fetchUploadStatus();
      await checkJobProgress();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcribing, params.id]);

  const fetchUploadStatus = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/audio/upload`);
      if (!response.ok) {
        throw new Error('Failed to fetch upload status');
      }

      const data = await response.json();
      setSessions(data.data.sessions || []);
      setProjectStatus(data.data.projectStatus);

      // Check if transcription is complete
      const latestSession = data.data.sessions?.[0];
      if (latestSession?.transcription) {
        setTranscribing(false);
        setJobProgress(100);
      } else if (data.data.projectStatus === 'TRANSCRIBING') {
        setTranscribing(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkJobProgress = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const transcribeJob = data.data.jobs?.find(
          (job: Job) => job.type === 'TRANSCRIBE_AUDIO' && job.status === 'RUNNING'
        );

        if (transcribeJob) {
          setJobProgress(transcribeJob.progress);
        }

        // Check if transcription is complete
        if (data.data.status === 'TRANSCRIPTION_COMPLETE') {
          setTranscribing(false);
          setJobProgress(100);
          await fetchUploadStatus(); // Refresh to get transcription data
        }
      }
    } catch (err) {
      console.error('Error checking job progress:', err);
    }
  };

  const handleUseDummyData = async () => {
    setUploading(true);
    setTranscribing(true);
    setJobProgress(10);
    setError('');

    try {
      const response = await fetch(`/api/projects/${params.id}/audio/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useDummyData: true,
          fileName: 'sample-interview.mp3',
          fileSize: 5242880, // 5 MB
          duration: 180, // 3 minutes
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start transcription');
      }

      const data = await response.json();
      setJobProgress(25);

      // Start polling for progress
      await fetchUploadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTranscribing(false);
      setJobProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleContinueToNarrative = () => {
    router.push(`/projects/${params.id}/narrative`);
  };

  const handleBackToQuestions = () => {
    router.push(`/projects/${params.id}/questions`);
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

  const latestSession = sessions[0];
  const hasTranscription = latestSession?.transcription;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <PageHeading
            title="Upload Audio"
            subtitle="Upload your interview recording or use dummy data for testing"
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Upload Section */}
          {!latestSession && !transcribing && (
            <div className="mt-8 space-y-6">
              {/* Dummy Data Option */}
              <div className="card-elevated p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                    Test with Sample Audio
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Use dummy audio data to test the transcription and narrative generation workflow.
                    This simulates a 3-minute interview recording.
                  </p>
                  <PrimaryButton onClick={handleUseDummyData} disabled={uploading}>
                    Use Dummy Audio Data
                  </PrimaryButton>
                </div>
              </div>

              {/* Future: Real File Upload */}
              <div className="card-elevated p-8 bg-gray-50 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-gray-600 mb-2">
                    Upload Real Audio
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Real file upload coming soon. For now, use the dummy data option above.
                  </p>
                  <SecondaryButton disabled>
                    Coming Soon
                  </SecondaryButton>
                </div>
              </div>
            </div>
          )}

          {/* Transcribing Progress */}
          {transcribing && (
            <div className="mt-8 card-elevated p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  Transcribing Audio...
                </h3>
                <p className="text-text-secondary mb-4">
                  Our AI is converting your audio to text. This usually takes 1-2 minutes.
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

          {/* Transcription Complete */}
          {hasTranscription && !transcribing && (
            <div className="mt-8 space-y-6">
              <div className="card-elevated p-8">
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
                      Transcription Complete!
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Your audio has been successfully transcribed. Ready to generate the narrative.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-text-secondary mb-2">
                        <strong>Duration:</strong> {Math.floor(latestSession.duration / 60)} minutes {latestSession.duration % 60} seconds
                      </p>
                      <p className="text-sm text-text-secondary">
                        <strong>Word Count:</strong> {latestSession.transcription.wordCount.toLocaleString()} words
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcription Preview */}
              <div className="card-elevated p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Transcription Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm text-text-secondary whitespace-pre-line">
                    {latestSession.transcription.text.substring(0, 500)}
                    {latestSession.transcription.text.length > 500 && '...'}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <SecondaryButton onClick={handleBackToQuestions}>
                  ← Back to Questions
                </SecondaryButton>
                <PrimaryButton onClick={handleContinueToNarrative}>
                  Generate Narrative →
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Back button when no session exists */}
          {!latestSession && !transcribing && (
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
