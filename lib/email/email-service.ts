import { Resend } from 'resend'
import { createAdminClient } from '../supabase/server'

// Email context interface for template variables
interface EmailContext {
  candidateName?: string
  jobTitle?: string
  companyName?: string
  applicationUrl?: string
  assessmentUrl?: string
  messageContent?: string
  aiScore?: number
  [key: string]: any
}

// Database types for email service
interface BrandingSettings {
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

interface EmailTemplate {
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

// Local EmailTemplate interface matching our needs
interface LocalEmailTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  text_content: string
  variables: string[]
}

// Resend API response types
interface ResendEmailResponse {
  data?: {
    id: string
  } | null
  error?: {
    message: string
    name: string
  } | null
}

// Email service error response
interface EmailServiceResponse {
  data?: {
    id: string
  } | null
  error?: string | null
}

// Type for handling Resend errors
interface ResendError {
  message: string
  name: string
}

// Database response types
interface SupabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

export class EmailService {
  private resend: Resend
  private supabase = createAdminClient()

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required')
    }
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  async sendApplicationConfirmation(
    candidateEmail: string, 
    context: EmailContext
  ): Promise<EmailServiceResponse> {
    return this.sendTemplateEmail(
      'application_confirmation',
      candidateEmail,
      context
    )
  }

  async sendAssessmentInvitation(
    candidateEmail: string, 
    context: EmailContext
  ): Promise<EmailServiceResponse> {
    return this.sendTemplateEmail(
      'assessment_invitation',
      candidateEmail,
      context
    )
  }

  async sendShortlistNotification(
    candidateEmail: string, 
    context: EmailContext
  ): Promise<EmailServiceResponse> {
    return this.sendTemplateEmail(
      'shortlist_notification',
      candidateEmail,
      context
    )
  }

  async sendRejectionNotification(
    candidateEmail: string, 
    context: EmailContext
  ): Promise<EmailServiceResponse> {
    return this.sendTemplateEmail(
      'rejection_notification',
      candidateEmail,
      context
    )
  }

  async sendMessageNotification(
    recipientEmail: string, 
    context: EmailContext
  ): Promise<EmailServiceResponse> {
    return this.sendTemplateEmail(
      'message_notification',
      recipientEmail,
      context
    )
  }

  async sendAdminApplicationAlert(
    adminEmail: string, 
    context: EmailContext
  ): Promise<EmailServiceResponse> {
    return this.sendTemplateEmail(
      'admin_application_alert',
      adminEmail,
      context
    )
  }

  private async sendTemplateEmail(
    templateName: string,
    to: string,
    context: EmailContext,
    tenantId?: string
  ): Promise<EmailServiceResponse> {
    try {
      // Get email template
      const template = await this.getEmailTemplate(templateName, tenantId)
      if (!template) {
        console.error(`Email template '${templateName}' not found`)
        return { error: 'Template not found' }
      }

      // Get tenant branding for from address and styling
      const branding = tenantId ? await this.getTenantBranding(tenantId) : null
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@atsplatform.com'
      const fromName = branding?.company_name || 'ATS Platform'

      // Process template with context
      const processedSubject = this.processTemplate(template.subject, context)
      const processedHtml = this.processTemplate(template.html_content, context)
      const processedText = this.processTemplate(template.text_content, context)

      // Apply branding to HTML
      const brandedHtml = branding 
        ? this.applyBrandingToEmail(processedHtml, branding)
        : processedHtml

      // Send email
      const result = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject: processedSubject,
        html: brandedHtml,
        text: processedText,
      }) as ResendEmailResponse

      // Log email sent
      await this.logEmailSent({
        template_name: templateName,
        recipient_email: to,
        subject: processedSubject,
        resend_id: result.data?.id,
        tenant_id: tenantId
      })

