'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Building, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  status: string
  stage: string
  created_at: string
  jobs: {
    id: string
    title: string
    tenants: {
      name: string
    }
  }
}

interface ApplicationsListProps {
  applications: Application[]
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'applied':
      return 'bg-blue-100 text-blue-800'
    case 'reviewed':
      return 'bg-yellow-100 text-yellow-800'
    case 'shortlisted':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'hired':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStageDisplay = (stage: string) => {
  const stages = {
    applied: 'Applied',
    assessment_submitted: 'Assessment Submitted',
    ai_reviewed: 'AI Reviewed',
    shortlisted: 'Shortlisted',
    manual_review: 'Manual Review',
    paid_assignment: 'Paid Assignment',
    hired: 'Hired',
    rejected: 'Rejected'
  }
  return stages[stage as keyof typeof stages] || stage
}

export function ApplicationsList({ applications }: ApplicationsListProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-medium mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by browsing our job listings and applying to positions that interest you.
          </p>
          <Button asChild>
            <Link href="/jobs">
              Browse Jobs
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {application.jobs.title}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-1" />
                  {application.jobs.tenants.name}
                </div>
              </div>
              <Badge className={getStatusColor(application.status)}>
                {getStageDisplay(application.stage)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link href={`/candidate/applications/${application.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}