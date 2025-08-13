import { SearchParams } from '@/types/common'

interface JobManagementProps {
  searchParams: SearchParams
}

export function JobManagement({ searchParams }: JobManagementProps) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Job Listings</h3>
      </div>
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>No jobs found. Create your first job posting!</p>
        </div>
      </div>
    </div>
  )
}