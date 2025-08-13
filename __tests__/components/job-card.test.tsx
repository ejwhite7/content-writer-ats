import { render, screen } from '@testing-library/react'
import { JobCard } from '@/components/jobs/job-card'

// Mock the job data
const mockJob = {
  id: 'job-1',
  title: 'Senior Content Writer',
  company: 'Tech Company Inc.',
  location: 'Remote',
  job_type: 'full_time' as const,
  salary_min: 60000,
  salary_max: 80000,
  description: 'We are looking for a senior content writer...',
  requirements: ['3+ years experience', 'Strong writing skills'],
  posted_at: '2024-01-15',
  remote_allowed: true,
  tenants: {
    name: 'Tech Company Inc.',
    branding_settings: {
      primary_color: '#3b82f6',
      logo_url: 'https://example.com/logo.png'
    }
  }
}

describe('JobCard Component', () => {
  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText('Senior Content Writer')).toBeInTheDocument()
    expect(screen.getByText('Tech Company Inc.')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Full Time')).toBeInTheDocument()
  })

  it('displays salary range when provided', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText(/\$60,000 - \$80,000/)).toBeInTheDocument()
  })

  it('shows remote badge when remote_allowed is true', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText('Remote')).toBeInTheDocument()
  })

  it('displays truncated description', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText(/We are looking for a senior content writer/)).toBeInTheDocument()
  })

  it('renders apply button', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
  })

  it('handles job without salary information', () => {
    const jobWithoutSalary = { ...mockJob, salary_min: null, salary_max: null }
    render(<JobCard job={jobWithoutSalary} />)
    
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })
})