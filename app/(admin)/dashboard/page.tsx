import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/admin/dashboard-stats'
// import { RecentApplications } from '@/components/admin/recent-applications'
// import { ActiveJobs } from '@/components/admin/active-jobs'
// import { AIScoringOverview } from '@/components/admin/ai-scoring-overview'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type definitions for dashboard data
interface DashboardStatsData {
  totalApplications: number
  shortlistedCandidates: number
  hiredThisMonth: number
  avgTimeToHire: number
}

interface ApplicationWithJoinedData {
  id: string
  created_at: string
  stage: string
  tenant_id: string
  jobs: {
    title: string
  }
  users: {
    first_name: string
    last_name: string
    email: string
  }
  assessments: {
    ai_total_score: number
    status: string
  }[]
}

interface JobWithApplicationCount {
  id: string
  title: string
  created_at: string
  status: string
  tenant_id: string
  applications: {
    id: string
  }[]
}

interface AssessmentData {
  ai_total_score: number
  ai_scores: Record<string, any>
  created_at: string
  status: string
}

interface AIScoringData {
  totalAssessed: number
  averageScore: number
  distribution: {
    high: number
    medium: number
    low: number
  }
}

export default async function AdminDashboardPage() {
  const user = await requireAdmin()
  const supabase = createClient()

  // Fetch dashboard data
  const [statsData] = await Promise.all([
    fetchDashboardStats(supabase, user.tenant_id),
    // fetchRecentApplications(supabase, user.tenant_id),
    // fetchActiveJobs(supabase, user.tenant_id),
    // fetchAIScoringOverview(supabase, user.tenant_id)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hiring pipeline and candidate activity
        </p>
      </div>

      <DashboardStats data={statsData} />
      
      {/* TODO: Add missing components */}
      {/* <div className="grid gap-6 lg:grid-cols-2">
        <RecentApplications applications={recentApplicationsData} />
        <ActiveJobs jobs={activeJobsData} />
      </div>
      
      <AIScoringOverview data={aiScoringData} /> */}
    </div>
  )
}

async function fetchDashboardStats(supabase: SupabaseClient, tenantId: string): Promise<DashboardStatsData> {
  const [applications, shortlisted, hired, avgTimeToHire] = await Promise.all([
    // Total applications this month
    supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    
    // Shortlisted candidates
    supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('stage', 'shortlisted'),
    
    // Hired this month
    supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('stage', 'hired')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    
    // Average time to hire (simplified)
    supabase
      .from('applications')
      .select('created_at, hired_at')
      .eq('tenant_id', tenantId)
      .eq('stage', 'hired')
      .not('hired_at', 'is', null)
      .limit(50)
  ])

  let avgDays = 0
  if (avgTimeToHire.data && avgTimeToHire.data.length > 0) {
    const times = avgTimeToHire.data.map(app => {
      const created = new Date(app.created_at)
      const hired = new Date(app.hired_at!)
      return (hired.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    })
    avgDays = times.reduce((a, b) => a + b, 0) / times.length
  }

  return {
    totalApplications: applications.count || 0,
    shortlistedCandidates: shortlisted.count || 0,
    hiredThisMonth: hired.count || 0,
    avgTimeToHire: Math.round(avgDays)
  }
}

async function fetchRecentApplications(supabase: SupabaseClient, tenantId: string): Promise<ApplicationWithJoinedData[]> {
  const { data } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (title),
      users (first_name, last_name, email),
      assessments (ai_total_score, status)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5)

  return (data as ApplicationWithJoinedData[]) || []
}

async function fetchActiveJobs(supabase: SupabaseClient, tenantId: string): Promise<JobWithApplicationCount[]> {
  const { data } = await supabase
    .from('jobs')
    .select(`
      *,
      applications (id)
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)

  return (data as JobWithApplicationCount[]) || []
}

async function fetchAIScoringOverview(supabase: SupabaseClient, tenantId: string): Promise<AIScoringData> {
  const { data } = await supabase
    .from('assessments')
    .select('ai_total_score, ai_scores')
    .eq('tenant_id', tenantId)
    .eq('status', 'ai_scored')
    .order('created_at', { ascending: false })
    .limit(100)

  const assessmentData = (data as AssessmentData[]) || []
  const scores = assessmentData.filter(a => a.ai_total_score).map(a => a.ai_total_score) || []
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  
  const highScores = scores.filter(s => s >= 80).length
  const mediumScores = scores.filter(s => s >= 60 && s < 80).length
  const lowScores = scores.filter(s => s < 60).length

  return {
    totalAssessed: scores.length,
    averageScore: Math.round(avgScore),
    distribution: {
      high: highScores,
      medium: mediumScores,
      low: lowScores
    }
  }
}