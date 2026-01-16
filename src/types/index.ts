// Re-export Prisma types for convenience
export type {
  User,
  Project,
  Interviewee,
  InterviewQuestion,
  InterviewSession,
  Transcription,
  Narrative,
  Audiobook,
  Job,
  Payment,
  AuditLog,
} from '@prisma/client'

export type {
  ProjectStatus,
  SessionStatus,
  NarrativeStatus,
  JobType,
  JobStatus,
  PaymentStatus,
} from '@prisma/client'

// Custom types
export interface ProjectWithRelations {
  id: string
  title: string
  status: string
  createdAt: Date
  updatedAt: Date
  interviewee?: {
    name: string
    relationship: string
  } | null
  sessions: {
    id: string
    status: string
  }[]
  narrative?: {
    id: string
    status: string
    wordCount: number | null
  } | null
  jobs: {
    id: string
    type: string
    status: string
    progress: number
  }[]
}

export interface IntervieweeInput {
  name: string
  relationship: string
  birthYear?: number
  generation?: string
  topics: string[]
  notes?: string
}

export interface QuestionGenerationInput {
  intervieweeData: IntervieweeInput
  questionCount?: number
}
