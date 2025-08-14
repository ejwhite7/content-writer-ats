import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailTriggers } from '@/lib/email/email-triggers'

// Interface for webhook data
interface WebhookData {
  id: string
  secret: string
  enabled: boolean
  tenant_id: string
}

// Interface for webhook event body
interface WebhookEventBody {
  event: string
  data: {
    application_id?: string
    assessment_id?: string
    stage_changed?: boolean
    new_stage?: string
    ai_score?: number
    reason?: string
    [key: string]: any
  }
}

// Interface for webhook log entry
interface WebhookLogEntry {
  webhook_id: string
  event_type: string
  payload: WebhookEventBody
  processed_at: string
  status: string
}

// Generic webhook endpoint for external integrations
export async function POST(request: NextRequest): Promise<NextResponse<{ received: boolean; event?: string } | { error: string }>> {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = request.headers.get('x-webhook-secret')
    
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing webhook authentication' }, { status: 401 })
    }

    // Verify the webhook is registered
    const supabase = createClient()
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('secret', webhookSecret)
      .eq('enabled', true)
      .single()

    if (webhookError || !webhook) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 })
    }

    const webhookData = webhook as WebhookData
    const body: WebhookEventBody = await request.json()
    const { event, data } = body

    console.log(`Received webhook event: ${event}`, data)

    // Process different webhook events
    switch (event) {
      case 'application.created':
        if (data.application_id) {
          await handleApplicationCreated({ ...data, application_id: data.application_id })
        }
        break
      
      case 'application.updated':
        if (data.application_id) {
          await handleApplicationUpdated({ ...data, application_id: data.application_id })
        }
        break
        
      case 'assessment.submitted':
        if (data.assessment_id) {
          await handleAssessmentSubmitted({ ...data, assessment_id: data.assessment_id })
        }
        break
        
      case 'candidate.shortlisted':
        if (data.application_id) {
          await handleCandidateShortlisted({ ...data, application_id: data.application_id })
        }
        break
        
      case 'candidate.rejected':
        if (data.application_id) {
          await handleCandidateRejected({ ...data, application_id: data.application_id })
        }
        break
        
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    // Log webhook receipt
    const logEntry: WebhookLogEntry = {
      webhook_id: webhookData.id,
      event_type: event,
      payload: body,
      processed_at: new Date().toISOString(),
      status: 'processed'
    }

    await supabase
      .from('webhook_logs')
      .insert(logEntry)

    return NextResponse.json({ received: true, event })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleApplicationCreated(data: { application_id: string; [key: string]: any }): Promise<void> {
  const emailTriggers = new EmailTriggers()
  await emailTriggers.onApplicationSubmitted(data.application_id)
}

async function handleApplicationUpdated(data: { 
  application_id: string
  stage_changed?: boolean
  new_stage?: string
  ai_score?: number
  reason?: string
  [key: string]: any 
}): Promise<void> {
  // Handle application status changes
  if (data.stage_changed && data.new_stage) {
    const emailTriggers = new EmailTriggers()
    
    switch (data.new_stage) {
      case 'shortlisted':
        await emailTriggers.onCandidateShortlisted(data.application_id, data.ai_score || 0)
        break
      case 'rejected':
        await emailTriggers.onCandidateRejected(data.application_id, data.reason)
        break
    }
  }
}

async function handleAssessmentSubmitted(data: { assessment_id: string; [key: string]: any }): Promise<void> {
  // Trigger AI scoring
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assessments/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assessmentId: data.assessment_id })
    })
    
    if (!response.ok) {
      console.error('Failed to trigger AI scoring:', await response.text())
    }
  } catch (error) {
    console.error('Error triggering AI scoring:', error)
  }
}

async function handleCandidateShortlisted(data: { application_id: string; ai_score?: number; [key: string]: any }): Promise<void> {
  const emailTriggers = new EmailTriggers()
  await emailTriggers.onCandidateShortlisted(data.application_id, data.ai_score || 0)
}

async function handleCandidateRejected(data: { application_id: string; reason?: string; [key: string]: any }): Promise<void> {
  const emailTriggers = new EmailTriggers()
  await emailTriggers.onCandidateRejected(data.application_id, data.reason)
}

export async function GET(): Promise<NextResponse<{ 
  message: string
  events: string[]
}>> {
  return NextResponse.json({ 
    message: 'External webhook endpoint',
    events: [
      'application.created',
      'application.updated', 
      'assessment.submitted',
      'candidate.shortlisted',
      'candidate.rejected'
    ]
  })
}