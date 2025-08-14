'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

export interface Job {
  id: string
  title: string
}

export interface ApplicationsFiltersProps {
  jobs: Job[]
  currentFilters: {
    stage?: string
    job?: string
    search?: string
    page?: string
    sort?: string
  }
}

const STAGE_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'assessment_submitted', label: 'Assessment Submitted' },
  { value: 'ai_reviewed', label: 'AI Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'manual_review', label: 'Manual Review' },
  { value: 'paid_assignment', label: 'Paid Assignment' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
]

export function ApplicationsFilters({
  jobs,
  currentFilters
}: ApplicationsFiltersProps): JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams)
    
    if (value && value !== '') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset page when filtering
    params.delete('page')
    
    router.push(`?${params.toString()}`)
  }

  const clearAllFilters = (): void => {
    router.push('/admin/applications')
  }

  const hasActiveFilters = (): boolean => {
    return Boolean(
      currentFilters.stage || 
      currentFilters.job || 
      currentFilters.search
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={currentFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stage Filter */}
        <Select
          value={currentFilters.stage || ''}
          onValueChange={(value) => updateFilter('stage', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGE_OPTIONS.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job Filter */}
        <Select
          value={currentFilters.job || ''}
          onValueChange={(value) => updateFilter('job', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All positions</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters() && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
