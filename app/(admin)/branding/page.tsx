import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { BrandingSettings } from '@/components/admin/branding-settings'
import type { BrandingSettings as BrandingSettingsType } from '@/lib/branding/branding-provider'

interface TenantData {
  id: string
  name: string
  slug: string
  domain?: string
  custom_domain?: string
  is_active: boolean
  subscription_plan: string
  subscription_expires_at?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export default async function BrandingPage() {
  const user = await requireAdmin()
  const supabase = createClient()

  // Fetch current branding settings
  const { data: branding } = await supabase
    .from('branding_settings')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .single()

  // Fetch tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.tenant_id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branding & White-labeling</h1>
        <p className="text-muted-foreground">
          Customize the appearance and branding of your hiring platform
        </p>
      </div>

      <BrandingSettings 
        initialBranding={branding as BrandingSettingsType | undefined}
        tenant={tenant as TenantData | undefined}
      />
    </div>
  )
}