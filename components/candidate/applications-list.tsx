'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { 
  Eye, 
  Calendar, 
  Building, 
  MapPin, 
  DollarSign,
  AlertCircle,
  FileText
} from 'lucide-react'
import { Application } from '@/types/database'

interface ApplicationWithJob extends Omit<Application, 'job'> {
  job?: {
    id: string
    title: string
    tenant?: {
      name: string
    }
  }
}

const STATUS_COLORS = {
  applied: 'secondary',
  assessment_submitted: 'default',
  ai_reviewed: 'default',
  shortlisted: 'default',
  manual_review: 'default',
  paid_assignment: 'default',
  live_assignment: 'default',
  hired: 'default',
  rejected: 'destructive',
  terminated: 'destructive',
} as const

const STATUS_LABELS = {
  applied: 'Applied',
  assessment_submitted: 'Assessment Submitted',
  ai_reviewed: 'Under Review',
  shortlisted: 'Shortlisted',
  manual_review: 'In Review',
  paid_assignment: 'Paid Assignment',
  live_assignment: 'Live Assignment',
  hired: 'Hired',
  rejected: 'Rejected',
  terminated: 'Terminated',
}

export function ApplicationsList() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications')
      toast({
        title: 'Error',
        description: 'Failed to load your applications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewApplication = (applicationId: string) => {
    router.push(`/candidate/applications/${applicationId}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold">Failed to Load Applications</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={fetchApplications}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold">No Applications Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You haven't submitted any job applications yet.
              </p>
            </div>
            <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Applications</h2>
        <span className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {applications.map((application) => (
        <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">
                    {application.job?.title || 'Position Title'}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{application.job?.tenant?.name || 'Company Name'}</span>
                  </div>
                </div>
                <Badge 
                  variant={STATUS_COLORS[application.status] as any}
                  className="ml-2"
                >
                  {STATUS_LABELS[application.status]}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                {application.location_city && application.location_country && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{application.location_city}, {application.location_country}</span>
                  </div>
                )}
                
                {application.desired_compensation_amount && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      ${application.desired_compensation_amount} {application.desired_compensation_frequency}
                    </span>
                  </div>
                )}
              </div>

              {/* Cover Letter Preview */}
              {application.cover_letter && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {application.cover_letter}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {application.updatedAt !== application.createdAt && (
                    <span>Updated {format(new Date(application.updatedAt), 'MMM d, yyyy')}</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewApplication(application.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}