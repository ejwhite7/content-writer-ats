import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobManagement } from '@/components/admin/job-management'
import { JobManagementSkeleton } from '@/components/admin/job-management-skeleton'
import { SearchParams } from '@/types/common'

export const metadata: Metadata = {
  title: 'Job Management',
  description: 'Manage your job postings, track applications, and oversee the hiring process.',
}

interface AdminJobsPageProps {
  searchParams: SearchParams
}

export default async function AdminJobsPage({ searchParams }: AdminJobsPageProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your job postings and track applications.
          </p>
        </div>
        
        <Button asChild>
          <Link href="/admin/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Job Management Interface */}
      <Suspense fallback={<JobManagementSkeleton />}>
        <JobManagement searchParams={searchParams} />
      </Suspense>
    </div>
  )
}