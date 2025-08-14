'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Send, Clock } from 'lucide-react'

const assessmentSchema = z.object({
  content: z.string().min(100, 'Assessment must be at least 100 characters'),
  notes: z.string().optional(),
})

type AssessmentFormData = z.infer<typeof assessmentSchema>

interface AssessmentFormProps {
  application: any
  existingAssessment?: any
  jobSettings: any
}

export function AssessmentForm({ 
  application, 
  existingAssessment, 
  jobSettings 
}: AssessmentFormProps) {
  const [content, setContent] = useState(existingAssessment?.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(
    existingAssessment ? new Date(existingAssessment.updated_at) : null
  )
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      content: existingAssessment?.content || '',
      notes: existingAssessment?.notes || '',
    },
  })

  // Auto-save functionality
  const autoSave = async () => {
    if (content.length < 10) return // Don't save very short content
    
    setIsSaving(true)
    
    try {
      const assessmentData = {
        application_id: application.id,
        content,
        notes: form.getValues('notes') || '',
        status: 'draft',
        word_count: content.split(/\s+/).length,
      }

      if (existingAssessment) {
        const { error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existingAssessment.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('assessments')
          .insert(assessmentData)
          
        if (error) throw error
      }
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save every 30 seconds
  useState(() => {
    const interval = setInterval(() => {
      if (content !== form.getValues('content')) {
        autoSave()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  })

  const onSubmit = async (data: AssessmentFormData) => {
    setIsSubmitting(true)
    
    try {
      const assessmentData = {
        application_id: application.id,
        content: data.content,
        notes: data.notes || '',
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        word_count: data.content.split(/\s+/).length,
      }

      let assessmentId = existingAssessment?.id

      if (existingAssessment) {
        const { error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existingAssessment.id)
          
        if (error) throw error
      } else {
        const { data: newAssessment, error } = await supabase
          .from('assessments')
          .insert(assessmentData)
          .select()
          .single()
          
        if (error) throw error
        assessmentId = newAssessment.id
      }

      // Update application status
      await supabase
        .from('applications')
        .update({ 
          stage: 'assessment_submitted',
          status: 'assessment_submitted'
        })
        .eq('id', application.id)

      // Trigger AI scoring
      await fetch('/api/assessments/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      })

      toast({
        title: 'Assessment Submitted!',
        description: 'Your assessment has been submitted and will be reviewed shortly.',
      })

      router.push(`/candidate/applications/${application.id}`)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit assessment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReadonly = existingAssessment?.status === 'submitted'

  return (
    <div className="space-y-6">
      {/* Assessment Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: jobSettings?.assessment_prompt || 'Complete the writing assessment below.' 
          }} />
        </CardContent>
      </Card>

      {/* Assessment Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Your Response</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {isSaving && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {lastSaved && !isSaving && (
                <>
                  <Clock className="h-4 w-4" />
                  <span>
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Assessment Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                disabled={isReadonly}
                placeholder="Start writing your assessment response here..."
                className="min-h-[400px]"
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                Word count: {content.split(/\s+/).filter((word: string) => word.length > 0).length}
              </div>
              <div>
                Character count: {content.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={autoSave}
            disabled={isSaving || isReadonly}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          
          {!isReadonly && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          )}
        </div>

        {isReadonly && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              This assessment has been submitted and can no longer be edited. 
              You can view your submission above.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}