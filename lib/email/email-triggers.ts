import { EmailService } from './email-service'
import { createClient } from '../supabase/server'
import type { Application, Assessment, Message, Job, User, Tenant } from '../../types/database'

// Type for application data with joined relations
interface ApplicationWithRelations extends Application {
  jobs: Job & {
    tenant_id: string
  }
  users: User
  tenants: Tenant
}

// Type for assessment data with joined relations
interface AssessmentWithRelations {
  id: string
  composite_score?: number
  applications: Application & {
    id: string
    stage: string
    jobs: Job & {
      job_settings?: {
        shortlist_threshold?: number
      }
    }
    users: User
  }
}

// Type for message data with joined relations
interface MessageWithRelations {
  id: string
  sender_id: string
  content: string
  applications: Application & {
    id: string
    user_id: string
    jobs: Job & {
      title: string
      tenant_id: string
    }
    users: User
    tenants: Tenant
  }
}

// Email context interface for templates
interface EmailContext {
  candidateName: string
  jobTitle: string
  companyName: string
  applicationUrl: string
  assessmentUrl?: string
  adminUrl?: string
  aiScore?: number
  reason?: string
  messageContent?: string
}

export class EmailTriggers {
  private emailService: EmailService
  private supabase = createClient()

  constructor() {
    this.emailService = new EmailService()
  }

