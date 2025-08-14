import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIScorer, type AIScores } from '@/lib/ai-scoring/ai-scorer'
import { EmailTriggers } from '@/lib/email/email-triggers'

// Interface for request body
interface ScoreAssessmentRequest {
  assessmentId: string
}

// Interface for assessment with joined data
interface AssessmentWithRelations {
  id: string
  content: string
  tenant_id: string
  application_id: string
  applications: {
    id: string
    stage: string
    jobs: {
      id: string
      title: string
      job_settings?: {
        shortlist_threshold?: number
        [key: string]: any
      } | null
    }
  }
}

// Interface for response
interface ScoreAssessmentResponse {
  success: boolean
  scores: AIScores
  stage: string
}

// Interface for audit log entry
interface AuditLogEntry {
  table_name: string
  record_id: string
  action: string
  changes: {
    ai_scores: AIScores
    stage_updated: string
  }
  performed_by: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ScoreAssessmentResponse | { error: string }>> {
  try {
    const { assessmentId }: ScoreAssessmentRequest = await request.json()

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        *,
        applications (
          *,
          jobs (
            *,
            job_settings (*)
          )
        )
      `)
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    const typedAssessment = assessment as AssessmentWithRelations

    // Initialize AI scorer
    const aiScorer = new AIScorer()

    // Run AI scoring
    const scores = await aiScorer.scoreAssessment(
      typedAssessment.content,
      typedAssessment.applications.jobs.job_settings
    )

    // Update assessment with scores
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        ai_scores: scores,
        ai_total_score: scores.composite_score,
        status: 'ai_scored',
        scored_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    if (updateError) {
      throw updateError
    }

    // Update application stage based on score
    const threshold = typedAssessment.applications.jobs.job_settings?.shortlist_threshold || 75
    const newStage = scores.composite_score >= threshold ? 'shortlisted' : 'ai_reviewed'
    
    await supabase
      .from('applications')
      .update({ 
        stage: newStage,
        status: newStage === 'shortlisted' ? 'shortlisted' : 'reviewed'
      })
      .eq('id', typedAssessment.applications.id)

    // Log scoring event
    const auditLogEntry: AuditLogEntry = {
      table_name: 'assessments',
      record_id: assessmentId,
      action: 'ai_scored',
      changes: {
        ai_scores: scores,
        stage_updated: newStage
      },
      performed_by: 'system'
    }

    await supabase
      .from('audit_logs')
      .insert(auditLogEntry)

    // Trigger email notifications
    const emailTriggers = new EmailTriggers()
    await emailTriggers.onAssessmentScored(assessmentId)

    return NextResponse.json({
      success: true,
      scores,
      stage: newStage
    })

  } catch (error) {
    console.error('Error scoring assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}