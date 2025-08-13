// Database Types for ATS Platform
// Generated from Supabase schema - matches database structure exactly

import { BaseEntity } from './common'

// Enum types matching database
export type UserRole = 'admin' | 'candidate'
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived'
export type ApplicationStatus = 
  | 'applied'
  | 'assessment_submitted'
  | 'ai_reviewed'
  | 'shortlisted'
  | 'manual_review'
  | 'paid_assignment'
  | 'live_assignment'
  | 'hired'
  | 'rejected'
  | 'terminated'

export type AssessmentType = 'writing_prompt' | 'skills_test' | 'portfolio_review'
export type MessageType = 'candidate_message' | 'admin_message' | 'system_notification'
export type WebhookEvent = 
  | 'job_published'
  | 'application_created'
  | 'assessment_submitted'
  | 'application_status_changed'
  | 'candidate_hired'
  | 'candidate_rejected'

export type CompensationFrequency = 'per_word' | 'per_article' | 'per_hour' | 'per_project' | 'monthly'
export type WorkType = 'full_time' | 'part_time' | 'contract' | 'freelance'

// Core database tables

export interface Tenant extends BaseEntity {
  name: string
  slug: string
  domain?: string
  custom_domain?: string
  is_active: boolean
  subscription_plan: string
  subscription_expires_at?: Date
  settings: Record<string, any>
}

export interface BrandingSettings extends BaseEntity {
  tenant_id: string
  logo_url?: string
  favicon_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  company_name?: string
  tagline?: string
  website_url?: string
  social_links: Record<string, string>
  email_sender_name?: string
  email_sender_address?: string
  custom_css?: string
}

export interface User extends BaseEntity {
  tenant_id: string
  clerk_id: string
  email: string
  first_name?: string
  last_name?: string
  profile_image_url?: string
  role: UserRole
  is_active: boolean
  last_login_at?: Date
  email_verified_at?: Date
  phone?: string
  timezone: string
  locale: string
  metadata: Record<string, any>
  
  // Computed properties
  full_name?: string
  display_name?: string
}

export interface Job extends BaseEntity {
  tenant_id: string
  title: string
  slug: string
  description: string
  responsibilities: string[]
  requirements: string[]
  preferred_qualifications: string[]
  work_type: WorkType
  is_remote: boolean
  location_city?: string
  location_country?: string
  compensation_min?: number
  compensation_max?: number
  compensation_currency: string
  compensation_frequency: CompensationFrequency
  experience_level: string
  sample_topics: string[]
  status: JobStatus
  assessment_prompt?: string
  assessment_word_count_min?: number
  assessment_word_count_max?: number
  assessment_time_limit_hours?: number
  ai_scoring_threshold: number
  auto_reply_template?: string
  application_deadline?: Date
  posted_by?: string
  posted_at?: Date
  views_count: number
  applications_count: number
  seo_title?: string
  seo_description?: string
  tags: string[]
  external_job_id?: string
  
  // Relations
  tenant?: Tenant
  posted_by_user?: User
  applications?: Application[]
}

export interface Application extends BaseEntity {
  tenant_id: string
  job_id: string
  candidate_id: string
  status: ApplicationStatus
  cover_letter?: string
  resume_file_id?: string
  portfolio_url?: string
  desired_compensation_amount?: number
  desired_compensation_frequency?: CompensationFrequency
  desired_compensation_currency: string
  availability_date?: Date
  location_city?: string
  location_country?: string
  time_zone?: string
  years_experience?: number
  languages: Language[]
  specialties: string[]
  ai_composite_score?: number
  ai_scores?: AIScores
  ai_analysis?: Record<string, any>
  is_shortlisted: boolean
  shortlisted_at?: Date
  rejected_at?: Date
  rejection_reason?: string
  hired_at?: Date
  external_candidate_id?: string
  metadata: Record<string, any>
  
  // Relations
  tenant?: Tenant
  job?: Job
  candidate?: User
  assessment?: Assessment
  messages?: Message[]
}

export interface Assessment extends BaseEntity {
  tenant_id: string
  application_id: string
  type: AssessmentType
  prompt: string
  submission_content?: string
  word_count?: number
  submission_files: FileReference[]
  ai_plagiarism_checked: boolean
  no_ai_attestation: boolean
  submitted_at?: Date
  time_spent_minutes?: number
  reading_level_score?: number
  writing_quality_score?: number
  seo_score?: number
  english_proficiency_score?: number
  ai_detection_score?: number
  composite_score?: number
  score_breakdown?: Record<string, any>
  ai_feedback?: string
  manual_feedback?: string
  
