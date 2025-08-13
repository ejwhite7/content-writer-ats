import { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { RecentActivity } from '@/components/admin/recent-activity'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Overview of your ATS platform metrics, recent activities, and key insights.',
}

export default async function AdminDashboardPage() {
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
        <DashboardStats />
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