'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { 
  ArrowLeft,
  Building, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  ExternalLink,
  User,
  Mail,
  Phone,
  Globe,
  Languages,
  Star,
  MessageSquare,
  Send,
  Download,
  Eye
} from 'lucide-react'
import { Application } from '@/types/database'

interface ApplicationDetailProps {
  application: Application & {
    job?: {
      id: string
      title: string
      description?: string
      tenant?: {
        name: string
      }
    }
    assessment?: {
      id: string
      prompt?: string
      submission_content?: string
      submitted_at?: string
      composite_score?: number
    }
    messages?: Array<{
      id: string
      content: string
      createdAt: string
      sender?: {
        first_name?: string
        last_name?: string
      }
    }>
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

const COMPENSATION_FREQUENCY_LABELS = {
  per_word: 'Per Word',
  per_article: 'Per Article',
  per_hour: 'Per Hour',
  per_project: 'Per Project',
  monthly: 'Monthly',
}

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSendingMessage(true)
      // TODO: Implement message sending API
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the hiring team.',
      })
      setNewMessage('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleViewJob = () => {
    if (application.job?.id) {
      router.push(`/jobs/${application.job.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 px-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          
          <h1 className="text-3xl font-bold">
            {application.job?.title || 'Application Details'}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{application.job?.tenant?.name || 'Company'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={STATUS_COLORS[application.status] as any}
            className="text-sm px-3 py-1"
          >
            {STATUS_LABELS[application.status]}
          </Badge>
          
          {application.job?.id && (
            <Button variant="outline" onClick={handleViewJob}>
              <Eye className="h-4 w-4 mr-2" />
              View Job
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Application Overview</CardTitle>
              <CardDescription>
                Submitted on {format(new Date(application.createdAt), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Applied:</span>
                    <span>{format(new Date(application.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {application.location_city && application.location_country && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{application.location_city}, {application.location_country}</span>
                    </div>
                  )}
                  
                  {application.time_zone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Time Zone:</span>
                      <span>{application.time_zone}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {application.desired_compensation_amount && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Desired Compensation:</span>
                      <span>
                        ${application.desired_compensation_amount} {application.desired_compensation_frequency ? COMPENSATION_FREQUENCY_LABELS[application.desired_compensation_frequency] : ''}
                      </span>
                    </div>
                  )}
                  
                  {application.availability_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Available From:</span>
                      <span>{format(new Date(application.availability_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {application.years_experience !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Experience:</span>
                      <span>{application.years_experience} years</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed">
                  {application.cover_letter}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment */}
          {application.assessment && (
            <Card>
              <CardHeader>
                <CardTitle>Writing Assessment</CardTitle>
                {application.assessment.submitted_at && (
                  <CardDescription>
                    Submitted on {format(new Date(application.assessment.submitted_at), 'MMMM d, yyyy')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {application.assessment.prompt && (
                  <div>
                    <h4 className="font-medium mb-2">Prompt:</h4>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      {application.assessment.prompt}
                    </div>
                  </div>
                )}
                
                {application.assessment.submission_content && (
                  <div>
                    <h4 className="font-medium mb-2">Your Submission:</h4>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm max-h-60 overflow-y-auto">
                      {application.assessment.submission_content}
                    </div>
                  </div>
                )}
                
                {application.assessment.composite_score && (
                  <div>
                    <h4 className="font-medium mb-2">Score:</h4>
                    <Badge variant="outline">
                      {Math.round(application.assessment.composite_score * 100)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Communication */}
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Messages between you and the hiring team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages List */}
              {application.messages && application.messages.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {application.messages.map((message) => (
                    <div key={message.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {message.sender?.first_name} {message.sender?.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  No messages yet. Send a message to the hiring team if you have any questions.
                </p>
              )}
              
              {/* Send Message */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.resume_file_id && (
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              )}
              
              {application.portfolio_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open(application.portfolio_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => router.push('/candidate/applications')}
              >
                <FileText className="h-4 w-4 mr-2" />
                All Applications
              </Button>
            </CardContent>
          </Card>

          {/* Languages */}
          {application.languages && application.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{lang.language}</span>
                      <Badge variant="outline" className="text-xs">
                        {lang.proficiency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specialties */}
          {application.specialties && application.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {application.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div>
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(application.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                {application.assessment?.submitted_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div>
                      <p className="font-medium">Assessment Submitted</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(application.assessment.submitted_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                
                {application.shortlisted_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium">Shortlisted</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(application.shortlisted_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                
                {application.hired_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div>
                      <p className="font-medium">Hired</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(application.hired_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                
                {application.rejected_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div>
                      <p className="font-medium">Application Closed</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(application.rejected_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}