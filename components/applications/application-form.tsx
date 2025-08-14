'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { FileUpload } from '@/components/ui/file-upload'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

const applicationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().min(100, 'Cover letter must be at least 100 characters'),
  experience: z.string().min(50, 'Please describe your experience (minimum 50 characters)'),
  availability: z.string().min(10, 'Please describe your availability'),
  expectedRate: z.string().optional(),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  job: any
  user: any
}

const STEPS = [
  { id: 1, name: 'Personal Information', description: 'Basic details about you' },
  { id: 2, name: 'Portfolio & Resume', description: 'Upload your work samples' },
  { id: 3, name: 'Application Details', description: 'Cover letter and experience' },
  { id: 4, name: 'Review & Submit', description: 'Final review of your application' },
]

export function ApplicationForm({ job, user }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses?.[0]?.emailAddress || '',
      phone: '',
      portfolioUrl: '',
      coverLetter: '',
      experience: '',
      availability: '',
      expectedRate: '',
    },
  })

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }

  const onSubmit = async (data: ApplicationFormData) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Upload resume and portfolio files
      let resumeUrl = null
      let portfolioUrls: string[] = []

      if (resumeFile) {
        const resumePath = `resumes/${user.id}/${Date.now()}-${resumeFile.name}`
        resumeUrl = await uploadFile(resumeFile, 'resumes', resumePath)
      }

      if (portfolioFiles.length > 0) {
        portfolioUrls = await Promise.all(
          portfolioFiles.map(async (file, index) => {
            const portfolioPath = `portfolios/${user.id}/${Date.now()}-${index}-${file.name}`
            return await uploadFile(file, 'portfolios', portfolioPath)
          })
        )
      }

      // Create application record
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          portfolio_url: data.portfolioUrl,
          cover_letter: data.coverLetter,
          experience: data.experience,
          availability: data.availability,
          expected_rate: data.expectedRate,
          resume_url: resumeUrl,
          portfolio_files: portfolioUrls,
          status: 'applied',
          stage: 'applied',
        })

      if (applicationError) {
        throw applicationError
      }

      toast({
        title: 'Application Submitted!',
        description: 'Your application has been successfully submitted. We\'ll be in touch soon.',
      })

      router.push('/candidate/applications')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of 4</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-between mb-8">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center space-y-2 ${
              step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.id <= currentStep
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-muted-foreground'
              }`}
            >
              {step.id}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{step.name}</div>
              <div className="text-xs">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...form.register('firstName')}
                    error={form.formState.errors.firstName?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...form.register('lastName')}
                    error={form.formState.errors.lastName?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    error={form.formState.errors.email?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register('phone')}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    {...form.register('portfolioUrl')}
                    error={form.formState.errors.portfolioUrl?.message}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Portfolio & Resume */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Resume/CV</Label>
                  <FileUpload
                    accept=".pdf,.doc,.docx"
                    onFileSelect={(files) => {
                      if (Array.isArray(files)) {
                        setResumeFile(files[0] || null)
                      } else {
                        setResumeFile(files || null)
                      }
                    }}
                    maxSize={5 * 1024 * 1024} // 5MB
                    description="Upload your resume (PDF, DOC, or DOCX, max 5MB)"
                  />
                </div>
                <div>
                  <Label>Portfolio Files</Label>
                  <FileUpload
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                    onFileSelect={(files) => setPortfolioFiles(Array.isArray(files) ? files : [files])}
                    maxSize={10 * 1024 * 1024} // 10MB per file
                    description="Upload work samples (up to 5 files, 10MB each)"
                    maxFiles={5}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Application Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    rows={6}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    {...form.register('coverLetter')}
                    error={form.formState.errors.coverLetter?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Relevant Experience</Label>
                  <Textarea
                    id="experience"
                    rows={4}
                    placeholder="Describe your relevant writing experience, projects, and achievements..."
                    {...form.register('experience')}
                    error={form.formState.errors.experience?.message}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      id="availability"
                      placeholder="e.g., Full-time, Part-time, Weekends"
                      {...form.register('availability')}
                      error={form.formState.errors.availability?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedRate">Expected Rate (Optional)</Label>
                    <Input
                      id="expectedRate"
                      placeholder="e.g., $50/hour, $5000/month"
                      {...form.register('expectedRate')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Your Application</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {form.watch('firstName')} {form.watch('lastName')}</p>
                  <p><strong>Email:</strong> {form.watch('email')}</p>
                  <p><strong>Phone:</strong> {form.watch('phone') || 'Not provided'}</p>
                  <p><strong>Portfolio:</strong> {form.watch('portfolioUrl') || 'Not provided'}</p>
                  <p><strong>Resume:</strong> {resumeFile ? resumeFile.name : 'Not uploaded'}</p>
                  <p><strong>Portfolio Files:</strong> {portfolioFiles.length} file(s)</p>
                  <p><strong>Expected Rate:</strong> {form.watch('expectedRate') || 'Not specified'}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Cover Letter:</strong></p>
                  <p className="mt-2 text-sm">{form.watch('coverLetter')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}