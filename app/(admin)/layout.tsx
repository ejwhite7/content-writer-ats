import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  // Check if user is authenticated and has admin role
  if (!user) {
    redirect('/sign-in')
  }

  const userRole = user.publicMetadata?.role as string
  if (userRole !== 'admin') {
    redirect('/jobs')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}