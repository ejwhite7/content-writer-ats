import { render, screen } from '@testing-library/react'
import { JobCard } from '@/components/jobs/job-card'
import type { JobCardJob } from '@/components/jobs/job-card'

// Mock the job data with proper typing
const mockJob: JobCardJob = {
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
    const jobWithoutSalary: JobCardJob = { 
      ...mockJob, 
      salary_min: null, 
      salary_max: null 
    }
    render(<JobCard job={jobWithoutSalary} />)
    
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('handles job without company information', () => {
    const jobWithoutCompany: JobCardJob = { 
      ...mockJob, 
      company: undefined 
    }
    render(<JobCard job={jobWithoutCompany} />)
    
    // Should fall back to tenant name
    expect(screen.getByText('Tech Company Inc.')).toBeInTheDocument()
  })

  it('handles job without tenant information', () => {
    const jobWithoutTenant: JobCardJob = { 
      ...mockJob, 
      company: undefined,
      tenants: undefined 
    }
    render(<JobCard job={jobWithoutTenant} />)
    
    // Should fall back to 'Company'
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('handles job with only minimum salary', () => {
    const jobWithMinSalary: JobCardJob = { 
      ...mockJob, 
      salary_max: null 
    }
    render(<JobCard job={jobWithMinSalary} />)
    
    expect(screen.getByText(/From \$60,000/)).toBeInTheDocument()
  })

  it('displays requirements badges', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText('3+ years experience')).toBeInTheDocument()
    expect(screen.getByText('Strong writing skills')).toBeInTheDocument()
  })

  it('handles job without requirements', () => {
    const jobWithoutRequirements: JobCardJob = { 
      ...mockJob, 
      requirements: undefined 
    }
    render(<JobCard job={jobWithoutRequirements} />)
    
    // Should not crash and should still render other elements
    expect(screen.getByText('Senior Content Writer')).toBeInTheDocument()
  })

  it('handles remote job without specific location', () => {
    const remoteJobWithoutLocation: JobCardJob = { 
      ...mockJob, 
      location: undefined,
      remote_allowed: true 
    }
    render(<JobCard job={remoteJobWithoutLocation} />)
    
    expect(screen.getByText('Remote')).toBeInTheDocument()
  })

  it('handles non-remote job with location', () => {
    const onSiteJob: JobCardJob = { 
      ...mockJob, 
      location: 'New York, NY',
      remote_allowed: false 
    }
    render(<JobCard job={onSiteJob} />)
    
    expect(screen.getByText('New York, NY')).toBeInTheDocument()
  })
})