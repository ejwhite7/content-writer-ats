import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Complete database type structure
interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          domain?: string
          custom_domain?: string
          is_active: boolean
          subscription_plan: string
          subscription_expires_at?: string
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          clerk_id: string
          email: string
          first_name?: string
          last_name?: string
          profile_image_url?: string
          role: 'admin' | 'candidate'
          is_active: boolean
          last_login_at?: string
          email_verified_at?: string
          phone?: string
          timezone: string
          locale: string
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          tenant_id: string
          title: string
          slug: string
          description: string
          responsibilities: string[]
          requirements: string[]
          preferred_qualifications: string[]
          work_type: 'full_time' | 'part_time' | 'contract' | 'freelance'
          is_remote: boolean
          location_city?: string
          location_country?: string
          compensation_min?: number
          compensation_max?: number
          compensation_currency: string
          compensation_frequency: 'per_word' | 'per_article' | 'per_hour' | 'per_project' | 'monthly'
          experience_level: string
          sample_topics: string[]
          status: 'draft' | 'published' | 'closed' | 'archived'
          assessment_prompt?: string
          assessment_word_count_min?: number
          assessment_word_count_max?: number
          assessment_time_limit_hours?: number
          ai_scoring_threshold: number
          auto_reply_template?: string
          application_deadline?: string
          posted_by?: string
          posted_at?: string
          views_count: number
          applications_count: number
          seo_title?: string
          seo_description?: string
          tags: string[]
          external_job_id?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      applications: {
        Row: {
          id: string
          tenant_id: string
          job_id: string
          candidate_id: string
          status: 'applied' | 'assessment_submitted' | 'ai_reviewed' | 'shortlisted' | 'manual_review' | 'paid_assignment' | 'live_assignment' | 'hired' | 'rejected' | 'terminated'
          cover_letter?: string
          resume_file_id?: string
          portfolio_url?: string
          desired_compensation_amount?: number
          desired_compensation_frequency?: 'per_word' | 'per_article' | 'per_hour' | 'per_project' | 'monthly'
          desired_compensation_currency: string
          availability_date?: string
          location_city?: string
          location_country?: string
          time_zone?: string
          years_experience?: number
          languages: Array<{ language: string; proficiency: string }>
          specialties: string[]
          ai_composite_score?: number
          ai_scores?: Record<string, number>
          ai_analysis?: Record<string, any>
          is_shortlisted: boolean
          shortlisted_at?: string
          rejected_at?: string
          rejection_reason?: string
          hired_at?: string
          external_candidate_id?: string
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      messages: {
        Row: {
          id: string
          tenant_id: string
          application_id: string
          thread_id: string
          sender_id: string
          recipient_id: string
          type: 'candidate_message' | 'admin_message' | 'system_notification'
          subject?: string
          content: string
          attachments: Array<{ id: string; file_name: string; file_size: number; file_type: string; url?: string }>
          is_read: boolean
          read_at?: string
          is_system_generated: boolean
          parent_message_id?: string
          email_sent: boolean
          email_sent_at?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      assessments: {
        Row: {
          id: string
          tenant_id: string
          application_id: string
          type: 'writing_prompt' | 'skills_test' | 'portfolio_review'
          prompt: string
          submission_content?: string
          word_count?: number
          submission_files: Array<{ id: string; file_name: string; file_size: number; file_type: string; url?: string }>
          ai_plagiarism_checked: boolean
          no_ai_attestation: boolean
          submitted_at?: string
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>
      }
      email_templates: {
        Row: {
          id: string
          tenant_id?: string
          name: string
          subject: string
          html_content: string
          text_content?: string
          template_variables?: string[]
          event_trigger?: string
          is_active: boolean
          created_at: string
          updated_at: string
          created_by?: string
        }
        Insert: Omit<Database['public']['Tables']['email_templates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['email_templates']['Insert']>
      }
      branding_settings: {
        Row: {
          id: string
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['branding_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['branding_settings']['Insert']>
      }
      email_logs: {
        Row: {
          id: string
          template_name: string
          recipient_email: string
          subject: string
          resend_id?: string
          tenant_id?: string
          sent_at: string
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['email_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['email_logs']['Insert']>
      }
    }
  }
}

export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )
}

// For admin operations that bypass RLS
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )
}