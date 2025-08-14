import { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { RecentActivity } from '@/components/admin/recent-activity'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Overview of your ATS platform metrics, recent activities, and key insights.',
}

// Simplified dashboard stats data
interface SimpleDashboardStatsData {
  totalApplications: number
  shortlistedCandidates: number
  hiredThisMonth: number
  avgTimeToHire: number
}

export default async function AdminDashboardPage() {
  const user = await requireAdmin()
  const supabase = createClient()

  // Fetch basic stats for DashboardStats component
  const statsData: SimpleDashboardStatsData = {
    totalApplications: 0,
    shortlistedCandidates: 0,
    hiredThisMonth: 0,
    avgTimeToHire: 0
  }

  try {
    // Get basic application counts
    const { count: totalApps } = await supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('tenant_id', user.tenant_id)

    const { count: shortlisted } = await supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'shortlisted')

    const { count: hired } = await supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'hired')

    statsData.totalApplications = totalApps || 0
    statsData.shortlistedCandidates = shortlisted || 0
    statsData.hiredThisMonth = hired || 0
    statsData.avgTimeToHire = 14 // Default placeholder
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your hiring process.
        </p>
      </div>

      {/* Dashboard Stats */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats data={statsData} />
      </Suspense>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Dashboard */}
        <div className="lg:col-span-2">
          <Suspense fallback={<DashboardSkeleton />}>
            <AdminDashboard />
          </Suspense>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<DashboardSkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  )
}