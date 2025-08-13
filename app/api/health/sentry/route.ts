import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: NextRequest) {
  try {
    // Test Sentry connection by sending a test event
    const eventId = Sentry.captureMessage('Sentry health check', 'info')
    
    if (eventId) {
      return NextResponse.json({
        status: 'healthy',
        service: 'sentry',
        eventId,
        timestamp: new Date().toISOString(),
        config: {
          dsn: !!process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV,
          release: process.env.VERCEL_GIT_COMMIT_SHA || 'development'
        }
      })
    } else {
      throw new Error('Failed to send test event to Sentry')
    }
  } catch (error) {
    console.error('Sentry health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'sentry',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, level = 'info', tags } = await request.json()
    
    const eventId = Sentry.withScope((scope) => {
      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value as string)
        })
      }
      scope.setTag('source', 'health_check')
      
      return Sentry.captureMessage(message, level as Sentry.SeverityLevel)
    })
    
    return NextResponse.json({
      success: true,
      eventId,
      message: 'Test event sent to Sentry',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sentry test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test event',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}