export interface CloudflareAPIConfig {
  apiToken: string
  zoneId: string
  accountId?: string
}

export class CloudflareAPI {
  private config: CloudflareAPIConfig
  private baseUrl = 'https://api.cloudflare.com/client/v4'

  constructor(config: CloudflareAPIConfig) {
    this.config = config
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Cloudflare API error: ${response.status} ${error}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`)
    }

    return data.result
  }

  // Zone management
  async getZoneInfo() {
    return this.request(`/zones/${this.config.zoneId}`)
  }

  async updateZoneSettings(settings: Record<string, any>) {
    return this.request(`/zones/${this.config.zoneId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings)
    })
  }

  // Firewall rules
  async createFirewallRule(rule: {
    expression: string
    action: string
    description: string
    priority?: number
  }) {
    return this.request(`/zones/${this.config.zoneId}/firewall/rules`, {
      method: 'POST',
      body: JSON.stringify([rule])
    })
  }

  async listFirewallRules() {
    return this.request(`/zones/${this.config.zoneId}/firewall/rules`)
  }

  async updateFirewallRule(ruleId: string, updates: Record<string, any>) {
    return this.request(`/zones/${this.config.zoneId}/firewall/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteFirewallRule(ruleId: string) {
    return this.request(`/zones/${this.config.zoneId}/firewall/rules/${ruleId}`, {
      method: 'DELETE'
    })
  }

  // Rate limiting
  async createRateLimitRule(rule: {
    match: {
      request: {
        url?: string
        schemes?: string[]
        methods?: string[]
      }
    }
    threshold: number
    period: number
    action: {
      mode: string
      timeout?: number
      response?: {
        content_type: string
        body: string
      }
    }
    description?: string
  }) {
    return this.request(`/zones/${this.config.zoneId}/rate_limits`, {
      method: 'POST',
      body: JSON.stringify(rule)
    })
  }

  async listRateLimitRules() {
    return this.request(`/zones/${this.config.zoneId}/rate_limits`)
  }

  async updateRateLimitRule(ruleId: string, updates: Record<string, any>) {
    return this.request(`/zones/${this.config.zoneId}/rate_limits/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteRateLimitRule(ruleId: string) {
    return this.request(`/zones/${this.config.zoneId}/rate_limits/${ruleId}`, {
      method: 'DELETE'
    })
  }

  // Page rules
  async createPageRule(rule: {
    targets: Array<{
      target: string
      constraint: {
        operator: string
        value: string
      }
    }>
    actions: Array<{
      id: string
      value?: any
    }>
    priority?: number
    status: 'active' | 'disabled'
  }) {
    return this.request(`/zones/${this.config.zoneId}/pagerules`, {
      method: 'POST',
      body: JSON.stringify(rule)
    })
  }

  async listPageRules() {
    return this.request(`/zones/${this.config.zoneId}/pagerules`)
  }

  // Security level
  async setSecurityLevel(level: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack') {
    return this.updateZoneSettings({
      security_level: { value: level }
    })
  }

  // Bot management
  async updateBotManagement(settings: {
    enable_js?: boolean
    fight_mode?: boolean
    using_latest_model?: boolean
  }) {
    return this.request(`/zones/${this.config.zoneId}/bot_management`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  // Analytics
  async getSecurityAnalytics(params: {
    since: string // ISO date
    until: string // ISO date
    dimensions?: string[]
    metrics?: string[]
  }) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','))
      } else {
        searchParams.append(key, value)
      }
    })

    return this.request(`/zones/${this.config.zoneId}/analytics/dashboard?${searchParams}`)
  }

  // Cache purging
  async purgeCache(options: {
    purge_everything?: boolean
    files?: string[]
    tags?: string[]
    hosts?: string[]
  } = {}) {
    return this.request(`/zones/${this.config.zoneId}/purge_cache`, {
      method: 'POST',
      body: JSON.stringify(options)
    })
  }
}

// Factory function with environment variables
export function createCloudflareAPI(): CloudflareAPI | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!apiToken || !zoneId) {
    console.warn('Cloudflare API credentials not configured')
    return null
  }

  return new CloudflareAPI({
    apiToken,
    zoneId,
    accountId
  })
}