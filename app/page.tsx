import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export default async function HomePage() {
  const user = await currentUser()

  // Redirect based on user role or to public job board if not authenticated
  if (!user) {
    redirect('/jobs')
  }

  // Get user role from metadata or database
  const userRole = user.publicMetadata?.role as string

  switch (userRole) {
    case 'admin':
      redirect('/admin/dashboard')
    case 'candidate':
      redirect('/candidate/dashboard')
    default:
      redirect('/jobs')
  }
}