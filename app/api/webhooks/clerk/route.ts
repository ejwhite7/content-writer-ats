import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

async function validateRequest(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.text()

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  return evt
}

export async function POST(request: NextRequest) {
  try {
    const evt = await validateRequest(request)
    if (evt instanceof Response) return evt

    const supabase = createClient()
    const { type, data } = evt

    console.log(`Received webhook: ${type}`)

    switch (type) {
      case 'user.created': {
        // Sync user creation to Supabase
        const { id, email_addresses, first_name, last_name, created_at, public_metadata } = data
        
        const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id)
        
        const { error } = await supabase
          .from('users')
          .insert({
            clerk_id: id,
            email: primaryEmail?.email_address || '',
            first_name: first_name || '',
            last_name: last_name || '',
            role: (public_metadata as any)?.role || 'candidate',
            created_at: new Date(created_at).toISOString(),
          })

        if (error) {
          console.error('Error creating user in Supabase:', error)
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }
        
        console.log(`User created: ${id}`)
        break
      }

      case 'user.updated': {
        // Sync user updates to Supabase
        const { id, email_addresses, first_name, last_name, public_metadata } = data
        
        const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id)
        
        const { error } = await supabase
          .from('users')
          .update({
            email: primaryEmail?.email_address || '',
            first_name: first_name || '',
            last_name: last_name || '',
            role: (public_metadata as any)?.role || 'candidate',
          })
          .eq('clerk_id', id)

        if (error) {
          console.error('Error updating user in Supabase:', error)
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
        }
        
        console.log(`User updated: ${id}`)
        break
      }

      case 'user.deleted': {
        // Handle user deletion - you might want to soft delete instead
        const { id } = data
        
        const { error } = await supabase
          .from('users')
          .update({ deleted_at: new Date().toISOString() })
          .eq('clerk_id', id)

        if (error) {
          console.error('Error deleting user in Supabase:', error)
          return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
        }
        
        console.log(`User deleted: ${id}`)
        break
      }

      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Clerk webhook endpoint' })
}