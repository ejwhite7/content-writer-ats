/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/jobs/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}))

const { createClient } = require('@/lib/supabase/server')
const { getCurrentUser } = require('@/lib/auth')

describe('/api/jobs', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    }
    createClient.mockReturnValue(mockSupabase)
    jest.clearAllMocks()
  })

  describe('GET /api/jobs', () => {
    it('should fetch jobs successfully', async () => {
      const mockJobs = [
        {
          id: 1,
          title: 'Content Writer',
          description: 'Write great content',
          status: 'published',
          tenants: { name: 'Test Company' },
        },
      ]

      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: mockJobs,
        error: null,
        count: 1,
      })

      const request = new NextRequest('http://localhost:3000/api/jobs')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.jobs).toEqual(mockJobs)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      })
    })

    it('should handle search parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/jobs?search=developer')
      
      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const response = await GET(request)

      expect(mockSupabase.from().select().eq().or).toHaveBeenCalledWith(
        'title.ilike.%developer%,description.ilike.%developer%'
      )
    })

    it('should handle pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/jobs?page=2&limit=5')
      
      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const response = await GET(request)

      expect(mockSupabase.from().select().eq().order().range).toHaveBeenCalledWith(5, 9) // page 2, limit 5
    })

    it('should handle database errors', async () => {
      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      })

      const request = new NextRequest('http://localhost:3000/api/jobs')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/jobs', () => {
    it('should create job successfully for admin user', async () => {
      const mockUser = {
        clerk_id: 'user_123',
        tenant_id: 'tenant_123',
        role: 'admin',
      }

      const mockJob = {
        id: 1,
        title: 'New Job',
        description: 'Job description',
      }

      getCurrentUser.mockResolvedValue(mockUser)
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockJob,
        error: null,
      })

      const jobData = {
        title: 'New Job',
        description: 'Job description',
        job_type: 'full_time',
      }

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.job).toEqual(mockJob)
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...jobData,
        tenant_id: mockUser.tenant_id,
        created_by: mockUser.clerk_id,
      })
    })

    it('should reject unauthorized users', async () => {
      getCurrentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Job' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should reject non-admin users', async () => {
      const mockUser = {
        clerk_id: 'user_123',
        tenant_id: 'tenant_123',
        role: 'candidate',
      }

      getCurrentUser.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Job' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should handle database errors', async () => {
      const mockUser = {
        clerk_id: 'user_123',
        tenant_id: 'tenant_123',
        role: 'admin',
      }

      getCurrentUser.mockResolvedValue(mockUser)
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Job' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})