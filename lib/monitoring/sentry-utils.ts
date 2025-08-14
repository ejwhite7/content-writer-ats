import * as Sentry from '@sentry/nextjs'

export interface UserContext {
  id: string
  email: string
  role: string
  tenantId: string
}

export interface ErrorContext {
  component?: string
  action?: string
  metadata?: Record<string, any>
}

// Set user context for Sentry
export function setSentryUser(user: UserContext) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
    tenant_id: user.tenantId
  })
}

// Clear user context
export function clearSentryUser() {
  Sentry.setUser(null)
}

// Add breadcrumb for tracking user actions
export function addBreadcrumb(
  message: string,
  category: string = 'user_action',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000
  })
}

// Capture exception with context
export function captureException(
  error: Error,
  context?: ErrorContext
) {
  return Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag('component', context.component)
    }
    if (context?.action) {
      scope.setTag('action', context.action)
    }
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata)
    }
    
    return Sentry.captureException(error)
  })
}

// Capture message with context
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: ErrorContext
) {
  return Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag('component', context.component)
    }
    if (context?.action) {
      scope.setTag('action', context.action)
    }
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata)
    }
    
    return Sentry.captureMessage(message, level)
  })
}

// Performance monitoring
export function startTransaction(
  name: string,
  op: string = 'http.server',
  data?: Record<string, any>
) {
  return Sentry.startSpan({
    name,
    op
  }, () => {})
}

// Measure function performance
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  op: string = 'function'
): Promise<T> {
  return await Sentry.startSpan({
    name,
    op
  }, async () => {
    try {
      return await fn()
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  })
}

// Application-specific error handlers
export class ErrorReporter {
  static reportDatabaseError(error: Error, query?: string, params?: any) {
    return captureException(error, {
      component: 'database',
      action: 'query_execution',
      metadata: {
        query: query?.substring(0, 200), // Truncate long queries
        params: params ? JSON.stringify(params) : undefined
      }
    })
  }
  
  static reportAPIError(
    error: Error,
    endpoint: string,
    method: string,
    userId?: string
  ) {
    return captureException(error, {
      component: 'api',
      action: `${method}_${endpoint}`,
      metadata: {
        endpoint,
        method,
        user_id: userId
      }
    })
  }
  
  static reportAIScoringError(error: Error, contentLength?: number) {
    return captureException(error, {
      component: 'ai_scoring',
      action: 'score_assessment',
      metadata: {
        content_length: contentLength
      }
    })
  }
  
  static reportEmailError(error: Error, emailType: string, recipient?: string) {
    return captureException(error, {
      component: 'email',
      action: `send_${emailType}`,
      metadata: {
        email_type: emailType,
        has_recipient: !!recipient
      }
    })
  }
  
  static reportAuthError(error: Error, action: string, userId?: string) {
    return captureException(error, {
      component: 'auth',
      action,
      metadata: {
        user_id: userId
      }
    })
  }
}