      return {
        data: result.data,
        error: result.error ? result.error.message : null
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async getEmailTemplate(
    name: string, 
    tenantId?: string
  ): Promise<LocalEmailTemplate | null> {
    try {
      // First try to get tenant-specific template
      if (tenantId) {
        const { data: customTemplate } = await this.supabase
          .from('email_templates')
          .select('*')
          .eq('name', name)
          .eq('tenant_id', tenantId)
          .single() as SupabaseResponse<EmailTemplate>

        if (customTemplate) {
          return {
            id: customTemplate.id,
            name: customTemplate.name,
            subject: customTemplate.subject,
            html_content: customTemplate.html_content,
            text_content: customTemplate.text_content || '',
            variables: customTemplate.template_variables || []
          }
        }
      }

      // Fall back to default template
      const { data: defaultTemplate } = await this.supabase
        .from('email_templates')
        .select('*')
        .eq('name', name)
        .is('tenant_id', null)
        .single() as SupabaseResponse<EmailTemplate>

      if (defaultTemplate) {
        return {
          id: defaultTemplate.id,
          name: defaultTemplate.name,
          subject: defaultTemplate.subject,
          html_content: defaultTemplate.html_content,
          text_content: defaultTemplate.text_content || '',
          variables: defaultTemplate.template_variables || []
        }
      }

      return this.getDefaultTemplate(name)
    } catch (error) {
      console.error('Error fetching email template:', error)
      return this.getDefaultTemplate(name)
    }
  }

  private getDefaultTemplate(name: string): LocalEmailTemplate | null {
    const templates: Record<string, LocalEmailTemplate> = {
      application_confirmation: {
        id: 'default-app-confirmation',
        name: 'application_confirmation',
        subject: 'Application Received - {{jobTitle}}',
        html_content: `
          <h2>Thank you for your application!</h2>
          <p>Hi {{candidateName}},</p>
          <p>We've received your application for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
          <p>What happens next:</p>
          <ul>
            <li>Our team will review your application</li>
            <li>If selected, you'll receive an assessment invitation</li>
            <li>We'll keep you updated throughout the process</li>
          </ul>
          <p>You can track your application status at: <a href="{{applicationUrl}}">View Application</a></p>
          <p>Thank you for your interest in joining our team!</p>
        `,
        text_content: 'Thank you for your application for {{jobTitle}} at {{companyName}}. We\'ll review it and get back to you soon.',
        variables: ['candidateName', 'jobTitle', 'companyName', 'applicationUrl']
      },
      assessment_invitation: {
        id: 'default-assessment',
        name: 'assessment_invitation',
        subject: 'Complete Your Writing Assessment - {{jobTitle}}',
        html_content: `
          <h2>Next Step: Writing Assessment</h2>
          <p>Hi {{candidateName}},</p>
          <p>Great news! We'd like to move forward with your application for <strong>{{jobTitle}}</strong>.</p>
          <p>The next step is to complete a writing assessment. This will help us evaluate your writing skills and ensure you're a good fit for the role.</p>
          <p><a href="{{assessmentUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Assessment</a></p>
          <p>The assessment should take about 30-45 minutes to complete. Please submit it within 3 days.</p>
          <p>Good luck!</p>
        `,
        text_content: 'Please complete your writing assessment for {{jobTitle}}. Visit: {{assessmentUrl}}',
        variables: ['candidateName', 'jobTitle', 'assessmentUrl']
      },
      shortlist_notification: {
        id: 'default-shortlist',
        name: 'shortlist_notification',
        subject: 'Congratulations! You\'ve been shortlisted - {{jobTitle}}',
        html_content: `
          <h2>Congratulations! You've been shortlisted</h2>
          <p>Hi {{candidateName}},</p>
          <p>We're excited to inform you that you've been shortlisted for the <strong>{{jobTitle}}</strong> position!</p>
          <p>Your assessment scored {{aiScore}}/100, which puts you in our top candidates.</p>
          <p>Our team will be in touch soon to discuss the next steps in the hiring process.</p>
          <p>Thank you for your excellent application and assessment.</p>
        `,
        text_content: 'Congratulations! You\'ve been shortlisted for {{jobTitle}}. Your assessment scored {{aiScore}}/100.',
        variables: ['candidateName', 'jobTitle', 'aiScore']
      },
      rejection_notification: {
        id: 'default-rejection',
        name: 'rejection_notification',
        subject: 'Application Update - {{jobTitle}}',
        html_content: `
          <h2>Thank you for your application</h2>
          <p>Hi {{candidateName}},</p>
          <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.</p>
          <p>We appreciate the time you invested in the application process and encourage you to apply for future opportunities that match your skills and experience.</p>
          <p>Best regards,<br>The {{companyName}} Team</p>
        `,
        text_content: 'Thank you for your application for {{jobTitle}} at {{companyName}}. We have decided to move forward with other candidates.',
        variables: ['candidateName', 'jobTitle', 'companyName']
      },
      message_notification: {
        id: 'default-message',
        name: 'message_notification',
        subject: 'New message about your application - {{jobTitle}}',
        html_content: `
          <h2>New Message</h2>
          <p>Hi {{candidateName}},</p>
          <p>You have a new message regarding your application for <strong>{{jobTitle}}</strong>:</p>
          <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 16px 0;">
            {{messageContent}}
          </blockquote>
          <p><a href="{{applicationUrl}}">Reply to this message</a></p>
        `,
        text_content: 'New message about {{jobTitle}}: {{messageContent}}. Reply at: {{applicationUrl}}',
        variables: ['candidateName', 'jobTitle', 'messageContent', 'applicationUrl']
      },
      admin_application_alert: {
        id: 'default-admin-alert',
        name: 'admin_application_alert',
        subject: 'New Application Received - {{jobTitle}}',
        html_content: `
          <h2>New Application Alert</h2>
          <p>A new application has been received for <strong>{{jobTitle}}</strong>.</p>
          <p><strong>Candidate:</strong> {{candidateName}}</p>
          <p><a href="{{applicationUrl}}">Review Application</a></p>
        `,
        text_content: 'New application from {{candidateName}} for {{jobTitle}}. Review at: {{applicationUrl}}',
        variables: ['candidateName', 'jobTitle', 'applicationUrl']
      }
    }

    return templates[name] || null
  }

  private async getTenantBranding(tenantId: string): Promise<BrandingSettings | null> {
    try {
      const { data } = await this.supabase
        .from('branding_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single() as SupabaseResponse<BrandingSettings>
      
      return data
    } catch (error) {
      console.error('Error fetching tenant branding:', error)
      return null
    }
  }

  private processTemplate(template: string, context: EmailContext): string {
    let processed = template
    
    for (const [key, value] of Object.entries(context)) {
      const placeholder = `{{${key}}}`
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value || ''))
    }
    
    return processed
  }

