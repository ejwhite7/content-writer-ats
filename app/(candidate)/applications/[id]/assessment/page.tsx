import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AssessmentForm } from '@/components/assessments/assessment-form'

interface AssessmentPageProps {
  params: {
    id: string
  }
}

async function getApplicationWithJob(applicationId: string, userId: string) {
  const supabase = createClient()
  
  const { data: application, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        *,
        job_settings (*)
      ),
      assessments (*)
    `)
    .eq('id', applicationId)
    .eq('user_id', userId)
    .single()

  if (error || !application) {
    return null
  }

  return application
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const application = await getApplicationWithJob(params.id, user.clerk_id)
  
  if (!application) {
    notFound()
  }

  // Check if assessment already exists
  const existingAssessment = application.assessments?.[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Writing Assessment
          </h1>
          <p className="text-lg text-muted-foreground">
            {application.jobs.title} - Complete your writing assessment
          </p>
        </div>
        
        <AssessmentForm 
          application={application}
          existingAssessment={existingAssessment}
          jobSettings={application.jobs.job_settings}
        />
      </div>
    </div>
  )
}