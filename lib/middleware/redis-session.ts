import { NextRequest, NextResponse } from 'next/server'
import { sessionManager } from '@/lib/redis/session'

export interface SessionMiddlewareOptions {
  requireAuth?: boolean
  allowedRoles?: string[]
  rateLimitKey?: string
  rateLimitWindow?: number
  rateLimitMax?: number
}

export async function withRedisSession(
  request: NextRequest,
  options: SessionMiddlewareOptions = {}
) {
  const {
    requireAuth = false,
    allowedRoles = [],
    rateLimitKey,
    rateLimitWindow = 60000, // 1 minute
    rateLimitMax = 100
  } = options

  try {
    // Extract session ID from cookies or headers
    const sessionId = request.cookies.get('session-id')?.value ||
                     request.headers.get('x-session-id')

    // Rate limiting if specified
    if (rateLimitKey) {
      const clientId = rateLimitKey === 'ip' ? 
        request.ip || request.headers.get('x-forwarded-for') || 'unknown' :
        rateLimitKey

      const rateLimit = await sessionManager.checkRateLimit(
        clientId,
        rateLimitWindow,
        rateLimitMax
      )

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            resetTime: rateLimit.resetTime
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimitMax.toString(),
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'X-RateLimit-Reset': rateLimit.resetTime.toString()
            }
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', rateLimitMax.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())
    }

    // Session validation
    if (sessionId) {
      const session = await sessionManager.getSession(sessionId)
      
      if (session) {
        // Add session data to request headers for downstream use
        const response = NextResponse.next()
        response.headers.set('x-user-id', session.userId)
        response.headers.set('x-tenant-id', session.tenantId)
        response.headers.set('x-user-role', session.role)
        response.headers.set('x-user-email', session.email)
        
        // Check role permissions
        if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
        
        return response
      }
    }

    // Handle missing or invalid session
    if (requireAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Redis session middleware error:', error)
    
    // Fail gracefully - don't block requests if Redis is down
    if (requireAuth) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      )
    }
    
    return NextResponse.next()
  }
}

// Helper function to extract session data from request headers
export function getSessionFromRequest(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id'),
    tenantId: request.headers.get('x-tenant-id'),
    role: request.headers.get('x-user-role'),
    email: request.headers.get('x-user-email')
  }
}