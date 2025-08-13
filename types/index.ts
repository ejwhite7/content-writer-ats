import { 
  BaseEntity, 
  ContactInfo, 
  Address, 
  WorkExperience, 
  Education, 
  Skill, 
  Certification,
  FileUpload,
  JobStatus,
  ApplicationStatus,
  UserRole 
} from './common'

// User Management Types
export interface User extends BaseEntity {
  clerkId: string
  email: string
  firstName: string
  lastName: string
  profileImage?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  metadata?: Record<string, any>
}

export interface UserProfile extends BaseEntity {
  userId: string
  bio?: string
  contactInfo: ContactInfo
  address?: Address
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    emailNotifications: boolean
  }
}

// Job Management Types
export interface Job extends BaseEntity {
  title: string
  company: string
  department?: string
  location: Address
  workType: 'full-time' | 'part-time' | 'contract' | 'internship'
  workMode: 'remote' | 'hybrid' | 'onsite'
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  status: JobStatus
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits?: string[]
  skills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  educationRequired?: string
  applicationDeadline?: Date
  startDate?: Date
  postedBy: string
  applicationsCount: number
  viewsCount: number
  summary?: string
  tags?: string[]
}

export interface JobApplication extends BaseEntity {
  jobId: string
  candidateId: string
  status: ApplicationStatus
  appliedAt: Date
  resumeFileId?: string
  coverLetter?: string
  answers?: Record<string, any>
  notes?: string
  feedback?: string
  interviewDate?: Date
  salary?: {
    expected: number
    offered?: number
    currency: string
  }
  metadata?: Record<string, any>
  
  // Relations
  job?: Job
  candidate?: Candidate
}

// Candidate Management Types
export interface Candidate extends BaseEntity {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  contactInfo: ContactInfo
  address?: Address
  
  // Professional Information
  currentPosition?: string
  currentCompany?: string
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  expectedSalary?: {
    amount: number
    currency: string
  }
  availability?: Date
  
  // Profile Details
  bio?: string
  summary?: string
  skills: Skill[]
  workExperience: WorkExperience[]
  education: Education[]
  certifications: Certification[]
  languages?: {
    language: string
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
  }[]
  
  // Files and Documents
  resumeFileId?: string
  portfolioFiles?: FileUpload[]
  
  // Preferences
  jobPreferences?: {
    workType: ('full-time' | 'part-time' | 'contract' | 'internship')[]
    workMode: ('remote' | 'hybrid' | 'onsite')[]
    preferredLocations: string[]
    salaryRange?: {
      min: number
      max: number
      currency: string
    }
  }
  
  // Analytics
  profileViews: number
  applicationCount: number
  
  // Relations
  user?: User
  applications?: JobApplication[]
}

// Interview Management Types
export interface Interview extends BaseEntity {
  applicationId: string
  interviewerIds: string[]
  scheduledAt: Date
  duration: number // in minutes
  type: 'phone' | 'video' | 'in-person' | 'technical'
  location?: string
  meetingUrl?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  notes?: string
  feedback?: {
    rating: number
    comments: string
    recommendation: 'hire' | 'reject' | 'maybe'
  }
  questions?: {
    question: string
    answer?: string
    rating?: number
  }[]
  
  // Relations
  application?: JobApplication
  interviewers?: User[]
}

// Assessment and Screening Types
export interface Assessment extends BaseEntity {
  jobId: string
  title: string
  description?: string
  type: 'technical' | 'personality' | 'cognitive' | 'skills'
  questions: AssessmentQuestion[]
  timeLimit?: number // in minutes
  passingScore?: number
  isActive: boolean
  
  // Relations
  job?: Job
  submissions?: AssessmentSubmission[]
}

export interface AssessmentQuestion {
  id: string
  type: 'multiple-choice' | 'text' | 'code' | 'file-upload'
  question: string
  options?: string[]
  correctAnswer?: string
  points: number
  timeLimit?: number
}

export interface AssessmentSubmission extends BaseEntity {
  assessmentId: string
  candidateId: string
  applicationId: string
  answers: Record<string, any>
  score?: number
  completedAt?: Date
  timeSpent?: number // in minutes
  
  // Relations
  assessment?: Assessment
  candidate?: Candidate
  application?: JobApplication
}

// AI and Screening Types
export interface AIScreeningResult extends BaseEntity {
  applicationId: string
  candidateId: string
  jobId: string
  overallScore: number
  skillsMatch: {
    skill: string
    score: number
    required: boolean
  }[]
  experienceMatch: {
    category: string
    yearsRequired: number
    yearsCandidate: number
    score: number
  }[]
  educationMatch?: {
    required: string
    candidate: string
    score: number
  }
  redFlags?: string[]
  strengths: string[]
  recommendations: string[]
  confidence: number
  processingTime: number
  
  // Relations
  application?: JobApplication
  candidate?: Candidate
  job?: Job
}

// Analytics and Reporting Types
export interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  newApplicationsToday: number
  interviewsScheduled: number
  offersExtended: number
  hiredCandidates: number
  averageTimeToHire: number
  topSkills: { skill: string; count: number }[]
  applicationsByStatus: { status: ApplicationStatus; count: number }[]
  jobsByDepartment: { department: string; count: number }[]
  hiringFunnel: {
    applied: number
    screening: number
    interview: number
    offer: number
    hired: number
  }
}

export interface AnalyticsData {
  timeRange: string
  metrics: {
    applications: { date: string; count: number }[]
    hires: { date: string; count: number }[]
    rejections: { date: string; count: number }[]
    interviews: { date: string; count: number }[]
  }
  demographics: {
    gender: { label: string; value: number }[]
    experience: { label: string; value: number }[]
    education: { label: string; value: number }[]
    location: { label: string; value: number }[]
  }
  performance: {
    timeToHire: number
    costPerHire: number
    sourceEffectiveness: { source: string; applications: number; hires: number }[]
    interviewToOfferRatio: number
  }
}

// Communication and Messaging Types
export interface Message extends BaseEntity {
  fromUserId: string
  toUserId: string
  subject?: string
  content: string
  isRead: boolean
  messageType: 'email' | 'notification' | 'system'
  relatedEntityType?: string
  relatedEntityId?: string
  
  // Relations
  fromUser?: User
  toUser?: User
}

export interface EmailTemplate extends BaseEntity {
  name: string
  subject: string
  content: string
  type: 'application_received' | 'interview_scheduled' | 'offer_extended' | 'rejection' | 'custom'
  variables: string[]
  isActive: boolean
}

// System and Configuration Types
export interface SystemSettings extends BaseEntity {
  key: string
  value: any
  category: string
  description?: string
  isPublic: boolean
}

export interface AuditLog extends BaseEntity {
  userId: string
  action: string
  entityType: string
  entityId: string
  changes?: Record<string, { old: any; new: any }>
  ipAddress?: string
  userAgent?: string
  
  // Relations
  user?: User
}

// Export all types
export * from './common'