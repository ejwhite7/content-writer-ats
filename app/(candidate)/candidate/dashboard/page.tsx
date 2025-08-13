import { Metadata } from 'next'
import { Suspense } from 'react'
import { CandidateDashboard } from '@/components/candidate/candidate-dashboard'
import { DashboardSkeleton } from '@/components/candidate/dashboard-skeleton'
import { ApplicationStats } from '@/components/candidate/application-stats'
import { RecommendedJobs } from '@/components/candidate/recommended-jobs'

export const metadata: Metadata = {
  title: 'Candidate Dashboard',
  description: 'Track your job applications, view recommended positions, and manage your profile.',
}

export default async function CandidateDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track your applications and discover new opportunities.
        </p>
      </div>

      {/* Application Stats */}
      <Suspense fallback={<DashboardSkeleton />}>
        <ApplicationStats />
      </Suspense>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Dashboard */}
        <div className="lg:col-span-2">
          <Suspense fallback={<DashboardSkeleton />}>
            <CandidateDashboard />
          </Suspense>
        </div>

        {/* Recommended Jobs Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<DashboardSkeleton />}>
            <RecommendedJobs />
          </Suspense>
        </div>
      </div>
    </div>
  )
}