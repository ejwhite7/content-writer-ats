import { NextRequest, NextResponse } from 'next/server'
// Simplified error handling - Sentry monitoring removed
import { ZodError } from 'zod'

export interface APIError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export class CustomAPIError extends Error implements APIError {
  statusCode: number
  code: string
  details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message)
    this.name = 'CustomAPIError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

// Specific error classes
export class ValidationError extends CustomAPIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends CustomAPIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends CustomAPIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends CustomAPIError {
  constructor(message: string = 'Rate limit exceeded', resetTime?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', { resetTime })
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends CustomAPIError {
  constructor(service: string, message: string) {
    super(`${service} service error: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', { service })
    this.name = 'ExternalServiceError'
  }
}

// Error handling middleware
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    reportToSentry?: boolean
    endpoint?: string
    method?: string
  } = {}
) {
  const { reportToSentry = true, endpoint, method } = options

  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleAPIError(error, {
        request,
        reportToSentry,
        endpoint,
        method
      })
    }
  }
}

// Main error handling function
export function handleAPIError(
  error: unknown,
  context: {
    request?: NextRequest
    reportToSentry?: boolean
    endpoint?: string
    method?: string
  } = {}
): NextResponse {
  const { request, reportToSentry = true, endpoint, method } = context

  console.error('API Error:', error)

  let statusCode = 500
  let message = 'Internal server error'
  let code = 'INTERNAL_ERROR'
  let details: any = undefined

  // Handle different error types
  if (error instanceof CustomAPIError) {
    statusCode = error.statusCode
    message = error.message
    code = error.code
    details = error.details
  } else if (error instanceof ZodError) {
    statusCode = 400
    message = 'Validation failed'
    code = 'VALIDATION_ERROR'
    details = error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }))
  } else if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('JWT')) {
      statusCode = 401
      message = 'Invalid authentication token'
      code = 'INVALID_TOKEN'
    } else if (error.message.includes('PGRST116')) {
      // Supabase "not found" error
      statusCode = 404
      message = 'Resource not found'
      code = 'NOT_FOUND'
    } else if (error.message.includes('duplicate key')) {
      statusCode = 409
      message = 'Resource already exists'
      code = 'DUPLICATE_RESOURCE'
    } else if (error.message.includes('Foreign key')) {
      statusCode = 400
      message = 'Invalid reference to related resource'
      code = 'INVALID_REFERENCE'
    } else {
      message = error.message
    }
  }

  // Simplified error reporting - log to console for now
  if (reportToSentry && statusCode >= 500 && error instanceof Error) {
    console.error(`API Error [${statusCode}] at ${endpoint || request?.nextUrl.pathname || 'unknown'}:`, error)
  }

  // Create error response
  const errorResponse = {
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && error instanceof Error && {
        stack: error.stack
      })
    },
    timestamp: new Date().toISOString()
  }

  const response = NextResponse.json(errorResponse, { status: statusCode })

  // Add rate limit headers if it's a rate limit error
  if (error instanceof RateLimitError && error.details?.resetTime) {
    response.headers.set('Retry-After', Math.ceil((error.details.resetTime - Date.now()) / 1000).toString())
    response.headers.set('X-RateLimit-Reset', error.details.resetTime.toString())
  }

  return response
}

// Async error handler wrapper for route handlers
export function asyncHandler(
  fn: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return (request: NextRequest, context?: any) => {
    return Promise.resolve(fn(request, context)).catch((error) => {
      return handleAPIError(error, { request })
    })
  }
}

// Database error helper
export function handleDatabaseError(error: any): never {
  if (error.code === '23505') {
    throw new ValidationError('Resource already exists', {
      constraint: error.constraint
    })
  } else if (error.code === '23503') {
    throw new ValidationError('Invalid reference to related resource', {
      constraint: error.constraint
    })
  } else if (error.code === '23502') {
    throw new ValidationError('Required field is missing', {
      column: error.column
    })
  }
  
  throw new CustomAPIError('Database operation failed')
}