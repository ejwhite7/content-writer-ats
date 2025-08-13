import { notFound, redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { ApplicationForm } from '@/components/applications/application-form'

interface ApplyPageProps {
  params: {
    id: string
  }
}

async function getJob(id: string) {
  const supabase = createClient()
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !job) {
    return null
  }

  return job
}

async function checkExistingApplication(jobId: string, clerkId: string) {
  const supabase = createClient()
  
  const { data: application } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', clerkId)
    .single()

  return application
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirect=/jobs/' + params.id + '/apply')
  }

  const job = await getJob(params.id)
  
  if (!job) {
    notFound()
  }

  // Check if user already applied
  const existingApplication = await checkExistingApplication(params.id, user.id)
  
  if (existingApplication) {
    redirect(`/candidate/applications/${existingApplication.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete your application to be considered for this position
          </p>
        </div>
        
        <ApplicationForm job={job} user={user} />
      </div>
    </div>
  )
}