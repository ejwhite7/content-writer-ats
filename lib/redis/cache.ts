import { getRedisClient } from './client'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  namespace?: string
}

export class CacheService {
  private redis = getRedisClient()
  private defaultTTL = 3600 // 1 hour
  private namespace = 'ats:'

  private getKey(key: string, namespace?: string): string {
    const prefix = namespace || this.namespace
    return `${prefix}${key}`
  }

  // Generic cache methods
  async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const redisKey = this.getKey(key, options.namespace)
      const ttl = options.ttl || this.defaultTTL
      const serializedValue = JSON.stringify(value)
      
      const result = await this.redis.setEx(redisKey, ttl, serializedValue)
      return result === 'OK'
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async get<T>(key: string, namespace?: string): Promise<T | null> {
    try {
      const redisKey = this.getKey(key, namespace)
      const value = await this.redis.get(redisKey)
      
      if (!value) return null
      
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async del(key: string, namespace?: string): Promise<boolean> {
    try {
      const redisKey = this.getKey(key, namespace)
      const result = await this.redis.del(redisKey)
      return result > 0
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      const redisKey = this.getKey(key, namespace)
      const result = await this.redis.exists(redisKey)
      return result > 0
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  async expire(key: string, ttl: number, namespace?: string): Promise<boolean> {
    try {
      const redisKey = this.getKey(key, namespace)
      const result = await this.redis.expire(redisKey, ttl)
      return result === true
    } catch (error) {
      console.error('Cache expire error:', error)
      return false
    }
  }

  // Pattern-based operations
  async keys(pattern: string, namespace?: string): Promise<string[]> {
    try {
      const searchPattern = this.getKey(pattern, namespace)
      return await this.redis.keys(searchPattern)
    } catch (error) {
      console.error('Cache keys error:', error)
      return []
    }
  }

  async flushNamespace(namespace?: string): Promise<boolean> {
    try {
      const pattern = this.getKey('*', namespace)
      const keys = await this.redis.keys(pattern)
      
      if (keys.length === 0) return true
      
      const result = await this.redis.del(keys)
      return result > 0
    } catch (error) {
      console.error('Cache flush namespace error:', error)
      return false
    }
  }

  // Specialized caching methods for ATS
  async cacheJobListings(
    filters: Record<string, any>,
    data: any[],
    ttl = 300 // 5 minutes for job listings
  ): Promise<boolean> {
    const key = `jobs:${Buffer.from(JSON.stringify(filters)).toString('base64')}`
    return await this.set(key, data, { ttl })
  }

  async getCachedJobListings(filters: Record<string, any>): Promise<any[] | null> {
    const key = `jobs:${Buffer.from(JSON.stringify(filters)).toString('base64')}`
    return await this.get(key)
  }

  async cacheApplicationData(
    applicationId: string,
    data: any,
    ttl = 1800 // 30 minutes
  ): Promise<boolean> {
    const key = `application:${applicationId}`
    return await this.set(key, data, { ttl })
  }

  async getCachedApplicationData(applicationId: string): Promise<any | null> {
    const key = `application:${applicationId}`
    return await this.get(key)
  }

  async cacheAIScores(
    assessmentId: string,
    scores: any,
    ttl = 86400 // 24 hours - AI scores rarely change
  ): Promise<boolean> {
    const key = `ai_scores:${assessmentId}`
    return await this.set(key, scores, { ttl })
  }

  async getCachedAIScores(assessmentId: string): Promise<any | null> {
    const key = `ai_scores:${assessmentId}`
    return await this.get(key)
  }

  async cacheUserSession(
    userId: string,
    sessionData: any,
    ttl = 7200 // 2 hours
  ): Promise<boolean> {
    const key = `session:${userId}`
    return await this.set(key, sessionData, { ttl })
  }

  async getCachedUserSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`
    return await this.get(key)
  }

  async invalidateUserSession(userId: string): Promise<boolean> {
    const key = `session:${userId}`
    return await this.del(key)
  }

  // Rate limiting
  async incrementRateLimit(
    key: string,
    window: number = 3600, // 1 hour window
    limit: number = 100
  ): Promise<{ count: number; remaining: number; resetTime: number }> {
    try {
      const redisKey = this.getKey(`rate_limit:${key}`)
      const current = await this.redis.incr(redisKey)
      
      if (current === 1) {
        await this.redis.expire(redisKey, window)
      }
      
      const ttl = await this.redis.ttl(redisKey)
      const resetTime = Date.now() + (ttl * 1000)
      
      return {
        count: current,
        remaining: Math.max(0, limit - current),
        resetTime
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      throw error
    }
  }

  async checkRateLimit(key: string): Promise<number> {
    try {
      const redisKey = this.getKey(`rate_limit:${key}`)
      const count = await this.redis.get(redisKey)
      return count ? parseInt(count) : 0
    } catch (error) {
      console.error('Rate limit check error:', error)
      return 0
    }
  }
}

// Export singleton instance
export const cache = new CacheService()