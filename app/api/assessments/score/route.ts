import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIScorer } from '@/lib/ai-scoring/ai-scorer'\nimport { EmailTriggers } from '@/lib/email/email-triggers'

export async function POST(request: NextRequest) {
  try {
    const { assessmentId } = await request.json()

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

    // Initialize AI scorer
    const aiScorer = new AIScorer()

    // Run AI scoring
    const scores = await aiScorer.scoreAssessment(
      assessment.content,
      assessment.applications.jobs.job_settings
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
    const threshold = assessment.applications.jobs.job_settings?.shortlist_threshold || 75
    const newStage = scores.composite_score >= threshold ? 'shortlisted' : 'ai_reviewed'
    
    await supabase
      .from('applications')
      .update({ 
        stage: newStage,
        status: newStage === 'shortlisted' ? 'shortlisted' : 'reviewed'
      })
      .eq('id', assessment.applications.id)

    // Log scoring event
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'assessments',
        record_id: assessmentId,
        action: 'ai_scored',
        changes: {
          ai_scores: scores,
          stage_updated: newStage
        },
        performed_by: 'system'
      })

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