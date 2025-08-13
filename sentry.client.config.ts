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
      if (error?.type === 'ChunkLoadError' || 
          error?.value?.includes('Loading chunk')) {
        return null // Don't send chunk loading errors
      }
    }
    return event
  },
  
  // Additional configuration
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracePropagationTargets: ['localhost', process.env.NEXT_PUBLIC_APP_URL],
    }),
    new Sentry.Replay({
      // Session replay for debugging (only in production)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Session replay sample rates
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Debugging (disable in production)
  debug: process.env.NODE_ENV === 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // User context
  initialScope: {
    tags: {
      component: 'client'
    }
  }
})