import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { ApplicationDetail } from '@/components/candidate/application-detail'
import { Application } from '@/types/database'

interface ApplicationDetailPageProps {
  params: {
    id: string
  }
}

async function getApplication(id: string, userId: string): Promise<Application | null> {
  const supabase = createClient()
  
  const { data: application, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs (
        *,
        tenant:tenants (
          name,
          branding_settings (*)
        )
      ),
      assessment:assessments (*),
      messages (*)
    `)
    .eq('id', id)
    .eq('candidate_id', userId)
    .single()

  if (error || !application) {
    return null
  }

  return application as Application
}

export async function generateMetadata({ params }: ApplicationDetailPageProps): Promise<Metadata> {
  const user = await currentUser()
  
  if (!user) {
    return { title: 'Application Not Found' }
  }

  const supabase = createClient()
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  if (!existingUser) {
    return { title: 'Application Not Found' }
  }

  const application = await getApplication(params.id, existingUser.id)

  if (!application) {
    return { title: 'Application Not Found' }
  }

  return {
    title: `Application for ${application.job?.title}`,
    description: `View your application status and details for ${application.job?.title}`,
  }
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const user = await currentUser()
  
  if (!user) {
    redirect(`/sign-in?redirect_url=/candidate/applications/${params.id}`)
  }

  const supabase = createClient()
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  if (!existingUser) {
    redirect('/sign-up')
  }

  const application = await getApplication(params.id, existingUser.id)

  if (!application) {
    notFound()
  }

  // Transform the application data to match component expectations
  const transformedApplication = {
    ...application,
    job: application.job ? {
      id: application.job.id,
      title: application.job.title,
      description: application.job.description,
      tenant: application.job.tenant
    } : undefined,
    assessment: application.assessment ? {
      id: application.assessment.id,
      prompt: application.assessment.prompt,
      submission_content: application.assessment.submission_content,
      submitted_at: application.assessment.submitted_at ? application.assessment.submitted_at.toISOString() : undefined,
      composite_score: application.assessment.composite_score
    } : undefined,
    messages: application.messages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.createdAt?.toISOString() || new Date().toISOString(),
      sender: msg.sender
    })) || []
  }

  return (
    <div className="space-y-8">
      <ApplicationDetail application={transformedApplication as any} />
    </div>
  )
}