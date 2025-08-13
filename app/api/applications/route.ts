import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  location: z.object({
    city: z.string().min(1),
    country: z.string().min(1),
  }),
  timeZone: z.string().min(1),
  resumeFile: z.any().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().min(50),
  desiredCompensation: z.object({
    amount: z.number().min(1),
    frequency: z.enum(['per_word', 'per_article', 'per_hour', 'per_project', 'monthly']),
    currency: z.string().default('USD'),
  }),
  availabilityDate: z.string().transform((str) => new Date(str)),
  yearsExperience: z.number().min(0),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']),
  })),
  specialties: z.array(z.string()),
  customQuestions: z.record(z.string(), z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = applicationSchema.parse(body)

    const supabase = createClient()

    // Get or create user in our database
    let { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('id, tenant_id')
      .eq('clerk_id', user.id)
      .single()

    if (userFetchError && userFetchError.code !== 'PGRST116') {
      throw userFetchError
    }

    // Get job details to determine tenant_id
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, tenant_id, title')
      .eq('id', validatedData.jobId)
      .eq('status', 'published')
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found or not available' },
        { status: 404 }
      )
    }

    // Create user if doesn't exist
    if (!existingUser) {
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          tenant_id: job.tenant_id,
          clerk_id: user.id,
          email: validatedData.email,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          profile_image_url: user.imageUrl,
          role: 'candidate',
          phone: validatedData.phone,
          timezone: validatedData.timeZone,
        })
        .select('id, tenant_id')
        .single()

      if (createUserError) {
        throw createUserError
      }
      existingUser = newUser
    } else {
      // Update user info
      await supabase
        .from('users')
        .update({
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          phone: validatedData.phone,
          timezone: validatedData.timeZone,
        })
        .eq('id', existingUser.id)
    }

    // Check if application already exists
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', validatedData.jobId)
      .eq('candidate_id', existingUser.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 409 }
      )
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        tenant_id: job.tenant_id,
        job_id: validatedData.jobId,
        candidate_id: existingUser.id,
        status: 'applied',
        cover_letter: validatedData.coverLetter,
        resume_file_id: validatedData.resumeFile?.id,
        portfolio_url: validatedData.portfolioUrl || null,
        desired_compensation_amount: validatedData.desiredCompensation.amount,
        desired_compensation_frequency: validatedData.desiredCompensation.frequency,
        desired_compensation_currency: validatedData.desiredCompensation.currency,
        availability_date: validatedData.availabilityDate,
        location_city: validatedData.location.city,
        location_country: validatedData.location.country,
        time_zone: validatedData.timeZone,
        years_experience: validatedData.yearsExperience,
        languages: validatedData.languages,
        specialties: validatedData.specialties,
        metadata: {
          custom_questions: validatedData.customQuestions || {},
          application_source: 'web_form',
          submitted_at: new Date().toISOString(),
        },
      })
      .select('id')
      .single()

    if (applicationError) {
      throw applicationError
    }

    // TODO: Send confirmation email
    // TODO: Trigger webhooks
    // TODO: Create system message

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('Application submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid application data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Get user's applications
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!existingUser) {
      return NextResponse.json({ applications: [] })
    }

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs (
          id,
          title,
          tenant:tenants (
            name
          )
        )
      `)
      .eq('candidate_id', existingUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Fetch applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}