import { NextRequest, NextResponse } from 'next/server'
import { createCloudflareAPI } from '@/lib/cloudflare/api'
import { getCloudflareData } from '@/lib/cloudflare/security'

export async function GET(request: NextRequest) {
  try {
    const cloudflareAPI = createCloudflareAPI()
    
    if (!cloudflareAPI) {
      return NextResponse.json(
        {
          status: 'warning',
          service: 'cloudflare',
          message: 'Cloudflare API not configured',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }
    
    // Test Cloudflare API connection
    const zoneInfo = await cloudflareAPI.getZoneInfo()
    const cfData = getCloudflareData(request)
    
    return NextResponse.json({
      status: 'healthy',
      service: 'cloudflare',
      timestamp: new Date().toISOString(),
      zone: {
        id: zoneInfo.id,
        name: zoneInfo.name,
        status: zoneInfo.status,
        paused: zoneInfo.paused
      },
      request_data: {
        ray: cfData.ray,
        country: cfData.country,
        colo: cfData.colo,
        threat_score: cfData.threatScore,
        bot_score: cfData.botScore,
        is_verified_bot: cfData.isBot
      },
      features: {
        bot_management: !!cfData.botScore,
        threat_intelligence: !!cfData.threatScore,
        ddos_protection: true, // Cloudflare always provides this
        waf: true, // Available on most plans
        rate_limiting: true
      }
    })
  } catch (error) {
    console.error('Cloudflare health check error:', error)
    
    // Still check for basic Cloudflare data even if API fails
    const cfData = getCloudflareData(request)
    const hasCloudflareData = !!(cfData.ray || cfData.country || cfData.colo)
    
    return NextResponse.json(
      {
        status: hasCloudflareData ? 'degraded' : 'unhealthy',
        service: 'cloudflare',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
        request_data: hasCloudflareData ? {
          ray: cfData.ray,
          country: cfData.country,
          colo: cfData.colo,
          threat_score: cfData.threatScore,
          bot_score: cfData.botScore
        } : null
      },
      { status: hasCloudflareData ? 200 : 503 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    const cloudflareAPI = createCloudflareAPI()
    
    if (!cloudflareAPI) {
      return NextResponse.json(
        { error: 'Cloudflare API not configured' },
        { status: 500 }
      )
    }
    
    let result: any
    
    switch (action) {
      case 'purge_cache':
        result = await cloudflareAPI.purgeCache(params)
        break
        
      case 'set_security_level':
        if (!params.level) {
          throw new Error('Security level is required')
        }
        result = await cloudflareAPI.setSecurityLevel(params.level)
        break
        
      case 'get_analytics':
        if (!params.since || !params.until) {
          throw new Error('Date range (since/until) is required for analytics')
        }
        result = await cloudflareAPI.getSecurityAnalytics(params)
        break
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cloudflare action error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}