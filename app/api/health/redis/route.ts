import { NextRequest, NextResponse } from 'next/server'
import { checkRedisHealth } from '@/lib/redis/client'

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await checkRedisHealth()
    
    if (isHealthy) {
      return NextResponse.json({
        status: 'healthy',
        service: 'redis',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          service: 'redis',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Redis health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        service: 'redis',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}