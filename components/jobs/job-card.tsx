import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Job interface that matches the test expectations
export interface JobCardJob {
  id: string
  title: string
  company?: string
  location?: string
  job_type?: string
  salary_min?: number | null
  salary_max?: number | null
  description: string
  requirements?: string[]
  posted_at: string
  remote_allowed?: boolean
  tenants?: {
    name: string
    branding_settings?: {
      primary_color?: string
      logo_url?: string
    }
  }
}

interface JobCardProps {
  job: JobCardJob
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
    }
    if (job.salary_min) {
      return `From $${job.salary_min.toLocaleString()}`
    }
    return 'Salary negotiable'
  }

  const formatJobType = (type?: string) => {
    if (!type) return 'Full Time'
    
    switch (type.toLowerCase()) {
      case 'full_time':
        return 'Full Time'
      case 'part_time':
        return 'Part Time'
      case 'contract':
        return 'Contract'
      case 'freelance':
        return 'Freelance'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    }
  }

  const getLocationDisplay = () => {
    if (job.remote_allowed && job.location) {
      return `${job.location} (Remote OK)`
    }
    if (job.remote_allowed) {
      return 'Remote'
    }
    return job.location || 'Location not specified'
  }

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              {job.company || job.tenants?.name || 'Company'}
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {formatJobType(job.job_type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {truncateDescription(job.description)}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{getLocationDisplay()}</span>
          </div>
          
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>{formatSalary()}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              Posted {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        {job.requirements && job.requirements.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {job.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.requirements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button className="w-full">
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  )
}