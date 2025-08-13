import { CacheService } from '@/lib/redis/cache'

// Mock Redis client
const mockRedis = {
  setEx: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  keys: jest.fn(),
  incr: jest.fn(),
  ttl: jest.fn(),
  zRemRangeByScore: jest.fn(),
  zCard: jest.fn(),
  zRange: jest.fn(),
  zAdd: jest.fn(),
}

jest.mock('@/lib/redis/client', () => ({
  getRedisClient: () => mockRedis,
}))

describe('CacheService', () => {
  let cacheService: CacheService

  beforeEach(() => {
    cacheService = new CacheService()
    jest.clearAllMocks()
  })

  describe('set', () => {
    it('should set a value with default TTL', async () => {
      mockRedis.setEx.mockResolvedValue('OK')

      const result = await cacheService.set('test-key', { data: 'test' })

      expect(result).toBe(true)
      expect(mockRedis.setEx).toHaveBeenCalledWith(
        'ats:test-key',
        3600, // default TTL
        JSON.stringify({ data: 'test' })
      )
    })

    it('should set a value with custom TTL', async () => {
      mockRedis.setEx.mockResolvedValue('OK')

      const result = await cacheService.set('test-key', { data: 'test' }, { ttl: 1800 })

      expect(result).toBe(true)
      expect(mockRedis.setEx).toHaveBeenCalledWith(
        'ats:test-key',
        1800,
        JSON.stringify({ data: 'test' })
      )
    })

    it('should handle Redis errors gracefully', async () => {
      mockRedis.setEx.mockRejectedValue(new Error('Redis error'))

      const result = await cacheService.set('test-key', { data: 'test' })

      expect(result).toBe(false)
    })
  })

  describe('get', () => {
    it('should retrieve a cached value', async () => {
      const testData = { data: 'test' }
      mockRedis.get.mockResolvedValue(JSON.stringify(testData))

      const result = await cacheService.get('test-key')

      expect(result).toEqual(testData)
      expect(mockRedis.get).toHaveBeenCalledWith('ats:test-key')
    })

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await cacheService.get('test-key')

      expect(result).toBe(null)
    })

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'))

      const result = await cacheService.get('test-key')

      expect(result).toBe(null)
    })
  })

  describe('del', () => {
    it('should delete a key', async () => {
      mockRedis.del.mockResolvedValue(1)

      const result = await cacheService.del('test-key')

      expect(result).toBe(true)
      expect(mockRedis.del).toHaveBeenCalledWith('ats:test-key')
    })

    it('should return false when key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0)

      const result = await cacheService.del('test-key')

      expect(result).toBe(false)
    })
  })

  describe('specialized caching methods', () => {
    it('should cache job listings', async () => {
      mockRedis.setEx.mockResolvedValue('OK')
      const filters = { location: 'remote', type: 'full_time' }
      const jobData = [{ id: 1, title: 'Developer' }]

      const result = await cacheService.cacheJobListings(filters, jobData, 600)

      expect(result).toBe(true)
      expect(mockRedis.setEx).toHaveBeenCalledWith(
        expect.stringContaining('ats:jobs:'),
        600,
        JSON.stringify(jobData)
      )
    })

    it('should retrieve cached job listings', async () => {
      const jobData = [{ id: 1, title: 'Developer' }]
      mockRedis.get.mockResolvedValue(JSON.stringify(jobData))
      const filters = { location: 'remote', type: 'full_time' }

      const result = await cacheService.getCachedJobListings(filters)

      expect(result).toEqual(jobData)
    })

    it('should cache AI scores', async () => {
      mockRedis.setEx.mockResolvedValue('OK')
      const assessmentId = 'assessment-123'
      const scores = { composite_score: 85, readability: 90 }

      const result = await cacheService.cacheAIScores(assessmentId, scores, 86400)

      expect(result).toBe(true)
      expect(mockRedis.setEx).toHaveBeenCalledWith(
        `ats:ai_scores:${assessmentId}`,
        86400,
        JSON.stringify(scores)
      )
    })
  })

  describe('rate limiting', () => {
    it('should increment rate limit counter', async () => {
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(3600)

      const result = await cacheService.incrementRateLimit('user-123', 3600, 100)

      expect(result.count).toBe(1)
      expect(result.remaining).toBe(99)
      expect(mockRedis.incr).toHaveBeenCalledWith('ats:rate_limit:user-123')
    })

    it('should set expiration on first increment', async () => {
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(3600)

      await cacheService.incrementRateLimit('user-123', 3600, 100)

      expect(mockRedis.expire).toHaveBeenCalledWith('ats:rate_limit:user-123', 3600)
    })

    it('should check rate limit', async () => {
      mockRedis.get.mockResolvedValue('5')

      const result = await cacheService.checkRateLimit('user-123')

      expect(result).toBe(5)
      expect(mockRedis.get).toHaveBeenCalledWith('ats:rate_limit:user-123')
    })

    it('should return 0 for non-existent rate limit', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await cacheService.checkRateLimit('user-123')

      expect(result).toBe(0)
    })
  })
})