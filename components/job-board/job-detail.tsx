'use client'

import { Job } from '@/types'
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
              <span>{job.company}</span>
              {job.department && (
                <>
                  <span>•</span>
                  <span>{job.department}</span>
                </>
              )}
            </div>
          </div>

          {/* Key Details */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location.city}, {job.location.state || job.location.country}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{getWorkModeIcon(job.workMode)}</span>
              <span className="capitalize">{job.workMode}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{job.workType.replace('-', ' ')}</span>
            </div>

            {job.salaryRange && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatCurrency(job.salaryRange.min, job.salaryRange.currency)} - {formatCurrency(job.salaryRange.max, job.salaryRange.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={getExperienceLevelColor(job.experienceLevel) as any}>
              {job.experienceLevel} Level
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
          <span>{job.applicationsCount} applicants</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{job.viewsCount} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Posted {formatRelativeTime(job.createdAt)}</span>
        </div>
        {job.applicationDeadline && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Deadline: {formatDate(job.applicationDeadline)}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          {job.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{job.summary}</p>
              </CardContent>
            </Card>
          )}

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

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
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
                <dd className="mt-1 text-sm capitalize">{job.experienceLevel}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Employment Type</dt>
                <dd className="mt-1 text-sm capitalize">{job.workType.replace('-', ' ')}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Work Arrangement</dt>
                <dd className="mt-1 text-sm capitalize">{job.workMode}</dd>
              </div>

              {job.educationRequired && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Education</dt>
                  <dd className="mt-1 text-sm flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {job.educationRequired}
                  </dd>
                </div>
              )}

              {job.startDate && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                  <dd className="mt-1 text-sm">{formatDate(job.startDate)}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>About {job.company}</CardTitle>
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
                  Join {job.applicationsCount} other candidates who have applied for this position.
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