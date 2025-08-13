import { Suspense } from 'react'
import { Metadata } from 'next'
import { JobBoard } from '@/components/job-board/job-board'
import { JobBoardSkeleton } from '@/components/job-board/job-board-skeleton'
import { HeroSection } from '@/components/marketing/hero-section'

export const metadata: Metadata = {
  title: 'Content Writer Jobs - Find Your Next Writing Opportunity',
  description: 'Discover exciting content writing opportunities with leading companies. Apply to vetted positions and start your writing career today.',
  openGraph: {
    title: 'Content Writer Jobs - Find Your Next Writing Opportunity',
    description: 'Discover exciting content writing opportunities with leading companies. Apply to vetted positions and start your writing career today.',
    type: 'website',
  },
}

interface JobsPageProps {
  searchParams: {
    search?: string
    type?: string
    location?: string
    compensation?: string
    page?: string
  }
}

export default function JobsPage({ searchParams }: JobsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Content Writing Opportunities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join leading companies looking for talented content writers. 
            Browse our curated job listings and find your perfect role.
          </p>
        </div>
        
        <Suspense fallback={<JobBoardSkeleton />}>
          <JobBoard searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}