import { Metadata } from 'next'
import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { ApplicationsList } from '@/components/candidate/applications-list'
import { ApplicationsStats } from '@/components/candidate/applications-stats'
import { DashboardSkeleton } from '@/components/candidate/dashboard-skeleton'

export const metadata: Metadata = {
  title: 'My Applications',
  description: 'View and manage your job applications.',
}

export default async function ApplicationsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirect_url=/candidate/applications')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications and view updates.
        </p>
      </div>

      {/* Application Stats */}
      <Suspense fallback={<DashboardSkeleton />}>
        <ApplicationsStats />
      </Suspense>

      {/* Applications List */}
      <Suspense fallback={<DashboardSkeleton />}>
        <ApplicationsList />
      </Suspense>
    </div>
  )
}