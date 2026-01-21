// Module Dashboard - List of all modules for a project
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';

interface Module {
  id: string;
  moduleNumber: number;
  title: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'APPROVED';
  theme: string | null;
  completedQuestions: number;
  totalQuestions: number;
  hasChapter: boolean;
  approvedAt: string | null;
  createdAt: string;
}

interface ModulesData {
  modules: Module[];
  currentModule: number;
  totalCompleted: number;
}

export default function ModulesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ModulesData | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [params.id]);

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

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
      APPROVED: 'bg-green-100 text-green-700 border-green-200',
    };

    const labels = {
      DRAFT: 'Draft',
      IN_PROGRESS: 'In Progress',
      APPROVED: 'Approved',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleModuleClick = (module: Module) => {
    if (module.status === 'APPROVED') {
      // View the approved chapter
      router.push(`/projects/${params.id}/modules/${module.id}/chapter`);
    } else {
      // Go to questions (will show loading state if not ready yet)
      router.push(`/projects/${params.id}/modules/${module.id}/questions`);
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
                  Before creating modules, please tell us about the person you're interviewing.
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <PageHeading
              title="Story Modules"
              subtitle="Each module becomes a chapter in your final book"
            />
            <SecondaryButton onClick={() => router.push('/dashboard')}>
              ← Dashboard
            </SecondaryButton>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Ready to Compile Book Notice */}
          {canCompileBook && (
            <div className="mb-8 card-elevated p-6 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                    Ready to Compile Your Book!
                  </h3>
                  <p className="text-text-secondary">
                    You've completed {data?.totalCompleted} modules. You can now compile them into a complete book.
                  </p>
                </div>
                <PrimaryButton onClick={() => alert('Book compilation coming soon!')}>
                  Compile Book
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Modules List */}
          <div className="space-y-6">
            {data?.modules.map((module) => {
              const progressPercent = getProgressPercentage(module.completedQuestions, module.totalQuestions);
              const isCurrentModule = module.moduleNumber === data.currentModule;

              return (
                <div
                  key={module.id}
                  className={`card-elevated p-6 hover:shadow-lg transition-all cursor-pointer ${
                    isCurrentModule ? 'border-2 border-primary-500' : ''
                  }`}
                  onClick={() => handleModuleClick(module)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-display font-bold text-primary-600">
                          {module.moduleNumber}
                        </span>
                        <div>
                          <h3 className="text-xl font-display font-semibold text-text-primary">
                            {module.title}
                          </h3>
                          {module.theme && (
                            <p className="text-sm text-text-secondary">Theme: {module.theme}</p>
                          )}
                        </div>
                      </div>
                      {isCurrentModule && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-700">
                          Current Module
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(module.status)}
                      {module.approvedAt && (
                        <span className="text-xs text-text-secondary">
                          ✓ Approved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Section */}
                  {module.totalQuestions > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-secondary">
                          Questions: {module.completedQuestions}/{module.totalQuestions} answered
                        </span>
                        <span className="text-sm font-medium text-primary-600">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Chapter Status */}
                  {module.hasChapter && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Chapter generated</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-light">
                    <span className="text-xs text-text-secondary">
                      Created {new Date(module.createdAt).toLocaleDateString()}
                    </span>
                    {module.status === 'APPROVED' ? (
                      <SecondaryButton onClick={() => handleModuleClick(module)}>
                        View Chapter →
                      </SecondaryButton>
                    ) : (
                      <PrimaryButton onClick={() => handleModuleClick(module)}>
                        {module.completedQuestions > 0 ? 'Continue' : 'Start'} Module →
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create New Module Button */}
          {data && data.modules.length > 0 && (
            <div className="mt-8 text-center">
              <SecondaryButton
                onClick={createNewModule}
                disabled={creatingModule}
              >
                {creatingModule ? 'Creating Module...' : '+ Create Next Module'}
              </SecondaryButton>
            </div>
          )}

          {/* Empty State */}
          {data && data.modules.length === 0 && (
            <div className="card-elevated p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                  No Modules Yet
                </h3>
                <p className="text-text-secondary mb-6">
                  Create your first module to start building your story.
                </p>
                <PrimaryButton onClick={createNewModule} disabled={creatingModule}>
                  {creatingModule ? 'Creating...' : 'Create First Module'}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
