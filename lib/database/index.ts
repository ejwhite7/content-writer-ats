// Database utility functions for ATS Platform
// Provides typed database operations with tenant context management

import { createClient } from '@supabase/supabase-js'
import { 
  Tenant, 
  User, 
  Job, 
  Application, 
  Assessment, 
  Message,
  FileAttachment,
  Webhook,
  AuditLog,
  EmailTemplate,
  ApplicationFilters,
  JobFilters,
  SetTenantContextParams,
  ValidateTenantAccessParams,
  ValidateTenantAccessResult,
  PaginatedResponse,
  DatabaseResponse,
  AIMetrics,
  ApplicationMetrics
} from '@/types/database'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Database context management
export class DatabaseContext {
  private static instance: DatabaseContext
  private currentTenantId: string | null = null
  private currentUserId: string | null = null

  static getInstance(): DatabaseContext {
    if (!DatabaseContext.instance) {
      DatabaseContext.instance = new DatabaseContext()
    }
    return DatabaseContext.instance
  }

  async setContext(params: SetTenantContextParams): Promise<void> {
    const { data, error } = await supabase.rpc('set_tenant_context', {
      tenant_id: params.tenant_id,
      user_id: params.user_id || null
    })

    if (error) {
      throw new Error(`Failed to set tenant context: ${error.message}`)
    }

    this.currentTenantId = params.tenant_id
    this.currentUserId = params.user_id || null
  }

  async clearContext(): Promise<void> {
    const { error } = await supabase.rpc('clear_context')
    if (error) {
      throw new Error(`Failed to clear context: ${error.message}`)
    }

    this.currentTenantId = null
    this.currentUserId = null
  }

  getCurrentTenantId(): string | null {
    return this.currentTenantId
  }

  getCurrentUserId(): string | null {
    return this.currentUserId
  }
}

// Tenant operations
export class TenantService {
  static async validateAccess(params: ValidateTenantAccessParams): Promise<ValidateTenantAccessResult | null> {
    const { data, error } = await supabase.rpc('validate_tenant_access', {
      clerk_user_id: params.clerk_user_id,
      tenant_slug: params.tenant_slug
    })

    if (error || !data || data.length === 0) {
      return null
    }

    return data[0] as ValidateTenantAccessResult
  }

  static async getTenant(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Tenant
  }

  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null
    return data as Tenant
  }
}

// User operations
export class UserService {
  static async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as User
  }

  static async getUserByClerkId(clerkId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()

    if (error) return null
    return data as User
  }

  static async createUser(userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) return null
    return data as User
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return null
    return data as User
  }
}

// Job operations
export class JobService {
  static async getJobs(filters: JobFilters = {}, page = 1, pageSize = 20): Promise<PaginatedResponse<Job>> {
    let query = supabase
      .from('jobs')
      .select('*, tenant!inner(*), posted_by_user:users!posted_by(*)', { count: 'exact' })

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status)
    }
    
    if (filters.work_type?.length) {
      query = query.in('work_type', filters.work_type)
    }

    if (filters.is_remote !== undefined) {
      query = query.eq('is_remote', filters.is_remote)
    }

    if (filters.experience_level?.length) {
      query = query.in('experience_level', filters.experience_level)
    }

    if (filters.search_query) {
      query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`)
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags)
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }

    return {
      data: data as Job[],
      count: data?.length || 0,
      total_count: count || 0,
      page,
      page_size: pageSize,
      has_next: (count || 0) > to + 1,
      has_previous: page > 1
    }
  }

  static async getJob(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, tenant(*), posted_by_user:users!posted_by(*)')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Job
  }

  static async getPublicJobBoard(tenantSlug: string, page = 1, pageSize = 20): Promise<any> {
    const { data, error } = await supabase.rpc('get_public_job_board', {
      tenant_slug: tenantSlug,
      limit_count: pageSize,
      offset_count: (page - 1) * pageSize
    })

    if (error) {
      throw new Error(`Failed to fetch public job board: ${error.message}`)
    }

    return data
  }

  static async createJob(jobData: Partial<Job>): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) return null
    return data as Job
  }

  static async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return null
    return data as Job
  }
}

// Application operations
export class ApplicationService {
  static async getApplications(filters: ApplicationFilters = {}, page = 1, pageSize = 20): Promise<PaginatedResponse<Application>> {
    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*),
        candidate:users!candidate_id(*),
        assessment:assessments(*)
      `, { count: 'exact' })

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status)
    }

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }

    if (filters.candidate_id) {
      query = query.eq('candidate_id', filters.candidate_id)
    }

    if (filters.is_shortlisted !== undefined) {
      query = query.eq('is_shortlisted', filters.is_shortlisted)
    }

    if (filters.ai_score_min !== undefined) {
      query = query.gte('ai_composite_score', filters.ai_score_min)
    }

    if (filters.ai_score_max !== undefined) {
      query = query.lte('ai_composite_score', filters.ai_score_max)
    }

    if (filters.specialties?.length) {
      query = query.overlaps('specialties', filters.specialties)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from.toISOString())
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to.toISOString())
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`)
    }

    return {
      data: data as Application[],
      count: data?.length || 0,
      total_count: count || 0,
      page,
      page_size: pageSize,
      has_next: (count || 0) > to + 1,
      has_previous: page > 1
    }
  }

  static async getApplication(id: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*),
        candidate:users!candidate_id(*),
        assessment:assessments(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data as Application
  }

  static async createApplication(applicationData: any): Promise<any> {
    const { data, error } = await supabase.rpc('create_application', applicationData)

    if (error) {
      throw new Error(`Failed to create application: ${error.message}`)
    }

    return data
  }

  static async updateApplicationStatus(id: string, status: string, reason?: string, updatedBy?: string): Promise<any> {
    const { data, error } = await supabase.rpc('update_application_status', {
      p_application_id: id,
      p_new_status: status,
      p_reason: reason || null,
      p_updated_by: updatedBy || null
    })

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`)
    }

    return data
  }
}

