import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ApplicationsList } from '@/components/applications/applications-list'
import { redirect } from 'next/navigation'

export default async function CandidateApplicationsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const supabase = createClient()
  
  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        tenants (name)
      )
    `)
    .eq('user_id', user.clerk_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>
      
      <ApplicationsList applications={applications || []} />
    </div>
  )
}