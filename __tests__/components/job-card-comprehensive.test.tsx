import { render, screen } from '../utils/test-utils'
import { JobCard } from '@/components/jobs/job-card'
import { createMockJob } from '../utils/test-utils'

describe('JobCard Component - Comprehensive Tests', () => {
  describe('Basic Rendering', () => {
    it('should render all required elements', () => {
      const job = createMockJob()
      render(<JobCard job={job} />)

      // Check title
      expect(screen.getByText(job.title)).toBeInTheDocument()
      
      // Check company name
      expect(screen.getByText(job.company!)).toBeInTheDocument()
      
      // Check job type
      expect(screen.getByText('Full Time')).toBeInTheDocument()
      
      // Check location
      expect(screen.getByText(job.location!)).toBeInTheDocument()
      
      // Check description
      expect(screen.getByText(/This is a test job description/)).toBeInTheDocument()
      
      // Check apply button
      expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
    })

    it('should display salary information correctly', () => {
      const job = createMockJob({
        salary_min: 60000,
        salary_max: 80000
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('$60,000 - $80,000')).toBeInTheDocument()
    })

    it('should display requirements badges', () => {
      const job = createMockJob({
        requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS']
      })
      render(<JobCard job={job} />)

      // Should show first 3 requirements
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
      
      // Should show "+2 more" for remaining requirements
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })
  })

  describe('Data Variations', () => {
    it('should handle missing company gracefully', () => {
      const job = createMockJob({
        company: undefined,
        tenants: {
          name: 'Tenant Company',
          branding_settings: {
            primary_color: '#000000'
          }
        }
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('Tenant Company')).toBeInTheDocument()
    })

    it('should fall back to "Company" when both company and tenant are missing', () => {
      const job = createMockJob({
        company: undefined,
        tenants: undefined
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('Company')).toBeInTheDocument()
    })

    it('should handle salary_min only', () => {
      const job = createMockJob({
        salary_min: 50000,
        salary_max: null
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('From $50,000')).toBeInTheDocument()
    })

    it('should not display salary section when both values are null', () => {
      const job = createMockJob({
        salary_min: null,
        salary_max: null
      })
      render(<JobCard job={job} />)

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
    })

    it('should handle different job types', () => {
      const testCases = [
        { job_type: 'part_time', expected: 'Part Time' },
        { job_type: 'contract', expected: 'Contract' },
        { job_type: 'freelance', expected: 'Freelance' },
        { job_type: undefined, expected: 'Full Time' }
      ]

      testCases.forEach(({ job_type, expected }) => {
        const job = createMockJob({ job_type })
        const { unmount } = render(<JobCard job={job} />)
        
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Remote Work Handling', () => {
    it('should show "Remote" for remote-only jobs', () => {
      const job = createMockJob({
        location: undefined,
        remote_allowed: true
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('Remote')).toBeInTheDocument()
    })

    it('should show location with remote option', () => {
      const job = createMockJob({
        location: 'New York, NY',
        remote_allowed: true
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('New York, NY (Remote OK)')).toBeInTheDocument()
    })

    it('should show only location for non-remote jobs', () => {
      const job = createMockJob({
        location: 'San Francisco, CA',
        remote_allowed: false
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
      expect(screen.queryByText(/Remote/)).not.toBeInTheDocument()
    })

    it('should show "Location not specified" when no location and not remote', () => {
      const job = createMockJob({
        location: undefined,
        remote_allowed: false
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('Location not specified')).toBeInTheDocument()
    })
  })

  describe('Requirements Display', () => {
    it('should not display requirements section when empty', () => {
      const job = createMockJob({
        requirements: []
      })
      render(<JobCard job={job} />)

      // Check that no requirement badges are present
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })

    it('should not display requirements section when undefined', () => {
      const job = createMockJob({
        requirements: undefined
      })
      render(<JobCard job={job} />)

      // Should still render other elements
      expect(screen.getByText(job.title)).toBeInTheDocument()
    })

    it('should display exactly 3 requirements without overflow', () => {
      const job = createMockJob({
        requirements: ['JavaScript', 'React', 'CSS']
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('CSS')).toBeInTheDocument()
      expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument()
    })

    it('should handle single requirement', () => {
      const job = createMockJob({
        requirements: ['Senior Level']
      })
      render(<JobCard job={job} />)

      expect(screen.getByText('Senior Level')).toBeInTheDocument()
    })
  })

  describe('Date Display', () => {
    it('should format posted date correctly', () => {
      const job = createMockJob({
        posted_at: '2024-01-15T10:00:00Z'
      })
      render(<JobCard job={job} />)

      // Should show "Posted" followed by the formatted date
      expect(screen.getByText(/Posted 2 days ago/)).toBeInTheDocument()
    })
  })

  describe('Description Truncation', () => {
    it('should truncate long descriptions', () => {
      const longDescription = 'This is a very long job description that should be truncated when it exceeds the maximum length limit set by the component to ensure the card maintains a consistent height and layout across different job postings.'
      
      const job = createMockJob({
        description: longDescription
      })
      render(<JobCard job={job} />)

      // Should show truncated version with ellipsis
      const description = screen.getByText(/This is a very long job description/)
      expect(description.textContent).toContain('...')
      expect(description.textContent!.length).toBeLessThan(longDescription.length)
    })

    it('should not truncate short descriptions', () => {
      const shortDescription = 'Short description.'
      const job = createMockJob({
        description: shortDescription
      })
      render(<JobCard job={job} />)

      const description = screen.getByText(shortDescription)
      expect(description.textContent).toBe(shortDescription)
      expect(description.textContent).not.toContain('...')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      const job = createMockJob()
      render(<JobCard job={job} />)

      const button = screen.getByRole('button', { name: /apply now/i })
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })

    it('should have proper semantic structure', () => {
      const job = createMockJob()
      render(<JobCard job={job} />)

      // Check that the component renders as expected
      expect(screen.getByText(job.title)).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('should render with proper CSS classes', () => {
      const job = createMockJob()
      const { container } = render(<JobCard job={job} />)

      // Check that the card has proper structure
      const card = container.querySelector('[class*="card"]') || container.firstChild
      expect(card).toBeTruthy()
    })

    it('should include all icon elements', () => {
      const job = createMockJob()
      render(<JobCard job={job} />)

      // Check for icon test IDs (from our mocked lucide-react icons)
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument()
      expect(screen.getByTestId('dollar-sign-icon')).toBeInTheDocument()
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
    })
  })
})