import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs'
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

  return (
    <div className="space-y-8">
      <ApplicationDetail application={application} />
    </div>
  )
}