import Link from 'next/link'
import { Job } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const formatCompensation = () => {
    if (job.compensation_min && job.compensation_max) {
      return `$${job.compensation_min}-${job.compensation_max}/${job.compensation_frequency || 'hour'}`
    }
    if (job.compensation_min) {
      return `From $${job.compensation_min}/${job.compensation_frequency || 'hour'}`
    }
    return 'Compensation negotiable'
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
              {job.tenant?.name || 'Company'}
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {job.work_type || 'Full-time'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {job.location_city ? `${job.location_city}, ${job.location_country || 'Unknown'}` : (job.is_remote ? 'Remote' : 'Location TBD')}
              {job.is_remote && job.location_city && ' (Remote OK)'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{formatCompensation()}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
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
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}