// Project State Management Utilities
// Handles project workflow states and transitions

import type { ProjectStatus } from '@prisma/client';

export const PROJECT_STATES: Record<ProjectStatus, { label: string; description: string; color: string }> = {
  DRAFT: {
    label: 'Draft',
    description: 'Project created, setup in progress',
    color: 'gray',
  },
  RECORDING_INFO: {
    label: 'Recording Info',
    description: 'Interviewee information being collected',
    color: 'blue',
  },
  QUESTIONS_GENERATED: {
    label: 'Questions Ready',
    description: 'Interview questions have been generated',
    color: 'indigo',
  },
  AUDIO_UPLOADED: {
    label: 'Audio Uploaded',
    description: 'Audio file has been uploaded',
    color: 'purple',
  },
  TRANSCRIBING: {
    label: 'Transcribing',
    description: 'Audio is being transcribed',
    color: 'yellow',
  },
  TRANSCRIPTION_COMPLETE: {
    label: 'Transcription Complete',
    description: 'Transcription is ready',
    color: 'green',
  },
  GENERATING_NARRATIVE: {
    label: 'Generating Story',
    description: 'Narrative is being generated',
    color: 'orange',
  },
  NARRATIVE_COMPLETE: {
    label: 'Story Complete',
    description: 'Narrative is ready to download',
    color: 'emerald',
  },
  COMPLETE: {
    label: 'Complete',
    description: 'Project is complete',
    color: 'green',
  },
  ERROR: {
    label: 'Error',
    description: 'An error occurred',
    color: 'red',
  },
};

// Define valid state transitions
const STATE_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ['RECORDING_INFO'],
  RECORDING_INFO: ['QUESTIONS_GENERATED'],
  QUESTIONS_GENERATED: ['AUDIO_UPLOADED'],
  AUDIO_UPLOADED: ['TRANSCRIBING'],
  TRANSCRIBING: ['TRANSCRIPTION_COMPLETE', 'ERROR'],
  TRANSCRIPTION_COMPLETE: ['GENERATING_NARRATIVE'],
  GENERATING_NARRATIVE: ['NARRATIVE_COMPLETE', 'ERROR'],
  NARRATIVE_COMPLETE: ['COMPLETE'],
  COMPLETE: [],
  ERROR: ['DRAFT'], // Allow retry from error state
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) || false;
}

/**
 * Get the next logical step for a project based on its current state
 */
export function getNextStep(status: ProjectStatus): {
  path: string;
  label: string;
  description: string;
} | null {
  const stepMap: Record<ProjectStatus, { path: string; label: string; description: string } | null> = {
    DRAFT: {
      path: 'setup',
      label: 'Setup Interviewee',
      description: 'Add information about who you\'re interviewing',
    },
    RECORDING_INFO: {
      path: 'questions',
      label: 'Generate Questions',
      description: 'Create personalized interview questions',
    },
    QUESTIONS_GENERATED: {
      path: 'upload',
      label: 'Upload Audio',
      description: 'Upload your interview recording',
    },
    AUDIO_UPLOADED: null,
    TRANSCRIBING: null,
    TRANSCRIPTION_COMPLETE: {
      path: 'narrative',
      label: 'Generate Story',
      description: 'Create a written narrative',
    },
    GENERATING_NARRATIVE: null,
    NARRATIVE_COMPLETE: {
      path: 'narrative',
      label: 'View & Download',
      description: 'View and download your story',
    },
    COMPLETE: {
      path: 'narrative',
      label: 'View Story',
      description: 'View your completed story',
    },
    ERROR: null,
  };

  return stepMap[status] || null;
}

/**
 * Get the current step number based on project status (for progress indicators)
 */
export function getStepNumber(status: ProjectStatus): number {
  const stepOrder: Record<ProjectStatus, number> = {
    DRAFT: 1,
    RECORDING_INFO: 1,
    QUESTIONS_GENERATED: 2,
    AUDIO_UPLOADED: 3,
    TRANSCRIBING: 3,
    TRANSCRIPTION_COMPLETE: 3,
    GENERATING_NARRATIVE: 4,
    NARRATIVE_COMPLETE: 4,
    COMPLETE: 4,
    ERROR: 0,
  };

  return stepOrder[status] || 0;
}

/**
 * Get progress percentage based on project status
 */
export function getProgressPercentage(status: ProjectStatus): number {
  const progressMap: Record<ProjectStatus, number> = {
    DRAFT: 0,
    RECORDING_INFO: 10,
    QUESTIONS_GENERATED: 25,
    AUDIO_UPLOADED: 40,
    TRANSCRIBING: 55,
    TRANSCRIPTION_COMPLETE: 70,
    GENERATING_NARRATIVE: 85,
    NARRATIVE_COMPLETE: 95,
    COMPLETE: 100,
    ERROR: 0,
  };

  return progressMap[status] || 0;
}

/**
 * Check if project is in a processing state (user should wait)
 */
export function isProcessing(status: ProjectStatus): boolean {
  return ['TRANSCRIBING', 'GENERATING_NARRATIVE'].includes(status);
}

/**
 * Check if project has encountered an error
 */
export function hasError(status: ProjectStatus): boolean {
  return status === 'ERROR';
}

/**
 * Check if project is complete
 */
export function isComplete(status: ProjectStatus): boolean {
  return ['NARRATIVE_COMPLETE', 'COMPLETE'].includes(status);
}

/**
 * Get user-friendly message for current state
 */
export function getStateMessage(status: ProjectStatus): string {
  const messages: Record<ProjectStatus, string> = {
    DRAFT: 'Get started by adding information about who you\'re interviewing.',
    RECORDING_INFO: 'Complete the interviewee setup to continue.',
    QUESTIONS_GENERATED: 'Your interview questions are ready! Now upload your audio recording.',
    AUDIO_UPLOADED: 'Audio uploaded successfully. Transcription will begin shortly.',
    TRANSCRIBING: 'We\'re transcribing your audio. This usually takes 1-2 minutes.',
    TRANSCRIPTION_COMPLETE: 'Transcription complete! Ready to generate your narrative.',
    GENERATING_NARRATIVE: 'Creating your story narrative. This takes about 15-30 seconds.',
    NARRATIVE_COMPLETE: 'Your story is complete! Download it in PDF, DOCX, or TXT format.',
    COMPLETE: 'Project complete. Your story is ready to share with your family.',
    ERROR: 'Something went wrong. Please try again or contact support if the issue persists.',
  };

  return messages[status] || '';
}

// Export types
export type { ProjectStatus };
