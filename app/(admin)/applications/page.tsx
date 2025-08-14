import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ApplicationsTable } from '@/components/admin/applications-table'
import { ApplicationsFilters } from '@/components/admin/applications-filters'
import type { Application } from '@/types/database'

// Next.js 13+ App Router page props interface
interface ApplicationsPageProps {
  searchParams: Promise<{
    stage?: string
    job?: string
    search?: string
    page?: string
    sort?: string
  }>
}

// Extended application type with joined relations
interface ApplicationWithRelations extends Omit<Application, 'job' | 'candidate'> {
  created_at: string
  jobs: { id: string; title: string }
  users: { first_name: string; last_name: string; email: string }
  assessments?: Array<{ ai_total_score?: number | null; status: string; created_at: string }>
}

// Job type for filters
interface JobForFilter {
  id: string
  title: string
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  // Await searchParams as it's a promise in App Router
  const resolvedSearchParams = await searchParams
  const user = await requireAdmin()
  const supabase = createClient()

  // Build query based on search params
  let query = supabase
    .from('applications')
    .select(`
      *,
      jobs!inner (id, title),
      users!inner (first_name, last_name, email),
      assessments (ai_total_score, status, created_at)
    `, { count: 'exact' })
    .eq('tenant_id', user.tenant_id)

  // Apply filters
  if (resolvedSearchParams.stage) {
    query = query.eq('status', resolvedSearchParams.stage)
  }
  if (resolvedSearchParams.job) {
    query = query.eq('job_id', resolvedSearchParams.job)
  }
  if (resolvedSearchParams.search) {
    const searchTerm = resolvedSearchParams.search
    query = query.or(
      `users.first_name.ilike.%${searchTerm}%,users.last_name.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%`
    )
  }

  // Apply sorting
  const sort = resolvedSearchParams.sort || 'created_at.desc'
  const [sortField, sortOrder] = sort.split('.')
  const ascending = sortOrder === 'asc'
  
  // Handle different sort fields with proper typing
  if (sortField === 'first_name' || sortField === 'last_name' || sortField === 'email') {
    query = query.order(`users.${sortField}`, { ascending })
  } else if (sortField === 'job_id') {
    query = query.order('jobs.title', { ascending })
  } else {
    query = query.order(sortField as any, { ascending })
  }

  // Apply pagination
  const page = parseInt(resolvedSearchParams.page || '1')
  const limit = 20
  const start = (page - 1) * limit
  const end = start + limit - 1
  query = query.range(start, end)

  const { data: applications, error, count } = await query

  if (error) {
    console.error('Error fetching applications:', error)
  }

  // Fetch jobs for filter dropdown
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('tenant_id', user.tenant_id)
    .eq('status', 'published')
    .order('title')

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage and review candidate applications
          </p>
        </div>
      </div>

      <ApplicationsFilters 
        jobs={(jobs as JobForFilter[]) || []}
        currentFilters={resolvedSearchParams}
      />

      <ApplicationsTable 
        applications={(applications as ApplicationWithRelations[]) || []}
        totalCount={count || 0}
        currentPage={page}
        totalPages={totalPages}
        currentSort={sort}
      />
    </div>
  )
}