  async onApplicationSubmitted(applicationId: string): Promise<void> {
    try {
      // Get application details
      const { data: application, error } = await this.supabase
        .from('applications')
        .select(`
          *,
          jobs (title, tenant_id),
          users (first_name, last_name, email),
          tenants (name)
        `)
        .eq('id', applicationId)
        .single()

      if (error || !application) {
        console.error('Error fetching application for email:', error)
        return
      }

      const typedApplication = application as ApplicationWithRelations

      const context: EmailContext = {
        candidateName: `${typedApplication.users.first_name} ${typedApplication.users.last_name}`,
        jobTitle: typedApplication.jobs.title,
        companyName: typedApplication.tenants.name,
        applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications/${applicationId}`
      }

      // Send confirmation email to candidate
      await this.emailService.sendApplicationConfirmation(
        typedApplication.users.email,
        context
      )

      // Send alert to admin
      const { data: adminUsers } = await this.supabase
        .from('users')
        .select('email')
        .eq('tenant_id', typedApplication.jobs.tenant_id)
        .eq('role', 'admin')

      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          await this.emailService.sendAdminApplicationAlert(
            admin.email,
            {
              ...context,
              adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${applicationId}`
            }
          )
        }
      }
    } catch (error) {
      console.error('Error in onApplicationSubmitted:', error)
    }
  }

  async onAssessmentRequired(applicationId: string): Promise<void> {
    try {
      const { data: application, error } = await this.supabase
        .from('applications')
        .select(`
          *,
          jobs (title, tenant_id),
          users (first_name, last_name, email),
          tenants (name)
        `)
        .eq('id', applicationId)
        .single()

      if (error || !application) {
        console.error('Error fetching application for assessment email:', error)
        return
      }

      const typedApplication = application as ApplicationWithRelations

      const context: EmailContext = {
        candidateName: `${typedApplication.users.first_name} ${typedApplication.users.last_name}`,
        jobTitle: typedApplication.jobs.title,
        companyName: typedApplication.tenants.name,
        applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications/${applicationId}`,
        assessmentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications/${applicationId}/assessment`
      }

      await this.emailService.sendAssessmentInvitation(
        typedApplication.users.email,
        context
      )
    } catch (error) {
      console.error('Error in onAssessmentRequired:', error)
    }
  }

  async onCandidateShortlisted(applicationId: string, aiScore: number): Promise<void> {
    try {
      const { data: application, error } = await this.supabase
        .from('applications')
        .select(`
          *,
          jobs (title, tenant_id),
          users (first_name, last_name, email),
          tenants (name)
        `)
        .eq('id', applicationId)
        .single()

      if (error || !application) {
        console.error('Error fetching application for shortlist email:', error)
        return
      }

      const typedApplication = application as ApplicationWithRelations

      const context: EmailContext = {
        candidateName: `${typedApplication.users.first_name} ${typedApplication.users.last_name}`,
        jobTitle: typedApplication.jobs.title,
        companyName: typedApplication.tenants.name,
        aiScore: aiScore,
        applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications/${applicationId}`
      }

      await this.emailService.sendShortlistNotification(
        typedApplication.users.email,
        context
      )
    } catch (error) {
      console.error('Error in onCandidateShortlisted:', error)
    }
  }

  async onCandidateRejected(applicationId: string, reason?: string): Promise<void> {
    try {
      const { data: application, error } = await this.supabase
        .from('applications')
        .select(`
          *,
          jobs (title, tenant_id),
          users (first_name, last_name, email),
          tenants (name)
        `)
        .eq('id', applicationId)
        .single()

      if (error || !application) {
        console.error('Error fetching application for rejection email:', error)
        return
      }

      const typedApplication = application as ApplicationWithRelations

      const context: EmailContext = {
        candidateName: `${typedApplication.users.first_name} ${typedApplication.users.last_name}`,
        jobTitle: typedApplication.jobs.title,
        companyName: typedApplication.tenants.name,
        reason: reason || 'We have decided to move forward with other candidates.',
        applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications/${applicationId}`
      }

      await this.emailService.sendRejectionNotification(
        typedApplication.users.email,
        context
      )
    } catch (error) {
      console.error('Error in onCandidateRejected:', error)
    }
  }

  async onMessageSent(messageId: string): Promise<void> {
    try {
      // Get message details
      const { data: message, error } = await this.supabase
        .from('messages')
        .select(`
          *,
          applications (
            id,
            user_id,
            jobs (title, tenant_id),
            users (first_name, last_name, email),
            tenants (name)
          )
        `)
        .eq('id', messageId)
        .single()

      if (error || !message) {
        console.error('Error fetching message for email notification:', error)
        return
      }

      const typedMessage = message as MessageWithRelations

      // Determine recipient (opposite of sender)
      let recipientEmail: string
      const candidateName = `${typedMessage.applications.users.first_name} ${typedMessage.applications.users.last_name}`

      if (typedMessage.sender_id === typedMessage.applications.user_id) {
        // Message from candidate to admin
        const { data: adminUsers } = await this.supabase
          .from('users')
          .select('email')
          .eq('tenant_id', typedMessage.applications.jobs.tenant_id)
          .eq('role', 'admin')
          .limit(1)

        if (!adminUsers || adminUsers.length === 0) return
        
        recipientEmail = adminUsers[0].email
      } else {
        // Message from admin to candidate
        recipientEmail = typedMessage.applications.users.email
      }

      const context: EmailContext = {
        candidateName,
        jobTitle: typedMessage.applications.jobs.title,
        companyName: typedMessage.applications.tenants.name,
        messageContent: typedMessage.content,
        applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications/${typedMessage.applications.id}`
      }

      await this.emailService.sendMessageNotification(
        recipientEmail,
        context
      )
    } catch (error) {
      console.error('Error in onMessageSent:', error)
    }
  }

  async onAssessmentScored(assessmentId: string): Promise<void> {
    try {
      // Get assessment and application details
      const { data: assessment, error } = await this.supabase
        .from('assessments')
        .select(`
          *,
          applications (
            id,
            stage,
            jobs (title, job_settings (shortlist_threshold)),
            users (first_name, last_name, email)
          )
        `)
        .eq('id', assessmentId)
        .single()

      if (error || !assessment) {
        console.error('Error fetching assessment for email:', error)
        return
      }

      const typedAssessment = assessment as AssessmentWithRelations
      const threshold = typedAssessment.applications.jobs.job_settings?.shortlist_threshold || 75
      
      // If candidate was auto-shortlisted by AI, send shortlist notification
      if (
        typedAssessment.composite_score && 
        typedAssessment.composite_score >= threshold && 
        typedAssessment.applications.stage === 'shortlisted'
      ) {
        await this.onCandidateShortlisted(
          typedAssessment.applications.id,
          typedAssessment.composite_score
        )
      }
    } catch (error) {
      console.error('Error in onAssessmentScored:', error)
    }
  }

  async sendBulkEmail(templateName: string, recipients: string[], context: Record<string, any>): Promise<void> {
    try {
      // Note: Using a workaround since sendTemplateEmail is private
      // This should be refactored to expose a public method in EmailService
      const promises = recipients.map(async (email) => {
        try {
          // Access the private method using array notation as a temporary solution
          const emailService = this.emailService as any
          return await emailService.sendTemplateEmail(
            templateName,
            email,
            { ...context, recipientEmail: email }
          )
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error)
          return null
        }
      })

      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Error in sendBulkEmail:', error)
    }
  }

  async sendCustomEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<{ data?: { id: string } | null; error?: string | null }> {
    try {
      const emailService = new EmailService()
      // Access the private resend property using array notation for now
      const resendClient = (emailService as any).resend
      
      const result = await resendClient.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@atsplatform.com',
        to,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '')
      })

      return {
        data: result.data,
        error: result.error ? result.error.message : null
      }
    } catch (error) {
      console.error('Error sending custom email:', error)
      throw error
    }
  }
}