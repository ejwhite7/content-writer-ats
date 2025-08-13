// Test database utilities for mocking database operations

export const mockJobData = {
  id: 'job-123',
  title: 'Senior Content Writer',
  description: 'We are looking for a talented content writer...',
  job_type: 'full_time' as const,
  location: 'Remote',
  salary_min: 60000,
  salary_max: 80000,
  remote_allowed: true,
  status: 'published' as const,
  requirements: ['3+ years experience', 'Strong writing skills'],
  posted_at: '2024-01-15',
  tenant_id: 'tenant-123',
  created_by: 'user-123',
  tenants: {
    name: 'Test Company',
    branding_settings: {
      primary_color: '#3b82f6',
      logo_url: 'https://example.com/logo.png'
    }
  }
}

export const mockApplicationData = {
  id: 'app-123',
  job_id: 'job-123',
  candidate_id: 'candidate-123',
  tenant_id: 'tenant-123',
  status: 'applied' as const,
  stage: 'applied' as const,
  cover_letter: 'I am excited to apply for this position...',
  resume_file_id: 'file-123',
  portfolio_url: 'https://portfolio.example.com',
  desired_compensation_amount: 75000,
  desired_compensation_frequency: 'monthly' as const,
  desired_compensation_currency: 'USD',
  availability_date: new Date('2024-02-01'),
  location_city: 'San Francisco',
  location_country: 'United States',
  time_zone: 'America/Los_Angeles',
  years_experience: 3,
  languages: [
    { language: 'English', proficiency: 'native' as const }
  ],
  specialties: ['Content Writing', 'SEO', 'Copywriting'],
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15')
}

export const mockAssessmentData = {
  id: 'assessment-123',
  application_id: 'app-123',
  tenant_id: 'tenant-123',
  content: 'This is a sample assessment content...',
  status: 'submitted' as const,
  ai_scores: {
    readability_score: 85,
    writing_quality_score: 90,
    seo_score: 75,
    english_proficiency_score: 95,
    ai_detection_score: 80,
    composite_score: 85,
    detailed_feedback: {
      readability: { score: 85, feedback: ['Good readability'] },
      writing_quality: { score: 90, feedback: ['Excellent writing'] },
      seo: { score: 75, feedback: ['Good SEO practices'] },
      english_proficiency: { score: 95, feedback: ['Native-level English'] },
      ai_detection: { score: 80, feedback: ['Likely human-written'] }
    }
  },
  ai_total_score: 85,
  submitted_at: new Date('2024-01-16'),
  scored_at: new Date('2024-01-16')
}

export const mockUserData = {
  id: 'user-123',
  tenant_id: 'tenant-123',
  clerk_id: 'clerk_user_123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'candidate' as const,
  phone: '555-0123',
  timezone: 'America/Los_Angeles',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-15')
}

export const mockTenantData = {
  id: 'tenant-123',
  name: 'Test Company',
  slug: 'test-company',
  domain: 'testcompany.com',
  branding_settings: {
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    logo_url: 'https://example.com/logo.png',
    font_family: 'Inter'
  },
  email_settings: {
    from_email: 'noreply@testcompany.com',
    from_name: 'Test Company'
  },
  created_at: new Date('2024-01-01')
}

// Mock database responses
export const createMockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
  count: Array.isArray(data) ? data.length : 1,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

// Helper function to create mock database query chain
export const createMockQuery = (finalResult: any) => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(finalResult),
    maybeSingle: jest.fn().mockResolvedValue(finalResult),
  }

  // Make the query itself resolve to the final result when awaited
  Object.assign(mockQuery, Promise.resolve(finalResult))
  
  return mockQuery
}