// Assessment operations
export class AssessmentService {
  static async getAssessment(id: string): Promise<Assessment | null> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*, application:applications(*, job:jobs(*), candidate:users!candidate_id(*))')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Assessment
  }

  static async submitAssessment(assessmentData: any): Promise<any> {
    const { data, error } = await supabase.rpc('submit_assessment', assessmentData)

    if (error) {
      throw new Error(`Failed to submit assessment: ${error.message}`)
    }

    return data
  }

  static async calculateAIScore(assessmentId: string): Promise<any> {
    const { data, error } = await supabase.rpc('calculate_ai_assessment_score', {
      assessment_id: assessmentId
    })

    if (error) {
      throw new Error(`Failed to calculate AI score: ${error.message}`)
    }

    return data
  }
}

// Message operations
export class MessageService {
  static async getMessages(applicationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return data as Message[]
  }

  static async createMessage(messageData: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)')
      .single()

    if (error) return null
    return data as Message
  }

  static async markMessageAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    return !error
  }
}

// File operations
export class FileService {
  static async uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) return null
    return data.path
  }

  static async getFileUrl(bucket: string, path: string): Promise<string | null> {
    const { data } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  static async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) return null
    return data.signedUrl
  }

  static async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return !error
  }
}

// Analytics operations
export class AnalyticsService {
  static async getApplicationMetrics(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<ApplicationMetrics> {
    // This would typically call a database function or aggregate queries
    // For now, we'll implement basic aggregations
    
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*, job:jobs(title)')
      .eq('tenant_id', tenantId)
      .gte('created_at', dateFrom?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', dateTo?.toISOString() || new Date().toISOString())

    if (error) {
      throw new Error(`Failed to fetch application metrics: ${error.message}`)
    }

    // Process data to create metrics
    const totalApplications = applications.length
    const newApplicationsToday = applications.filter(app => 
      new Date(app.created_at).toDateString() === new Date().toDateString()
    ).length

    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageAiScore = applications
      .filter(app => app.ai_composite_score)
      .reduce((sum, app) => sum + app.ai_composite_score, 0) / 
      applications.filter(app => app.ai_composite_score).length || 0

    return {
      total_applications: totalApplications,
      new_applications_today: newApplicationsToday,
      applications_by_status: applicationsByStatus,
      average_ai_score: averageAiScore,
      shortlist_rate: applications.filter(app => app.is_shortlisted).length / totalApplications,
      hire_rate: applications.filter(app => app.status === 'hired').length / totalApplications,
      applications_by_job: [], // Would be implemented with proper aggregation
      applications_over_time: [] // Would be implemented with proper time series data
    }
  }

  static async getAIMetrics(tenantId: string, startDate?: Date, endDate?: Date): Promise<AIMetrics> {
    const { data, error } = await supabase.rpc('get_ai_scoring_stats', {
      tenant_id: tenantId,
      start_date: startDate?.toISOString().split('T')[0] || null,
      end_date: endDate?.toISOString().split('T')[0] || null
    })

    if (error) {
      throw new Error(`Failed to fetch AI metrics: ${error.message}`)
    }

    return data as AIMetrics
  }
}

// Webhook operations
export class WebhookService {
  static async getWebhooks(tenantId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch webhooks: ${error.message}`)
    }

    return data as Webhook[]
  }

  static async createWebhook(webhookData: Partial<Webhook>): Promise<Webhook | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .insert(webhookData)
      .select()
      .single()

    if (error) return null
    return data as Webhook
  }

  static async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return null
    return data as Webhook
  }

  static async deleteWebhook(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)

    return !error
  }
}

// Export database context for use throughout the application
export const dbContext = DatabaseContext.getInstance()

// Helper function to ensure tenant context is set
export async function withTenantContext<T>(
  tenantId: string,
  userId: string | null,
  operation: () => Promise<T>
): Promise<T> {
  await dbContext.setContext({ tenant_id: tenantId, user_id: userId || undefined })
  try {
    return await operation()
  } finally {
    await dbContext.clearContext()
  }
}

export {
  supabase as db
}