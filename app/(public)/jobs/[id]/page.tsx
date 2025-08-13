import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { JobDetail } from '@/components/job-board/job-detail'
import { createClient } from '@/lib/supabase/server'
import { Job } from '@/types/database'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

async function getJob(id: string): Promise<Job | null> {
  const supabase = createClient()
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      tenants (
        name,
        branding_settings (*)
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !job) {
    return null
  }

  return job as Job
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const job = await getJob(params.id)

  if (!job) {
    return {
      title: 'Job Not Found',
    }
  }

  return {
    title: `${job.title} - ${job.tenants?.name || 'Content Writer Job'}`,
    description: job.description?.slice(0, 160) || 'Content writing opportunity',
    openGraph: {
      title: `${job.title} - ${job.tenants?.name || 'Content Writer Job'}`,
      description: job.description?.slice(0, 160) || 'Content writing opportunity',
      type: 'website',
    },
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await getJob(params.id)

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <JobDetail job={job} />
      </main>
    </div>
  )
}

export async function generateStaticParams() {
  const supabase = createClient()
  
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('status', 'published')

  return jobs?.map((job) => ({
    id: job.id,
  })) || []
}