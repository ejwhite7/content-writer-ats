import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, AuthUser } from '@/lib/auth'
import { Message, Application, User, MessageType } from '@/types/database'

// Type for message with relations
interface MessageWithRelations {
  id: string
  application_id: string
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
  is_read: boolean
  read_at?: Date
  createdAt: Date
  sender?: Pick<User, 'first_name' | 'last_name' | 'email'>
  recipient?: Pick<User, 'first_name' | 'last_name' | 'email'>
}

// Type for application with job relation
interface ApplicationWithJob {
  id: string
  candidate_id: string
  tenant_id: string
  job?: {
    id: string
    posted_by?: string
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user: AuthUser | null = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('application_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    const supabase = createClient()

    // Verify user has access to this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, candidate_id, tenant_id')
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check permissions
    const hasAccess = user.role === 'admin' 
      ? application.tenant_id === user.tenant_id
      : application.candidate_id === user.clerk_id

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch messages with proper typing
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(first_name, last_name, email),
        recipient:users!recipient_id(first_name, last_name, email)
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mark messages as read for the current user
    if (messages && messages.length > 0) {
      await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString() 
        })
        .eq('application_id', applicationId)
        .eq('recipient_id', user.clerk_id)
        .eq('is_read', false)
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user: AuthUser | null = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { application_id, content, type = 'candidate_message' } = body as {
      application_id: string
      content: string
      type?: MessageType
    }

    if (!application_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'Application ID and content are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user has access to this application and get recipient info
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id, 
        candidate_id, 
        tenant_id,
        job:jobs(id, posted_by)
      `)
      .eq('id', application_id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const typedApplication = application as any

    // Check permissions
    const hasAccess = user.role === 'admin' 
      ? typedApplication.tenant_id === user.tenant_id
      : typedApplication.candidate_id === user.clerk_id

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Determine recipient based on sender role
    const recipientId = user.role === 'admin' 
      ? typedApplication.candidate_id 
      : typedApplication.job?.posted_by || 'admin'

    // Generate thread ID if not exists (using application_id as base)
    const threadId = `app_${application_id}`

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: user.tenant_id,
        application_id,
        thread_id: threadId,
        sender_id: user.clerk_id,
        recipient_id: recipientId,
        type: user.role === 'admin' ? 'admin_message' as MessageType : 'candidate_message' as MessageType,
        content: content.trim(),
        attachments: [],
        is_read: false,
        is_system_generated: false,
        email_sent: false
      })
      .select(`
        *,
        sender:users!sender_id(first_name, last_name, email),
        recipient:users!recipient_id(first_name, last_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update application's last activity
    await supabase
      .from('applications')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', application_id)

    // TODO: Send email notification to the other party
    // This would be implemented with the Resend integration

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}