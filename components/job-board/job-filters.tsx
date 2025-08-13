'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
]

const LOCATIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'new-york', label: 'New York' },
  { value: 'san-francisco', label: 'San Francisco' },
  { value: 'london', label: 'London' },
  { value: 'toronto', label: 'Toronto' },
]

const COMPENSATION_RANGES = [
  { value: '0-25', label: 'Under $25/hr' },
  { value: '25-50', label: '$25-50/hr' },
  { value: '50-75', label: '$50-75/hr' },
  { value: '75-100', label: '$75-100/hr' },
  { value: '100-', label: 'Over $100/hr' },
]

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentType = searchParams.get('type')
  const currentLocation = searchParams.get('location')
  const currentCompensation = searchParams.get('compensation')

  const updateFilter = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    if (value) {
      current.set(key, value)
    } else {
      current.delete(key)
    }
    
    // Reset to first page when filters change
    current.delete('page')
    
    const search = current.toString()
    const query = search ? `?${search}` : ''
    
    router.push(`/jobs${query}`)
  }

  const clearAllFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.delete('type')
    current.delete('location')
    current.delete('compensation')
    current.delete('page')
    
    const search = current.toString()
    const query = search ? `?${search}` : ''
    
    router.push(`/jobs${query}`)
  }

  const hasActiveFilters = currentType || currentLocation || currentCompensation

  return (
    <div className="flex items-center gap-2">
      {/* Job Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Job Type
            {currentType && <Badge variant="secondary">1</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Job Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => updateFilter('type', null)}
            className={!currentType ? 'bg-accent' : ''}
          >
            All Types
          </DropdownMenuItem>
          {JOB_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => updateFilter('type', type.value)}
              className={currentType === type.value ? 'bg-accent' : ''}
            >
              {type.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Location
            {currentLocation && <Badge variant="secondary">1</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Location</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => updateFilter('location', null)}
            className={!currentLocation ? 'bg-accent' : ''}
          >
            All Locations
          </DropdownMenuItem>
          {LOCATIONS.map((location) => (
            <DropdownMenuItem
              key={location.value}
              onClick={() => updateFilter('location', location.value)}
              className={currentLocation === location.value ? 'bg-accent' : ''}
            >
              {location.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Compensation Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Compensation
            {currentCompensation && <Badge variant="secondary">1</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hourly Rate</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => updateFilter('compensation', null)}
            className={!currentCompensation ? 'bg-accent' : ''}
          >
            Any Rate
          </DropdownMenuItem>
          {COMPENSATION_RANGES.map((range) => (
            <DropdownMenuItem
              key={range.value}
              onClick={() => updateFilter('compensation', range.value)}
              className={currentCompensation === range.value ? 'bg-accent' : ''}
            >
              {range.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearAllFilters} className="text-muted-foreground">
          Clear All
        </Button>
      )}
    </div>
  )
}