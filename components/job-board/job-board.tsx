'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { JobCard } from './job-card'
import { JobFilters } from './job-filters'
import { JobSearch } from './job-search'
import { createClient } from '@/lib/supabase/client'
import { Job } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface JobBoardProps {
  searchParams: {
    search?: string
    type?: string
    location?: string
    compensation?: string
    page?: string
  }
}

export function JobBoard({ searchParams }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  const supabase = createClient()
  const itemsPerPage = 12

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  async function fetchJobs() {
    setLoading(true)
    
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          tenants (
            name,
            branding_settings (*)
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      // Apply search filter
      if (searchParams.search) {
        query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
      }

      // Apply type filter
      if (searchParams.type) {
        query = query.eq('job_type', searchParams.type)
      }

      // Apply location filter
      if (searchParams.location) {
        query = query.or(`location.ilike.%${searchParams.location}%,remote_allowed.eq.true`)
      }

      // Apply compensation filter
      if (searchParams.compensation) {
        const [min, max] = searchParams.compensation.split('-').map(Number)
        if (min) query = query.gte('compensation_min', min)
        if (max) query = query.lte('compensation_max', max)
      }

      // Apply pagination
      const page = parseInt(searchParams.page || '1')
      const start = (page - 1) * itemsPerPage
      const end = start + itemsPerPage - 1
      
      query = query.range(start, end)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching jobs:', error)
        return
      }

      setJobs(data || [])
      setTotalCount(count || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error in fetchJobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <JobSearch />
        </div>
        <JobFilters />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {jobs.length} of {totalCount} jobs
        </p>
      </div>

      {/* Job Grid */}
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Button
            variant="outline"
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set('page', (currentPage - 1).toString())
              window.location.href = url.toString()
            }}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set('page', (currentPage + 1).toString())
              window.location.href = url.toString()
            }}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}