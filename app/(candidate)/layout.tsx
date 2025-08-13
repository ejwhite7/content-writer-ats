import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { CandidateSidebar } from '@/components/layout/candidate-sidebar'
import { CandidateHeader } from '@/components/layout/candidate-header'

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  // Check if user is authenticated and has candidate role
  if (!user) {
    redirect('/sign-in')
  }

  const userRole = user.publicMetadata?.role as string
  if (userRole !== 'candidate') {
    redirect('/jobs')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <CandidateSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CandidateHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}