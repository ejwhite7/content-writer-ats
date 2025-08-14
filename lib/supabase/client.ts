import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Define a basic Database type structure for the branding functionality
export interface Database {
  public: {
    Tables: {
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
    }
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not configured. Using mock client.')
    // Return a mock client for development when env vars are not set
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null })
            })
          })
        })
      })
    } as any
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey)
}