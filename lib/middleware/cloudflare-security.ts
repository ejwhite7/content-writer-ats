import { NextRequest, NextResponse } from 'next/server'
import { 
  getCloudflareData, 
  shouldBlockRequest, 
  generateSecurityReport,
  cloudflareSecurityHeaders 
} from '@/lib/cloudflare/security'
import { ErrorReporter } from '@/lib/monitoring/sentry-utils'

export interface CloudflareSecurityOptions {
  enableThreatBlocking?: boolean
  enableBotBlocking?: boolean
  enableSecurityHeaders?: boolean
  logSecurityEvents?: boolean
  whitelist?: {
    ips?: string[]
    userAgents?: string[]
    paths?: string[]
  }
}

export function withCloudflareSecurity(
  request: NextRequest,
  options: CloudflareSecurityOptions = {}
) {
  const {
    enableThreatBlocking = true,
    enableBotBlocking = true,
    enableSecurityHeaders = true,
    logSecurityEvents = true,
    whitelist = {}
  } = options

  try {
    // Extract Cloudflare data
    const cfData = getCloudflareData(request)
    
    // Generate security report
    const securityReport = generateSecurityReport(cfData)
    
    // Check whitelists first
    const isWhitelisted = checkWhitelist(request, cfData, whitelist)
    
    if (!isWhitelisted && (enableThreatBlocking || enableBotBlocking)) {
      // Check if request should be blocked
      const blockCheck = shouldBlockRequest(cfData)
      
      if (blockCheck.shouldBlock) {
        // Log security event
        if (logSecurityEvents) {
          console.log('Security block:', {
            reason: blockCheck.reason,
            ...securityReport
          })
          
          // Report to Sentry for monitoring
          ErrorReporter.reportAuthError(
            new Error(`Security block: ${blockCheck.reason}`),
            'cloudflare_security_block',
            cfData.clientIp
          )
        }
        
        return NextResponse.json(
          { 
            error: 'Access denied',
            code: 'SECURITY_BLOCK',
            timestamp: new Date().toISOString()
          },
          { 
            status: 403,
            headers: enableSecurityHeaders ? getSecurityResponseHeaders() : {}
          }
        )
      }
    }
    
    // Create response with security headers
    const response = NextResponse.next()
    
    if (enableSecurityHeaders) {
      const headers = getSecurityResponseHeaders()
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    
    // Add Cloudflare data to response headers for downstream use
    if (cfData.ray) response.headers.set('X-CF-Ray', cfData.ray)
    if (cfData.country) response.headers.set('X-CF-Country', cfData.country)
    if (cfData.clientIp) response.headers.set('X-Real-IP', cfData.clientIp)
    
    // Log security event for monitoring
    if (logSecurityEvents && (cfData.threatScore > 0 || cfData.botScore < 100)) {
      console.log('Security monitoring:', securityReport)
    }
    
    return response
  } catch (error) {
    console.error('Cloudflare security middleware error:', error)
    
    // Fail open - don't block requests if security check fails
    const response = NextResponse.next()
    
    if (options.enableSecurityHeaders) {
      const headers = getSecurityResponseHeaders()
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    
    return response
  }
}

function checkWhitelist(
  request: NextRequest,
  cfData: ReturnType<typeof getCloudflareData>,
  whitelist: CloudflareSecurityOptions['whitelist'] = {}
): boolean {
  const { ips = [], userAgents = [], paths = [] } = whitelist
  
  // Check IP whitelist
  if (ips.length > 0 && cfData.clientIp) {
    if (ips.some(ip => cfData.clientIp?.includes(ip))) {
      return true
    }
  }
  
  // Check User-Agent whitelist
  if (userAgents.length > 0 && cfData.userAgent) {
    if (userAgents.some(ua => cfData.userAgent?.includes(ua))) {
      return true
    }
  }
  
  // Check path whitelist
  if (paths.length > 0) {
    const pathname = request.nextUrl.pathname
    if (paths.some(path => pathname.startsWith(path))) {
      return true
    }
  }
  
  return false
}

function getSecurityResponseHeaders(): Record<string, string> {
  return {
    ...cloudflareSecurityHeaders,
    'X-Security-Policy': 'cloudflare-protected',
    'X-Robots-Tag': 'noindex, nofollow', // Prevent indexing of error pages
  }
}

// Specific middleware for different route types
export function withAPISecurityMiddleware(request: NextRequest) {
  return withCloudflareSecurity(request, {
    enableThreatBlocking: true,
    enableBotBlocking: true,
    enableSecurityHeaders: true,
    logSecurityEvents: true,
    whitelist: {
      paths: ['/api/health', '/api/webhooks'], // Health checks and webhooks might need special handling
      userAgents: ['curl', 'PostmanRuntime'] // Allow common API testing tools
    }
  })
}

export function withPublicPageSecurity(request: NextRequest) {
  return withCloudflareSecurity(request, {
    enableThreatBlocking: true,
    enableBotBlocking: false, // Allow good bots for public pages (SEO)
    enableSecurityHeaders: true,
    logSecurityEvents: false // Less logging for public pages
  })
}

export function withAdminSecurity(request: NextRequest) {
  return withCloudflareSecurity(request, {
    enableThreatBlocking: true,
    enableBotBlocking: true, // Strict bot blocking for admin
    enableSecurityHeaders: true,
    logSecurityEvents: true
  })
}