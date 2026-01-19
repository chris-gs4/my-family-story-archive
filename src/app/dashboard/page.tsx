'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { PageHeading } from '@/components/ui/page-heading';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/lib/hooks/useToast';
import { PROJECT_STATES, getNextStep } from '@/lib/utils/projectState';
import type { ProjectStatus } from '@prisma/client';

interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  interviewee?: {
    name: string;
    relationship: string;
  };
  narrative?: {
    wordCount: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchProjects();
    }
  }, [sessionStatus, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setCreatingProject(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New Project ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const data = await response.json();
      showToast('Project created successfully!', 'success');
      router.push(`/projects/${data.data.id}/setup`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create project', 'error');
      setCreatingProject(false);
    }
  };

  const handleContinueProject = (project: Project) => {
    const nextStep = getNextStep(project.status);
    if (nextStep) {
      router.push(`/projects/${project.id}/${nextStep.path}`);
    } else {
      // If no next step, just go to project overview
      router.push(`/projects/${project.id}/narrative`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeStatus = (status: ProjectStatus): 'draft' | 'recording' | 'processing' | 'complete' => {
    if (['NARRATIVE_COMPLETE', 'COMPLETE'].includes(status)) return 'complete';
    if (['TRANSCRIBING', 'GENERATING_NARRATIVE'].includes(status)) return 'processing';
    if (['QUESTIONS_GENERATED', 'AUDIO_UPLOADED', 'TRANSCRIPTION_COMPLETE'].includes(status)) return 'recording';
    return 'draft';
  };

  if (sessionStatus === 'loading' || loading) {
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Family Story Archive</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{session?.user?.name || session?.user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">My Story Projects</h1>
            <p className="text-text-secondary">Preserve your family&apos;s stories for generations</p>
          </div>
          <PrimaryButton onClick={handleCreateProject} disabled={creatingProject}>
            {creatingProject ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </>
            )}
          </PrimaryButton>
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-text-primary mb-2">No projects yet</h3>
            <p className="text-text-secondary mb-6">Create your first project to start preserving family stories</p>
            <PrimaryButton onClick={handleCreateProject} disabled={creatingProject}>
              {creatingProject ? 'Creating...' : 'Create Your First Project'}
            </PrimaryButton>
          </div>
        )}

        {/* Project Cards Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const stateInfo = PROJECT_STATES[project.status];
              const nextStep = getNextStep(project.status);
              const badgeStatus = getStatusBadgeStatus(project.status);

              return (
                <div
                  key={project.id}
                  className="card-elevated p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleContinueProject(project)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-text-primary flex-1 pr-4">{project.title}</h3>
                    <StatusBadge status={badgeStatus} />
                  </div>

                  {project.interviewee && (
                    <p className="text-sm text-text-secondary mb-2">
                      {project.interviewee.name} ({project.interviewee.relationship})
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>

                  <p className="text-sm text-text-secondary mb-4">{stateInfo.description}</p>

                  {nextStep && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueProject(project);
                      }}
                      className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {nextStep.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
