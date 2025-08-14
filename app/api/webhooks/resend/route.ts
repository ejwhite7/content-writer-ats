import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Interface for Resend webhook event data
interface ResendEventData {
  email_id: string
  reason?: string
  [key: string]: any
}

// Interface for Resend webhook event
interface ResendWebhookEvent {
  type: string
  data: ResendEventData
}

// Interface for email log update
interface EmailLogUpdate {
  status: string
  delivered_at?: string
  error_message?: string
  bounced_at?: string
  complained_at?: string
}

// Interface for email event insert
interface EmailEventInsert {
  email_log_id: string
  event_type: string
  event_data: ResendEventData
  created_at: string
}

// Webhook to handle Resend email delivery status
export async function POST(request: NextRequest): Promise<NextResponse<{ received: boolean } | { error: string }>> {
  try {
    const signature = request.headers.get('resend-signature')
    const body = await request.text()

    // Verify webhook signature (if configured)
    if (process.env.RESEND_WEBHOOK_SECRET) {
      // Implement signature verification here
      // This is optional but recommended for production
    }

    const event: ResendWebhookEvent = JSON.parse(body)
    console.log('Resend webhook event:', event)

    const supabase = createClient()

    // Update email log status based on event
    switch (event.type) {
      case 'email.sent':
        await updateEmailLogStatus(supabase, event.data.email_id, {
          status: 'sent',
          delivered_at: new Date().toISOString()
        })
        break

      case 'email.delivered':
        await updateEmailLogStatus(supabase, event.data.email_id, {
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        break

      case 'email.delivery_delayed':
        await updateEmailLogStatus(supabase, event.data.email_id, {
          status: 'delayed',
          error_message: event.data.reason
        })
        break

      case 'email.bounced':
        await updateEmailLogStatus(supabase, event.data.email_id, {
          status: 'bounced',
          error_message: event.data.reason,
          bounced_at: new Date().toISOString()
        })
        break

      case 'email.complained':
        await updateEmailLogStatus(supabase, event.data.email_id, {
          status: 'complained',
          complained_at: new Date().toISOString()
        })
        break

      case 'email.clicked':
        // Track email clicks
        await insertEmailEvent(supabase, {
          email_log_id: event.data.email_id, // This would need to be mapped
          event_type: 'click',
          event_data: event.data,
          created_at: new Date().toISOString()
        })
        break

      case 'email.opened':
        // Track email opens
        await insertEmailEvent(supabase, {
          email_log_id: event.data.email_id, // This would need to be mapped
          event_type: 'open',
          event_data: event.data,
          created_at: new Date().toISOString()
        })
        break

      default:
        console.log(`Unhandled Resend webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Resend webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateEmailLogStatus(
  supabase: ReturnType<typeof createClient>, 
  emailId: string, 
  updates: EmailLogUpdate
): Promise<void> {
  const { error } = await supabase
    .from('email_logs')
    .update(updates)
    .eq('resend_id', emailId)

  if (error) {
    console.error('Error updating email log:', error)
  }
}

async function insertEmailEvent(
  supabase: ReturnType<typeof createClient>, 
  eventData: EmailEventInsert
): Promise<void> {
  const { error } = await supabase
    .from('email_events')
    .insert(eventData)

  if (error) {
    console.error('Error inserting email event:', error)
  }
}

export async function GET(): Promise<NextResponse<{ message: string }>> {
  return NextResponse.json({ message: 'Resend webhook endpoint' })
}