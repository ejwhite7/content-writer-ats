'use client'

import { Job } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Eye, 
  Calendar,
  Building,
  GraduationCap,
  Star,
  Share,
  Heart,
  ChevronLeft,
  ExternalLink
} from 'lucide-react'
import { cn, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

interface JobDetailProps {
  job: Job
  showBackButton?: boolean
  onApply?: (jobId: string) => void
  onSave?: (jobId: string) => void
  onShare?: (job: Job) => void
  isApplied?: boolean
  isSaved?: boolean
  isLoading?: boolean
}

export function JobDetail({ 
  job, 
  showBackButton = false,
  onApply,
  onSave,
  onShare,
  isApplied = false,
  isSaved = false,
  isLoading = false
}: JobDetailProps) {
  const handleApply = () => {
    if (onApply && !isApplied) {
      onApply(job.id)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(job.id)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(job)
    }
  }

  const getWorkModeIcon = (mode: string) => {
    switch (mode) {
      case 'remote':
        return '🏠'
      case 'hybrid':
        return '🔄'
      case 'onsite':
        return '🏢'
      default:
        return '📍'
    }
  }

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'success'
      case 'mid':
        return 'info'
      case 'senior':
        return 'warning'
      case 'executive':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {showBackButton && (
            <Link 
              href="/jobs" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Jobs
            </Link>
          )}
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-2 text-xl text-muted-foreground">
              <Building className="h-5 w-5" />
              <span>{job.tenant?.name || 'Company'}</span>
            </div>
          </div>

          {/* Key Details */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location_city}, {job.location_country}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{job.is_remote ? '🏡' : '🏢'}</span>
              <span className="capitalize">{job.is_remote ? 'Remote' : 'On-site'}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{job.work_type?.replace('_', ' ')}</span>
            </div>

            {(job.compensation_min || job.compensation_max) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  {job.compensation_min && job.compensation_max 
                    ? `$${job.compensation_min.toLocaleString()}-${job.compensation_max.toLocaleString()}` 
                    : job.compensation_min 
                    ? `From $${job.compensation_min.toLocaleString()}` 
                    : `Up to $${job.compensation_max?.toLocaleString()}`
                  }
                  /{job.compensation_frequency || 'hour'}
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={getExperienceLevelColor(job.experience_level) as any}>
              {job.experience_level} Level
            </Badge>
            <Badge variant="outline">
              {job.status}
            </Badge>
            {job.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[120px]">
          <Button 
            onClick={handleApply} 
            disabled={isApplied || isLoading}
            className="w-full"
          >
            {isApplied ? 'Applied' : 'Apply Now'}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="flex-1"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{job.applications_count} applicants</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{job.views_count} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Posted {formatRelativeTime(job.createdAt)}</span>
        </div>
        {job.application_deadline && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Deadline: {formatDate(job.application_deadline)}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Description */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-muted-foreground">
                <p className="leading-relaxed">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Experience Level</dt>
                <dd className="mt-1 text-sm capitalize">{job.experience_level}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Employment Type</dt>
                <dd className="mt-1 text-sm capitalize">{job.work_type?.replace('_', ' ')}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Work Arrangement</dt>
                <dd className="mt-1 text-sm capitalize">{job.is_remote ? 'Remote' : 'On-site'}</dd>
              </div>

            </CardContent>
          </Card>


          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>About {job.tenant?.name || 'Company'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Learn more about this company and their other opportunities.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Company Profile
              </Button>
            </CardContent>
          </Card>

          {/* Application CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <h3 className="font-semibold">Ready to Apply?</h3>
                <p className="text-sm text-muted-foreground">
                  Join {job.applications_count} other candidates who have applied for this position.
                </p>
                <Button 
                  onClick={handleApply} 
                  disabled={isApplied || isLoading}
                  className="w-full"
                >
                  {isApplied ? 'Application Submitted' : 'Apply Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}