  // Relations
  tenant?: Tenant
  application?: Application
}

export interface Message extends BaseEntity {
  tenant_id: string
  application_id: string
  thread_id: string
  sender_id: string
  recipient_id: string
  type: MessageType
  subject?: string
  content: string
  attachments: FileReference[]
  is_read: boolean
  read_at?: Date
  is_system_generated: boolean
  parent_message_id?: string
  email_sent: boolean
  email_sent_at?: Date
  
  // Relations
  tenant?: Tenant
  application?: Application
  sender?: User
  recipient?: User
  parent_message?: Message
}

export interface FileAttachment extends BaseEntity {
  tenant_id: string
  user_id: string
  file_name: string
  file_size: number
  file_type: string
  mime_type?: string
  storage_path: string
  public_url?: string
  is_virus_scanned: boolean
  virus_scan_result?: string
  virus_scanned_at?: Date
  entity_type?: string
  entity_id?: string
  metadata: Record<string, any>
  
  // Relations
  tenant?: Tenant
  user?: User
}

export interface APIKey extends BaseEntity {
  tenant_id: string
  name: string
  key_hash: string
  key_prefix: string
  permissions: string[]
  is_active: boolean
  last_used_at?: Date
  expires_at?: Date
  created_by?: string
  
  // Relations
  tenant?: Tenant
  created_by_user?: User
}

export interface Webhook extends BaseEntity {
  tenant_id: string
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  is_active: boolean
  headers: Record<string, string>
  retry_attempts: number
  timeout_seconds: number
  last_triggered_at?: Date
  failure_count: number
  created_by?: string
  
  // Relations
  tenant?: Tenant
  created_by_user?: User
  deliveries?: WebhookDelivery[]
}

export interface WebhookDelivery extends BaseEntity {
  webhook_id: string
  event_type: WebhookEvent
  payload: Record<string, any>
  response_status?: number
  response_body?: string
  response_time_ms?: number
  attempt_number: number
  success: boolean
  error_message?: string
  delivered_at: Date
  
  // Relations
  webhook?: Webhook
}

export interface AuditLog extends BaseEntity {
  tenant_id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  api_key_id?: string
  metadata: Record<string, any>
  
  // Relations
  tenant?: Tenant
  user?: User
  api_key?: APIKey
}

export interface EmailTemplate extends BaseEntity {
  tenant_id: string
  name: string
  subject: string
  html_content: string
  text_content?: string
  template_variables: string[]
  event_trigger?: string
  is_active: boolean
  created_by?: string
  
  // Relations
  tenant?: Tenant
  created_by_user?: User
}

// Supporting types

export interface Language {
  language: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
}

export interface FileReference {
  id: string
  file_name: string
  file_size: number
  file_type: string
  url?: string
}

export interface AIScores {
  reading_level: number
  seo_score: number
  english_proficiency: number
  ai_detection: number
}

export interface AIAnalysis {
  composite_score: number
  reading_level: {
    flesch_score: number
    flesch_kincaid_grade: number
    normalized_score: number
    word_count: number
    sentence_count: number
    avg_words_per_sentence: number
  }
  seo_analysis: {
    h1_count: number
    h2_count: number
    h3_count: number
    link_count: number
    bold_count: number
    italic_count: number
    word_count: number
    paragraph_count: number
    seo_score: number
    recommendations: string[]
  }
  english_proficiency: {
    word_count: number
    sentence_count: number
    avg_sentence_length: number
    complex_word_ratio: number
    vocabulary_complexity: number
    grammar_score: number
    proficiency_score: number
    proficiency_level: 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced'
  }
  ai_detection: {
    word_count: number
    unique_word_count: number
    repetition_score: number
    pattern_score: number
    complexity_score: number
    ai_likelihood: number
    confidence_level: 'Low' | 'Medium' | 'High'
    risk_factors: string[]
  }
  recommendations: string[]
  analyzed_at: Date
}

// Query and filter types

