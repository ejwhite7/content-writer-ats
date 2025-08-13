#!/usr/bin/env node

const { createCloudflareAPI } = require('../lib/cloudflare/api')
const { defaultRateLimitRules, defaultFirewallRules } = require('../lib/cloudflare/security')

async function setupCloudflareSecurity() {
  console.log('🚀 Setting up Cloudflare security configurations...')
  
  try {
    const cloudflareAPI = createCloudflareAPI()
    
    if (!cloudflareAPI) {
      console.error('❌ Cloudflare API not configured. Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID')
      process.exit(1)
    }
    
    // Test API connection
    console.log('🔍 Testing Cloudflare API connection...')
    const zoneInfo = await cloudflareAPI.getZoneInfo()
    console.log(`✅ Connected to zone: ${zoneInfo.name}`)
    
    // Set up security level
    console.log('🔒 Setting security level to "medium"...')
    await cloudflareAPI.setSecurityLevel('medium')
    console.log('✅ Security level updated')
    
    // Enable bot management
    console.log('🤖 Configuring bot management...')
    try {
      await cloudflareAPI.updateBotManagement({
        enable_js: true,
        fight_mode: false, // Don't be too aggressive initially
        using_latest_model: true
      })
      console.log('✅ Bot management configured')
    } catch (error) {
      console.log('⚠️  Bot management not available (requires Pro plan or higher)')
    }
    
    // Set up firewall rules
    console.log('🛡️  Setting up firewall rules...')
    const existingFirewallRules = await cloudflareAPI.listFirewallRules()
    
    for (const rule of defaultFirewallRules) {
      // Check if rule already exists
      const existingRule = existingFirewallRules.find(r => r.description === rule.description)
      
      if (existingRule) {
        console.log(`⏭️  Firewall rule "${rule.description}" already exists, skipping...`)
        continue
      }
      
      try {
        await cloudflareAPI.createFirewallRule({
          expression: rule.expression,
          action: rule.action,
          description: rule.description,
          priority: rule.priority
        })
        console.log(`✅ Created firewall rule: ${rule.description}`)
      } catch (error) {
        console.error(`❌ Failed to create firewall rule "${rule.description}":`, error.message)
      }
    }
    
    // Set up rate limiting rules
    console.log('⏱️  Setting up rate limiting rules...')
    const existingRateLimits = await cloudflareAPI.listRateLimitRules()
    
    for (const rule of defaultRateLimitRules) {
      // Check if rule already exists
      const existingRule = existingRateLimits.find(r => r.description === rule.description)
      
      if (existingRule) {
        console.log(`⏭️  Rate limit rule "${rule.description}" already exists, skipping...`)
        continue
      }
      
      try {
        await cloudflareAPI.createRateLimitRule({
          match: {
            request: {
              url: `*${process.env.NEXT_PUBLIC_APP_URL || 'localhost'}*`,
              schemes: ['HTTP', 'HTTPS']
            }
          },
          threshold: rule.threshold,
          period: rule.period,
          action: {
            mode: rule.action === 'block' ? 'ban' : 'challenge',
            timeout: rule.action === 'block' ? 60 : undefined
          },
          description: rule.description
        })
        console.log(`✅ Created rate limit rule: ${rule.description}`)
      } catch (error) {
        console.error(`❌ Failed to create rate limit rule "${rule.description}":`, error.message)
      }
    }
    
    // Set up page rules for caching
    console.log('📄 Setting up page rules...')
    const pageRules = [
      {
        targets: [{
          target: 'url',
          constraint: { operator: 'matches', value: `${process.env.NEXT_PUBLIC_APP_URL}/*` }
        }],
        actions: [
          { id: 'browser_cache_ttl', value: 14400 }, // 4 hours
          { id: 'cache_level', value: 'cache_everything' },
          { id: 'edge_cache_ttl', value: 7200 } // 2 hours
        ],
        priority: 1,
        status: 'active'
      },
      {
        targets: [{
          target: 'url',
          constraint: { operator: 'matches', value: `${process.env.NEXT_PUBLIC_APP_URL}/api/*` }
        }],
        actions: [
          { id: 'cache_level', value: 'bypass' }, // Don't cache API responses
          { id: 'security_level', value: 'high' } // Higher security for API
        ],
        priority: 2,
        status: 'active'
      }
    ]
    
    try {
      const existingPageRules = await cloudflareAPI.listPageRules()
      
      for (const rule of pageRules) {
        // Simple check - if we have any page rules, skip creation
        const hasExistingRules = existingPageRules.length > 0
        
        if (hasExistingRules) {
          console.log('⏭️  Page rules already exist, skipping...')
          break
        }
        
        await cloudflareAPI.createPageRule(rule)
        console.log(`✅ Created page rule for priority ${rule.priority}`)
      }
    } catch (error) {
      console.error('❌ Failed to set up page rules:', error.message)
    }
    
    console.log('\\n🎉 Cloudflare security setup completed!')
    console.log('\\n📊 Summary:')
    console.log('  - Security level: Medium')
    console.log('  - Bot management: Enabled (if available)')
    console.log(`  - Firewall rules: ${defaultFirewallRules.length} configured`)
    console.log(`  - Rate limit rules: ${defaultRateLimitRules.length} configured`)
    console.log('  - Page rules: Caching and security configured')
    console.log('\\n⚠️  Note: Some features may not be available depending on your Cloudflare plan')
    
  } catch (error) {
    console.error('❌ Failed to set up Cloudflare security:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupCloudflareSecurity()
}

module.exports = { setupCloudflareSecurity }