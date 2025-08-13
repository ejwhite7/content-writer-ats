import { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/candidate/profile-form'
import { ProfileSettings } from '@/components/candidate/profile-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your profile information and preferences.',
}

export default async function ProfilePage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirect_url=/candidate/profile')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information, preferences, and application settings.
        </p>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <ProfileForm user={user} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <ProfileSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}