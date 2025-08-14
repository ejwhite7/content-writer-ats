import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import type { SupabaseClient } from '@supabase/supabase-js'

// Interface for job data with relations
interface JobWithTenant {
  id: string
  title: string
  description: string
  status: string
  job_type: string
  location: string
  remote_allowed: boolean
  created_at: string
  tenant_id: string
  tenants: {
    name: string
    branding_settings: {
      company_name?: string
      logo_url?: string
      primary_color: string
    }[]
  }
}

// Interface for pagination response
interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

interface JobsResponse {
  jobs: JobWithTenant[]
  pagination: PaginationInfo
}

// Interface for job creation data
interface CreateJobData {
  title: string
  description: string
  job_type?: string
  location?: string
  remote_allowed?: boolean
  [key: string]: any // Allow other job fields
}

// Get jobs (public endpoint)
export async function GET(request: NextRequest): Promise<NextResponse<JobsResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const location = searchParams.get('location')
    const tenantId = searchParams.get('tenant_id')

    const supabase = createClient()
    
    let query = supabase
      .from('jobs')
      .select(`
        *,
        tenants (name, branding_settings (*))
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (type) {
      query = query.eq('job_type', type)
    }
    if (location) {
      query = query.or(`location.ilike.%${location}%,remote_allowed.eq.true`)
    }
    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    // Apply pagination
    const start = (page - 1) * limit
    const end = start + limit - 1
    query = query.range(start, end)

    const { data: jobs, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      jobs: (jobs as JobWithTenant[]) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create job (admin only)
export async function POST(request: NextRequest): Promise<NextResponse<{ job: any } | { error: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobData: CreateJobData = await request.json()
    const supabase = createClient()

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        tenant_id: user.tenant_id,
        created_by: user.clerk_id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}