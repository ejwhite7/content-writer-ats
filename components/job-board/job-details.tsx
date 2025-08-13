import { Job } from '@/types'

interface JobDetailsProps {
  job: Job
}

export function JobDetails({ job }: JobDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-xl text-muted-foreground">{job.company}</p>
      </div>
      <div className="prose max-w-none">
        <p>{job.description}</p>
      </div>
    </div>
  )
}