export interface JobFilters {
  status?: JobStatus[]
  work_type?: WorkType[]
  experience_level?: string[]
  is_remote?: boolean
  location_country?: string
  compensation_min?: number
  compensation_max?: number
  compensation_frequency?: CompensationFrequency
  tags?: string[]
  search_query?: string
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  job_id?: string
  candidate_id?: string
  is_shortlisted?: boolean
  ai_score_min?: number
  ai_score_max?: number
  years_experience_min?: number
  years_experience_max?: number
  location_country?: string
  specialties?: string[]
  date_from?: Date
  date_to?: Date
  search_query?: string
}

export interface MessageFilters {
  application_id?: string
  thread_id?: string
  sender_id?: string
  recipient_id?: string
  type?: MessageType
  is_read?: boolean
  date_from?: Date
  date_to?: Date
}

// Analytics types

export interface ApplicationMetrics {
  total_applications: number
  new_applications_today: number
  applications_by_status: Record<ApplicationStatus, number>
  average_ai_score: number
  shortlist_rate: number
  hire_rate: number
  applications_by_job: Array<{
    job_id: string
    job_title: string
    count: number
  }>
  applications_over_time: Array<{
    date: string
    count: number
  }>
}

export interface AIMetrics {
  total_assessments: number
  average_scores: {
    composite: number
    reading_level: number
    seo: number
    english_proficiency: number
    ai_detection_risk: number
  }
  risk_analysis: {
    high_ai_risk_count: number
    high_ai_risk_percentage: number
  }
  auto_shortlisted_count: number
  auto_shortlist_rate: number
}

export interface TenantMetrics {
  total_jobs: number
  active_jobs: number
  total_applications: number
  total_candidates: number
  hired_candidates: number
  average_time_to_hire: number
  top_specialties: Array<{
    specialty: string
    count: number
  }>
  performance_trends: {
    applications: Array<{ date: string; count: number }>
    hires: Array<{ date: string; count: number }>
  }
}

// API Response types

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  total_count: number
  page: number
  page_size: number
  has_next: boolean
  has_previous: boolean
}

export interface DatabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

// Function parameter types

export interface SetTenantContextParams {
  tenant_id: string
  user_id?: string
}

export interface ValidateTenantAccessParams {
  clerk_user_id: string
  tenant_slug: string
}

export interface ValidateTenantAccessResult {
  tenant_id: string
  user_id: string
  user_role: UserRole
  is_active: boolean
}

export interface GetUserPermissionsResult {
  can_manage_jobs: boolean
  can_manage_candidates: boolean
  can_manage_settings: boolean
  can_view_analytics: boolean
  can_manage_webhooks: boolean
}

export interface GetAIScoringStatsParams {
  tenant_id: string
  start_date?: Date
  end_date?: Date
}

// Storage bucket types

export type StorageBucket = 'resumes' | 'portfolios' | 'assessments' | 'attachments' | 'branding'

export interface FileUploadConfig {
  bucket: StorageBucket
  max_size: number
  allowed_types: string[]
  virus_scan: boolean
}

// Webhook payload types

export interface JobPublishedPayload {
  event: 'job_published'
  tenant_id: string
  job: Job
  published_at: Date
}

export interface ApplicationCreatedPayload {
  event: 'application_created'
  tenant_id: string
  application: Application
  job: Job
  candidate: User
}

export interface AssessmentSubmittedPayload {
  event: 'assessment_submitted'
  tenant_id: string
  assessment: Assessment
  application: Application
  job: Job
  candidate: User
}

export interface ApplicationStatusChangedPayload {
  event: 'application_status_changed'
  tenant_id: string
  application: Application
  previous_status: ApplicationStatus
  new_status: ApplicationStatus
  changed_by: User
}

export interface CandidateHiredPayload {
  event: 'candidate_hired'
  tenant_id: string
  application: Application
  job: Job
  candidate: User
  hired_by: User
}

export interface CandidateRejectedPayload {
  event: 'candidate_rejected'
  tenant_id: string
  application: Application
  job: Job
  candidate: User
  rejected_by: User
  rejection_reason?: string
}

export type WebhookPayload = 
  | JobPublishedPayload
  | ApplicationCreatedPayload
  | AssessmentSubmittedPayload
  | ApplicationStatusChangedPayload
  | CandidateHiredPayload
  | CandidateRejectedPayload

// Export all types
export * from './common'