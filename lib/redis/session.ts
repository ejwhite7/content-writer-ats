import { getRedisClient } from './client'

export interface SessionData {
  userId: string
  tenantId: string
  role: string
  email: string
  lastActivity: string
  metadata?: Record<string, any>
}

export interface RateLimitResult {
  allowed: boolean
  count: number
  remaining: number
  resetTime: number
}

export class SessionManager {
  private redis = getRedisClient()
  private sessionPrefix = 'session:'
  private sessionTTL = 7200 // 2 hours

  private getSessionKey(sessionId: string): string {
    return `${this.sessionPrefix}${sessionId}`
  }

  async createSession(
    sessionId: string,
    data: SessionData,
    ttl: number = this.sessionTTL
  ): Promise<boolean> {
    try {
      const key = this.getSessionKey(sessionId)
      const sessionData = {
        ...data,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
      
      const result = await this.redis.setEx(key, ttl, JSON.stringify(sessionData))
      return result === 'OK'
    } catch (error) {
      console.error('Session creation error:', error)
      return false
    }
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const key = this.getSessionKey(sessionId)
      const data = await this.redis.get(key)
      
      if (!data) return null
      
      const sessionData = JSON.parse(data) as SessionData
      
      // Update last activity
      await this.updateLastActivity(sessionId)
      
      return sessionData
    } catch (error) {
      console.error('Session retrieval error:', error)
      return null
    }
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>
  ): Promise<boolean> {
    try {
      const existingSession = await this.getSession(sessionId)
      if (!existingSession) return false
      
      const updatedSession = {
        ...existingSession,
        ...updates,
        lastActivity: new Date().toISOString()
      }
      
      const key = this.getSessionKey(sessionId)
      const ttl = await this.redis.ttl(key)
      
      if (ttl > 0) {
        const result = await this.redis.setEx(key, ttl, JSON.stringify(updatedSession))
        return result === 'OK'
      }
      
      return false
    } catch (error) {
      console.error('Session update error:', error)
      return false
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(sessionId)
      const result = await this.redis.del(key)
      return result > 0
    } catch (error) {
      console.error('Session deletion error:', error)
      return false
    }
  }

  async extendSession(
    sessionId: string,
    ttl: number = this.sessionTTL
  ): Promise<boolean> {
    try {
      const key = this.getSessionKey(sessionId)
      const result = await this.redis.expire(key, ttl)
      return result === true
    } catch (error) {
      console.error('Session extension error:', error)
      return false
    }
  }

  async updateLastActivity(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false
      
      session.lastActivity = new Date().toISOString()
      
      const key = this.getSessionKey(sessionId)
      const ttl = await this.redis.ttl(key)
      
      if (ttl > 0) {
        const result = await this.redis.setEx(key, ttl, JSON.stringify(session))
        return result === 'OK'
      }
      
      return false
    } catch (error) {
      console.error('Last activity update error:', error)
      return false
    }
  }

  async getActiveSessions(userId: string): Promise<string[]> {
    try {
      const pattern = `${this.sessionPrefix}*`
      const keys = await this.redis.keys(pattern)
      const activeSessions: string[] = []
      
      for (const key of keys) {
        const data = await this.redis.get(key)
        if (data) {
          const session = JSON.parse(data) as SessionData
          if (session.userId === userId) {
            activeSessions.push(key.replace(this.sessionPrefix, ''))
          }
        }
      }
      
      return activeSessions
    } catch (error) {
      console.error('Get active sessions error:', error)
      return []
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<boolean> {
    try {
      const activeSessions = await this.getActiveSessions(userId)
      
      if (activeSessions.length === 0) return true
      
      const keys = activeSessions.map(sessionId => this.getSessionKey(sessionId))
      const result = await this.redis.del(keys)
      
      return result > 0
    } catch (error) {
      console.error('Invalidate all user sessions error:', error)
      return false
    }
  }

  // Rate limiting functionality
  async checkRateLimit(
    identifier: string,
    windowMs: number = 60000, // 1 minute
    maxAttempts: number = 10
  ): Promise<RateLimitResult> {
    try {
      const key = `rate_limit:${identifier}`
      const now = Date.now()
      const windowStart = now - windowMs
      
      // Remove expired entries
      await this.redis.zRemRangeByScore(key, '-inf', windowStart)
      
      // Count current attempts in window
      const count = await this.redis.zCard(key)
      
      if (count >= maxAttempts) {
        const oldestEntry = await this.redis.zRangeWithScores(key, 0, 0)
        const resetTime = oldestEntry.length > 0 ? 
          parseInt(oldestEntry[0].score.toString()) + windowMs : 
          now + windowMs
        
        return {
          allowed: false,
          count,
          remaining: 0,
          resetTime
        }
      }
      
      // Add current attempt
      await this.redis.zAdd(key, { score: now, value: `${now}-${Math.random()}` })
      await this.redis.expire(key, Math.ceil(windowMs / 1000))
      
      return {
        allowed: true,
        count: count + 1,
        remaining: maxAttempts - count - 1,
        resetTime: now + windowMs
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow the request if Redis is unavailable
      return {
        allowed: true,
        count: 0,
        remaining: maxAttempts,
        resetTime: Date.now() + windowMs
      }
    }
  }

  async clearRateLimit(identifier: string): Promise<boolean> {
    try {
      const key = `rate_limit:${identifier}`
      const result = await this.redis.del(key)
      return result > 0
    } catch (error) {
      console.error('Clear rate limit error:', error)
      return false
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()