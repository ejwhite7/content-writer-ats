'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@clerk/nextjs/server'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Job } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PersonalInfoStep } from './personal-info-step'
import { ResumeUploadStep } from './resume-upload-step'
import { ApplicationQuestionsStep } from './application-questions-step'
import { ReviewStep } from './review-step'
import { SuccessStep } from './success-step'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  timeZone: z.string().min(1, 'Time zone is required'),
  
  // Resume & Portfolio
  resumeFile: z.any().optional(),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  
  // Application Details
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  desiredCompensation: z.object({
    amount: z.number().min(1, 'Compensation amount is required'),
    frequency: z.enum(['per_word', 'per_article', 'per_hour', 'per_project', 'monthly']),
    currency: z.string().default('USD'),
  }),
  availabilityDate: z.date(),
  yearsExperience: z.number().min(0, 'Years of experience must be 0 or greater'),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']),
  })),
  specialties: z.array(z.string()),
  
  // Additional Questions
  customQuestions: z.record(z.string(), z.string()),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface JobApplicationFormProps {
  job: Job
  user: User
}

const STEPS = [
  { id: 'personal', title: 'Personal Info', description: 'Basic information about you' },
  { id: 'resume', title: 'Resume & Portfolio', description: 'Upload your documents' },
  { id: 'questions', title: 'Application Questions', description: 'Complete your application' },
  { id: 'review', title: 'Review', description: 'Review and submit' },
  { id: 'success', title: 'Complete', description: 'Application submitted' },
]

export function JobApplicationForm({ job, user }: JobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      phone: '',
      location: { city: '', country: '' },
      timeZone: '',
      portfolioUrl: '',
      coverLetter: '',
      desiredCompensation: {
        amount: 0,
        frequency: 'per_article',
        currency: 'USD',
      },
      availabilityDate: new Date(),
      yearsExperience: 0,
      languages: [],
      specialties: [],
      customQuestions: {},
    },
    mode: 'onChange',
  })

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = async () => {
    const stepFields = getStepFields(currentStep)
    const isValid = await form.trigger(stepFields)
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      nextStep()
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      const result = await response.json()
      setApplicationId(result.applicationId)
      nextStep() // Move to success step
      
      toast({
        title: 'Application Submitted!',
        description: 'Your application has been successfully submitted.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepFields = (step: number): (keyof ApplicationFormData)[] => {
    switch (step) {
      case 0: // Personal Info
        return ['firstName', 'lastName', 'email', 'phone', 'location', 'timeZone']
      case 1: // Resume
        return ['resumeFile', 'portfolioUrl']
      case 2: // Questions
        return ['coverLetter', 'desiredCompensation', 'availabilityDate', 'yearsExperience', 'languages', 'specialties', 'customQuestions']
      default:
        return []
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep form={form} />
      case 1:
        return <ResumeUploadStep form={form} job={job} />
      case 2:
        return <ApplicationQuestionsStep form={form} job={job} />
      case 3:
        return <ReviewStep form={form} job={job} />
      case 4:
        return <SuccessStep applicationId={applicationId} job={job} />
      default:
        return null
    }
  }

  if (currentStep === 4) {
    return renderStepContent()
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {STEPS.length - 1}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Indicator */}
          <div className="flex justify-between items-center">
            {STEPS.slice(0, -1).map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="hidden sm:block">
                  <div className="font-medium text-sm">{step.title}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">
              {currentStepData.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === STEPS.length - 2 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="min-w-[120px]"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}