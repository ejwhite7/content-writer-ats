'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  MessageSquare, 
  FileText,
  Home,
  Eye
} from 'lucide-react'
import { Job } from '@/types/database'

interface SuccessStepProps {
  applicationId: string | null
  job: Job
}

export function SuccessStep({ applicationId, job }: SuccessStepProps) {
  const router = useRouter()

  const handleViewApplication = () => {
    if (applicationId) {
      router.push(`/candidate/applications/${applicationId}`)
    }
  }

  const handleViewDashboard = () => {
    router.push('/candidate/dashboard')
  }

  const handleBrowseJobs = () => {
    router.push('/jobs')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-600">Application Submitted!</h1>
          <p className="text-xl text-muted-foreground">
            Your application for <span className="font-semibold">{job.title}</span> has been successfully submitted.
          </p>
        </div>
      </div>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Details
          </CardTitle>
          <CardDescription>
            Your application has been received and is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Position</h4>
              <p className="font-semibold">{job.title}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Company</h4>
              <p className="font-semibold">{job.tenants?.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Application ID</h4>
              <p className="font-mono text-sm">{applicationId || 'Processing...'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
              <Badge variant="secondary">Applied</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium">Application Review</h4>
                <p className="text-sm text-muted-foreground">
                  Our hiring team will review your application and resume.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium">Assessment (if selected)</h4>
                <p className="text-sm text-muted-foreground">
                  You may receive a writing assessment to showcase your skills.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium">Interview Process</h4>
                <p className="text-sm text-muted-foreground">
                  Shortlisted candidates will be invited for interviews.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-xs font-semibold text-primary">4</span>
              </div>
              <div>
                <h4 className="font-medium">Decision & Onboarding</h4>
                <p className="text-sm text-muted-foreground">
                  Final decision and onboarding for successful candidates.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <MessageSquare className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-700">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>You'll receive a confirmation email shortly with your application details.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Track your application status in your candidate dashboard.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>We'll contact you via email for any updates or next steps.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Response time is typically 5-7 business days.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {applicationId && (
          <Button onClick={handleViewApplication} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View My Application
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleViewDashboard}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={handleBrowseJobs}
          className="flex items-center gap-2"
        >
          Browse More Jobs
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}