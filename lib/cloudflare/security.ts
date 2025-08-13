import { NextRequest } from 'next/server'

export interface CloudflareSecurityConfig {
  enableBotManagement: boolean
  enableDDoSProtection: boolean
  enableWAF: boolean
  rateLimitRules: RateLimitRule[]
  firewallRules: FirewallRule[]
}

export interface RateLimitRule {
  id: string
  description: string
  match: string
  threshold: number
  period: number
  action: 'block' | 'challenge' | 'js_challenge' | 'managed_challenge'
}

export interface FirewallRule {
  id: string
  description: string
  expression: string
  action: 'allow' | 'block' | 'challenge' | 'js_challenge' | 'managed_challenge'
  priority: number
}

// Security headers configuration for Cloudflare
export const cloudflareSecurityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co https://images.clerk.dev https://cdn.clerk.dev",
    "connect-src 'self' https://*.supabase.co https://clerk.com https://*.clerk.accounts.dev https://api.anthropic.com https://api.resend.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Security headers
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cloudflare specific
  'CF-Cache-Status': 'DYNAMIC', // Don't cache dynamic content
  'CF-Ray': '', // Will be populated by Cloudflare
}

// Default rate limiting rules for Cloudflare
export const defaultRateLimitRules: RateLimitRule[] = [
  {
    id: 'api-rate-limit',
    description: 'API endpoints rate limit',
    match: '(http.request.uri.path contains "/api/")',
    threshold: 100,
    period: 60, // 100 requests per minute
    action: 'block'
  },
  {
    id: 'auth-rate-limit',
    description: 'Authentication endpoints rate limit',
    match: '(http.request.uri.path contains "/api/auth/" or http.request.uri.path contains "/sign-in" or http.request.uri.path contains "/sign-up")',
    threshold: 10,
    period: 60, // 10 requests per minute for auth
    action: 'managed_challenge'
  },
  {
    id: 'file-upload-rate-limit',
    description: 'File upload rate limit',
    match: '(http.request.uri.path contains "/api/upload")',
    threshold: 5,
    period: 60, // 5 uploads per minute
    action: 'block'
  },
  {
    id: 'assessment-score-rate-limit',
    description: 'AI scoring rate limit',
    match: '(http.request.uri.path contains "/api/assessments/score")',
    threshold: 10,
    period: 60, // 10 scoring requests per minute
    action: 'block'
  }
]

// Default firewall rules
export const defaultFirewallRules: FirewallRule[] = [
  {
    id: 'block-known-bots',
    description: 'Block known malicious bots',
    expression: '(cf.bot_management.verified_bot eq false and cf.bot_management.score lt 30)',
    action: 'block',
    priority: 1
  },
  {
    id: 'challenge-suspicious-requests',
    description: 'Challenge suspicious requests',
    expression: '(cf.threat_score gt 14)',
    action: 'managed_challenge',
    priority: 2
  },
  {
    id: 'block-high-risk-countries',
    description: 'Block requests from high-risk countries',
    expression: '(ip.geoip.country in {"CN" "RU" "KP"})', // Example - adjust as needed
    action: 'block',
    priority: 3
  },
  {
    id: 'allow-search-engines',
    description: 'Always allow verified search engines',
    expression: '(cf.bot_management.verified_bot)',
    action: 'allow',
    priority: 0
  }
]

// Extract Cloudflare headers from request
export function getCloudflareData(request: NextRequest) {
  return {
    ray: request.headers.get('cf-ray'),
    country: request.headers.get('cf-ipcountry'),
    colo: request.headers.get('cf-colo'),
    visitorId: request.headers.get('cf-visitor'),
    threatScore: parseInt(request.headers.get('cf-threat-score') || '0'),
    botScore: parseInt(request.headers.get('cf-bot-score') || '0'),
    isBot: request.headers.get('cf-bot-management-verified-bot') === 'true',
    clientIp: request.headers.get('cf-connecting-ip') || request.ip,
    userAgent: request.headers.get('user-agent')
  }
}

// Check if request should be blocked based on Cloudflare data
export function shouldBlockRequest(cfData: ReturnType<typeof getCloudflareData>): {
  shouldBlock: boolean
  reason?: string
} {
  // Block high threat scores
  if (cfData.threatScore > 50) {
    return {
      shouldBlock: true,
      reason: `High threat score: ${cfData.threatScore}`
    }
  }
  
  // Block unverified bots with low bot score
  if (cfData.botScore < 30 && !cfData.isBot) {
    return {
      shouldBlock: true,
      reason: `Suspicious bot behavior: score ${cfData.botScore}`
    }
  }
  
  return { shouldBlock: false }
}

// Generate security report for monitoring
export function generateSecurityReport(cfData: ReturnType<typeof getCloudflareData>) {
  return {
    timestamp: new Date().toISOString(),
    cloudflare: {
      ray: cfData.ray,
      country: cfData.country,
      colo: cfData.colo,
      threatScore: cfData.threatScore,
      botScore: cfData.botScore,
      isVerifiedBot: cfData.isBot,
      clientIp: cfData.clientIp ? cfData.clientIp.substring(0, 8) + '***' : undefined // Partial IP for privacy
    },
    userAgent: cfData.userAgent
  }
}