import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import type { JobCardJob } from '@/components/jobs/job-card'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data factories
export const createMockJob = (overrides: Partial<JobCardJob> = {}): JobCardJob => ({
  id: 'test-job-1',
  title: 'Test Job Title',
  company: 'Test Company',
  location: 'Test Location',
  job_type: 'full_time',
  salary_min: 50000,
  salary_max: 70000,
  description: 'This is a test job description.',
  requirements: ['Test requirement 1', 'Test requirement 2'],
  posted_at: '2024-01-15T10:00:00Z',
  remote_allowed: false,
  tenants: {
    name: 'Test Company',
    branding_settings: {
      primary_color: '#3b82f6',
      logo_url: 'https://example.com/logo.png'
    }
  },
  ...overrides
})

// Re-export testing utilities
export * from '@testing-library/react'
export { customRender as render }