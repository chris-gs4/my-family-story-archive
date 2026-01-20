'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchProjects();
    }
  }, [sessionStatus, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileDropdown && !target.closest('.relative')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileDropdown]);

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

  const handleStartEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditingTitle(project.title);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingTitle('');
  };

  const handleSaveTitle = async (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editingTitle.trim()) {
      showToast('Project title cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      // Update local state
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, title: editingTitle.trim() } : p
      ));

      setEditingProjectId(null);
      setEditingTitle('');
      showToast('Title updated successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update title', 'error');
    }
  };

  const handleStartDelete = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProjectId(projectId);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setDeletingProjectId(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProjectId) return;

    try {
      const response = await fetch(`/api/projects/${deletingProjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove from local state
      setProjects(projects.filter(p => p.id !== deletingProjectId));
      setShowDeleteModal(false);
      setDeletingProjectId(null);
      showToast('Project deleted successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete project', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Family Story Archive</h2>
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="text-sm text-text-secondary">{session?.user?.name || session?.user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      router.push('/profile');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      router.push('/settings');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      router.push('/payment');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Payment Info</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto px-6">
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
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => handleContinueProject(project)}
                >
                  <div className="flex justify-between items-start mb-4">
                    {editingProjectId === project.id ? (
                      <form onSubmit={(e) => handleSaveTitle(project.id, e)} className="flex-1 pr-4">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(project.id, { preventDefault: () => {}, stopPropagation: () => {} } as any)}
                          autoFocus
                          className="w-full text-lg font-semibold text-text-primary border border-primary-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </form>
                    ) : (
                      <div className="flex-1 pr-4 group flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-text-primary">{project.title}</h3>
                        <button
                          onClick={(e) => handleStartEdit(project, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-600"
                          title="Edit title"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
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

                  <div className="flex items-center gap-2">
                    {nextStep && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContinueProject(project);
                        }}
                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                      >
                        {nextStep.label}
                      </button>
                    )}
                    <button
                      onClick={(e) => handleStartDelete(project.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancelDelete}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Project?</h3>
                <p className="text-sm text-text-secondary mb-6">
                  Are you sure you want to delete this project? All associated data including questions, responses, and narratives will be permanently deleted. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <SecondaryButton onClick={handleCancelDelete}>
                    Cancel
                  </SecondaryButton>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
