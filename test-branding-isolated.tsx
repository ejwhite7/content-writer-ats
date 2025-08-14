'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Mock Supabase client for testing
const mockSupabaseClient = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({
          data: null,
          error: null
        })
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({
          data: { ...data, id: 'test-id', created_at: '2023-01-01', updated_at: '2023-01-01' },
          error: null
        })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { ...data, id: 'test-id', created_at: '2023-01-01', updated_at: '2023-01-01' },
            error: null
          })
        })
      })
    })
  })
}

const createClient = () => mockSupabaseClient

// Define branding settings interface based on database schema
interface BrandingSettings {
  id: string
  tenant_id: string
  logo_url?: string
  favicon_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  company_name?: string
  tagline?: string
  website_url?: string
  social_links: Record<string, string>
  email_sender_name?: string
  email_sender_address?: string
  custom_css?: string
  created_at: string
  updated_at: string
  // Additional local properties
  footer_text?: string
  contact_email?: string
  privacy_policy_url?: string
  terms_of_service_url?: string
}

// Type for partial updates
type BrandingUpdateInput = Partial<Omit<BrandingSettings, 'id' | 'created_at' | 'updated_at'>>

interface BrandingContextType {
  branding: BrandingSettings | null
  loading: boolean
  error: string | null
  updateBranding: (updates: BrandingUpdateInput) => Promise<void>
  applyBrandingStyles: () => void
  refetch: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

interface BrandingProviderProps {
  children: React.ReactNode
  tenantId?: string
  initialBranding?: BrandingSettings
}

export function BrandingProvider({ 
  children, 
  tenantId, 
  initialBranding 
}: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingSettings | null>(initialBranding || null)
  const [loading, setLoading] = useState(!initialBranding)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const createDefaultBranding = async (tenantId: string): Promise<BrandingSettings> => {
    const defaultSettings: BrandingUpdateInput = {
      tenant_id: tenantId,
      company_name: 'Your Company',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      accent_color: '#059669',
      background_color: '#ffffff',
      text_color: '#000000',
      font_family: 'Inter',
      social_links: {},
      footer_text: 'Powered by ATS Platform',
      contact_email: 'support@yourcompany.com'
    }

    try {
      const { data, error: insertError } = await supabase
        .from('branding_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating default branding:', insertError)
        throw insertError
      }

      return data as BrandingSettings
    } catch (error) {
      console.error('Failed to create default branding settings:', error)
      // Return temporary default settings if database insert fails
      return {
        ...defaultSettings,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as BrandingSettings
    }
  }

  const fetchBranding = useCallback(async (): Promise<void> => {
    if (!tenantId) {
      setError('No tenant ID provided')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        console.error('Error fetching branding:', supabaseError)
        setError(supabaseError.message || 'Failed to fetch branding settings')
        return
      }

      if (data) {
        const brandingData = data as BrandingSettings
        setBranding(brandingData)
        applyBrandingStyles(brandingData)
      } else {
        // Create default branding settings
        const defaultBranding = await createDefaultBranding(tenantId)
        setBranding(defaultBranding)
        applyBrandingStyles(defaultBranding)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error in fetchBranding:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [tenantId, supabase])

  const updateBranding = useCallback(async (updates: BrandingUpdateInput): Promise<void> => {
    if (!branding) {
      throw new Error('No branding settings available to update')
    }

    setError(null)
    
    try {
      const { data, error: updateError } = await supabase
        .from('branding_settings')
        .update(updates)
        .eq('id', branding.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating branding:', updateError)
        setError(updateError.message || 'Failed to update branding settings')
        throw updateError
      }

      if (!data) {
        throw new Error('No data returned from update operation')
      }

      const updatedBranding = data as BrandingSettings
      setBranding(updatedBranding)
      applyBrandingStyles(updatedBranding)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error in updateBranding:', error)
      setError(errorMessage)
      throw error
    }
  }, [branding, supabase])

  const applyBrandingStyles = useCallback((brandingData?: BrandingSettings): void => {
    const currentBranding = brandingData || branding
    if (!currentBranding) return

    try {
      const root = document.documentElement

      // Apply CSS custom properties
      root.style.setProperty('--primary', hexToHsl(currentBranding.primary_color))
      root.style.setProperty('--secondary', hexToHsl(currentBranding.secondary_color))
      root.style.setProperty('--accent', hexToHsl(currentBranding.accent_color))
      
      // Apply background and text colors
      if (currentBranding.background_color) {
        root.style.setProperty('--background', hexToHsl(currentBranding.background_color))
      }
      if (currentBranding.text_color) {
        root.style.setProperty('--foreground', hexToHsl(currentBranding.text_color))
      }
      
      // Apply font family
      if (currentBranding.font_family) {
        root.style.setProperty('--font-family', currentBranding.font_family)
        if (document.body) {
          document.body.style.fontFamily = currentBranding.font_family
        }
      }

      // Apply custom CSS
      if (currentBranding.custom_css) {
        let customStyleEl = document.getElementById('custom-branding-styles') as HTMLStyleElement | null
        if (!customStyleEl) {
          customStyleEl = document.createElement('style')
          customStyleEl.id = 'custom-branding-styles'
          customStyleEl.type = 'text/css'
          document.head.appendChild(customStyleEl)
        }
        customStyleEl.textContent = currentBranding.custom_css
      }

      // Apply favicon
      if (currentBranding.favicon_url) {
        let faviconEl = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
        if (!faviconEl) {
          faviconEl = document.createElement('link')
          faviconEl.rel = 'icon'
          faviconEl.type = 'image/x-icon'
          document.head.appendChild(faviconEl)
        }
        faviconEl.href = currentBranding.favicon_url
      }

      // Update document title
      if (currentBranding.company_name) {
        const baseTitle = document.title.split(' | ')[0] || 'ATS Platform'
        document.title = `${baseTitle} | ${currentBranding.company_name}`
      }
    } catch (error) {
      console.error('Error applying branding styles:', error)
    }
  }, [branding])

  useEffect(() => {
    if (!initialBranding && tenantId) {
      fetchBranding()
    } else if (initialBranding) {
      setBranding(initialBranding)
      applyBrandingStyles(initialBranding)
    }
  }, [tenantId, initialBranding, fetchBranding, applyBrandingStyles])

  const contextValue: BrandingContextType = {
    branding,
    loading,
    error,
    updateBranding,
    applyBrandingStyles: () => applyBrandingStyles(),
    refetch: fetchBranding
  }

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding(): BrandingContextType {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}

/**
 * Utility function to convert hex color to HSL format for CSS custom properties
 * @param hex - Hex color string (with or without #)
 * @returns HSL color string in format "h s% l%"
 */
function hexToHsl(hex: string): string {
  // Validate and normalize hex input
  if (!hex || typeof hex !== 'string') {
    console.warn('Invalid hex color provided:', hex)
    return '0 0% 0%' // Default to black
  }
  
  // Remove # if present and validate length
  const normalizedHex = hex.replace('#', '')
  if (!/^[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
    console.warn('Invalid hex color format:', hex)
    return '0 0% 0%' // Default to black
  }
  
  // Convert hex to RGB
  const r = parseInt(normalizedHex.substring(0, 2), 16) / 255
  const g = parseInt(normalizedHex.substring(2, 4), 16) / 255
  const b = parseInt(normalizedHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number = 0
  let s: number = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: 
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g: 
        h = (b - r) / d + 2
        break
      case b: 
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Export the BrandingSettings type for use in other components
export type { BrandingSettings, BrandingUpdateInput }