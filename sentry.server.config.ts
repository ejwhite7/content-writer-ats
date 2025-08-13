import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error filtering
  beforeSend: (event) => {
    // Filter out specific errors we don't want to track
    if (event.exception) {
      const error = event.exception.values?.[0]
      
      // Don't log Redis connection errors if Redis is optional
      if (error?.type === 'RedisError' && 
          error?.value?.includes('Connection refused')) {
        console.warn('Redis connection failed, but continuing without caching')
        return null
      }
      
      // Don't log rate limiting errors (they're expected)
      if (error?.value?.includes('Rate limit exceeded')) {
        return null
      }
    }
    return event
  },
  
  // Additional configuration
  integrations: [
    new Sentry.NodeProfilingIntegration(),
  ],
  
  // Profiling (only in production)
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  
  // Debugging (disable in production)
  debug: process.env.NODE_ENV === 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // User context
  initialScope: {
    tags: {
      component: 'server'
    }
  },
  
  // Custom error handling
  beforeBreadcrumb: (breadcrumb) => {
    // Filter out sensitive data from breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data) {
      // Remove sensitive headers
      delete breadcrumb.data.authorization
      delete breadcrumb.data.cookie
      delete breadcrumb.data['x-api-key']
    }
    return breadcrumb
  }
})