  private applyBrandingToEmail(html: string, branding: BrandingSettings): string {
    // Apply basic branding to email template
    const brandedHtml = `
      <div style="font-family: ${branding.font_family || 'Arial, sans-serif'}; max-width: 600px; margin: 0 auto;">
        ${branding.logo_url ? `<img src="${branding.logo_url}" alt="${branding.company_name || 'Company'}" style="max-height: 60px; margin-bottom: 20px;">` : ''}
        <div style="color: #333; line-height: 1.6;">
          ${html}
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 12px;">
          ${branding.company_name || ''}
          ${branding.email_sender_address ? `<br>Contact: ${branding.email_sender_address}` : ''}
          ${branding.website_url ? `<br><a href="${branding.website_url}">${branding.website_url}</a>` : ''}
        </div>
      </div>
    `
    
    return brandedHtml
  }

  private async logEmailSent(data: {
    template_name: string
    recipient_email: string
    subject: string
    resend_id?: string
    tenant_id?: string
  }): Promise<void> {
    try {
      await this.supabase
        .from('email_logs')
        .insert({
          ...data,
          sent_at: new Date().toISOString(),
          status: 'sent'
        })
    } catch (error) {
      console.error('Error logging email:', error)
    }
  }

  async createEmailTemplate(
    template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EmailTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single() as SupabaseResponse<EmailTemplate>

      if (error) throw error
      if (!data) throw new Error('Failed to create email template')
      return data
    } catch (error) {
      console.error('Error creating email template:', error)
      throw error
    }
  }

  async updateEmailTemplate(
    id: string, 
    updates: Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<EmailTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single() as SupabaseResponse<EmailTemplate>

      if (error) throw error
      if (!data) throw new Error('Failed to update email template')
      return data
    } catch (error) {
      console.error('Error updating email template:', error)
      throw error
    }
  }

  async getEmailTemplates(tenantId?: string): Promise<EmailTemplate[]> {
    try {
      let query = this.supabase
        .from('email_templates')
        .select('*')
        .order('name')
      
      if (tenantId) {
        query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      } else {
        query = query.is('tenant_id', null)
      }

      const { data, error } = await query as SupabaseResponse<EmailTemplate[]>
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching email templates:', error)
      throw error
    }
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting email template:', error)
      throw error
    }
  }
}