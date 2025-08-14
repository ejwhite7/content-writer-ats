'use client'

import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  Languages, 
  Star, 
  CheckCircle
} from 'lucide-react'
import { Job } from '@/types/database'

interface ReviewStepProps {
  form: UseFormReturn<any>
  job: Job
}

const COMPENSATION_FREQUENCY_LABELS = {
  per_word: 'Per Word',
  per_article: 'Per Article',
  per_hour: 'Per Hour',
  per_project: 'Per Project',
  monthly: 'Monthly',
}

export function ReviewStep({ form, job }: ReviewStepProps) {
  const formData = form.getValues()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Review Your Application</h2>
        <p className="text-muted-foreground">
          Please review all the information below before submitting your application.
        </p>
      </div>

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-muted-foreground">{job.tenant?.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{job.work_type}</Badge>
            {job.is_remote && <Badge variant="outline">Remote</Badge>}
            <Badge variant="outline">{job.experience_level} Level</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span>
                <span>{formData.phone}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{formData.location?.city}, {formData.location?.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Time Zone:</span>
                <span>{formData.timeZone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Resume:</span>
              <span>{formData.resumeFile ? '✓ Uploaded' : 'Not uploaded'}</span>
            </div>
            {formData.portfolioUrl && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Portfolio:</span>
                <a 
                  href={formData.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {formData.portfolioUrl}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Cover Letter:</h4>
            <div className="bg-muted/50 rounded-lg p-4 text-sm max-h-40 overflow-y-auto">
              {formData.coverLetter || 'No cover letter provided'}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Desired Compensation:</span>
                <span>
                  ${formData.desiredCompensation?.amount} {formData.desiredCompensation?.frequency && COMPENSATION_FREQUENCY_LABELS[formData.desiredCompensation.frequency as keyof typeof COMPENSATION_FREQUENCY_LABELS]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Available From:</span>
                <span>
                  {formData.availabilityDate ? format(new Date(formData.availabilityDate), 'PPP') : 'Not specified'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Experience:</span>
                <span>{formData.yearsExperience} years</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages & Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages & Specialties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.languages && formData.languages.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Languages:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang: any, index: number) => (
                  <Badge key={index} variant="outline">
                    {lang.language} ({lang.proficiency})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {formData.specialties && formData.specialties.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Specialties:
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-semibold">Ready to Submit?</h4>
            <p className="text-sm text-muted-foreground">
              By submitting this application, you confirm that all information provided is accurate and complete.
              You'll receive a confirmation email and can track your application status in your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}