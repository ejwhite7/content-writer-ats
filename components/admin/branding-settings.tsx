'use client'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/ui/file-upload'
import { useToast } from '@/components/ui/use-toast'
import { useBranding, type BrandingSettings, type BrandingUpdateInput } from '@/lib/branding/branding-provider'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Eye, RefreshCw } from 'lucide-react'

const brandingSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  font_family: z.string().min(1, 'Font family is required'),
  custom_domain: z.string().optional(),
  footer_text: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  privacy_policy_url: z.string().url().optional().or(z.literal('')),
  terms_of_service_url: z.string().url().optional().or(z.literal('')),
  custom_css: z.string().optional(),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
  tagline: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  email_sender_name: z.string().optional(),
  email_sender_address: z.string().email().optional().or(z.literal(''))
})

type BrandingFormData = z.infer<typeof brandingSchema>

interface TenantData {
  id?: string
  name?: string
}

interface BrandingSettingsProps {
  initialBranding?: BrandingSettings
  tenant?: TenantData
}

interface FontOption {
  value: string
  label: string
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
]


export function BrandingSettings({ initialBranding, tenant }: BrandingSettingsProps) {
  const { branding, updateBranding, applyBrandingStyles } = useBranding()
  const { toast } = useToast()
  const [saving, setSaving] = useState<boolean>(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const supabase = createClient()

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      company_name: initialBranding?.company_name || tenant?.name || '',
      primary_color: initialBranding?.primary_color || '#2563eb',
      secondary_color: initialBranding?.secondary_color || '#64748b',
      accent_color: initialBranding?.accent_color || '#059669',
      font_family: initialBranding?.font_family || 'Inter',
      custom_domain: initialBranding?.custom_domain || '',
      footer_text: initialBranding?.footer_text || 'Powered by ATS Platform',
      contact_email: initialBranding?.contact_email || '',
      privacy_policy_url: initialBranding?.privacy_policy_url || '',
      terms_of_service_url: initialBranding?.terms_of_service_url || '',
      custom_css: initialBranding?.custom_css || ''
    }
  })

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }

  const onSubmit: SubmitHandler<BrandingFormData> = async (data) => {
    setSaving(true)
    
    try {
      let logoUrl = initialBranding?.logo_url
      let faviconUrl = initialBranding?.favicon_url

      // Upload logo if provided
      if (logoFile) {
        const fileExtension = logoFile.name.split('.').pop()
        logoUrl = await uploadFile(
          logoFile, 
          'branding', 
          `${tenant?.id}/logo-${Date.now()}.${fileExtension}`
        )
      }

      // Upload favicon if provided
      if (faviconFile) {
        const fileExtension = faviconFile.name.split('.').pop()
        faviconUrl = await uploadFile(
          faviconFile, 
          'branding', 
          `${tenant?.id}/favicon-${Date.now()}.${fileExtension}`
        )
      }

      const updates: BrandingUpdateInput = {
        ...data,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        social_links: initialBranding?.social_links || {}
      }

      await updateBranding(updates)

      toast({
        title: 'Branding Updated',
        description: 'Your branding settings have been saved successfully.'
      })
    } catch (error) {
      console.error('Error saving branding:', error)
      toast({
        title: 'Error',
        description: 'Failed to save branding settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const previewChanges = (): void => {
    const formData = form.getValues()
    
    // Apply styles temporarily
    const root = document.documentElement
    root.style.setProperty('--primary', hexToHsl(formData.primary_color))
    root.style.setProperty('--secondary', hexToHsl(formData.secondary_color))
    root.style.setProperty('--accent', hexToHsl(formData.accent_color))
    document.body.style.fontFamily = formData.font_family

    toast({
      title: 'Preview Applied',
      description: 'Preview changes applied. Save to make them permanent.'
    })
  }

  const resetPreview = (): void => {
    applyBrandingStyles()
    toast({
      title: 'Preview Reset',
      description: 'Preview reset to saved settings.'
    })
  }

  const handleFileSelect = (file: File | File[]): void => {
    if (Array.isArray(file)) {
      setLogoFile(file[0] || null)
    } else {
      setLogoFile(file || null)
    }
  }

  const handleFaviconFileSelect = (file: File | File[]): void => {
    if (Array.isArray(file)) {
      setFaviconFile(file[0] || null)
    } else {
      setFaviconFile(file || null)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="colors">Colors & Fonts</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  {...form.register('company_name')}
                />
                {form.formState.errors.company_name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.company_name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...form.register('contact_email')}
                />
                {form.formState.errors.contact_email && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.contact_email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="custom_domain">Custom Domain</Label>
                <Input
                  id="custom_domain"
                  placeholder="hire.yourcompany.com"
                  {...form.register('custom_domain')}
                />
                {form.formState.errors.custom_domain && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.custom_domain.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="footer_text">Footer Text</Label>
                <Textarea
                  id="footer_text"
                  placeholder="Powered by ATS Platform"
                  {...form.register('footer_text')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colors & Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      className="w-16 h-10 p-1 border"
                      {...form.register('primary_color')}
                    />
                    <Input
                      value={form.watch('primary_color')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        form.setValue('primary_color', e.target.value)
                      }
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      className="w-16 h-10 p-1 border"
                      {...form.register('secondary_color')}
                    />
                    <Input
                      value={form.watch('secondary_color')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        form.setValue('secondary_color', e.target.value)
                      }
                      placeholder="#64748b"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accent_color"
                      type="color"
                      className="w-16 h-10 p-1 border"
                      {...form.register('accent_color')}
                    />
                    <Input
                      value={form.watch('accent_color')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        form.setValue('accent_color', e.target.value)
                      }
                      placeholder="#059669"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="font_family">Font Family</Label>
                <select
                  {...form.register('font_family')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  {FONT_OPTIONS.map((font: FontOption) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Logo</Label>
                <FileUpload
                  accept="image/*"
                  onFileSelect={handleFileSelect}
                  maxSize={2 * 1024 * 1024}
                  description="Upload your company logo (PNG, JPG, SVG, max 2MB)"
                />
                {initialBranding?.logo_url && !logoFile && (
                  <div className="mt-2">
                    <img 
                      src={initialBranding.logo_url} 
                      alt="Current logo" 
                      className="h-16 object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label>Favicon</Label>
                <FileUpload
                  accept="image/*"
                  onFileSelect={handleFaviconFileSelect}
                  maxSize={1 * 1024 * 1024}
                  description="Upload favicon (PNG, ICO, max 1MB, recommended 32x32px)"
                />
                {initialBranding?.favicon_url && !faviconFile && (
                  <div className="mt-2">
                    <img 
                      src={initialBranding.favicon_url} 
                      alt="Current favicon" 
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                <Input
                  id="privacy_policy_url"
                  type="url"
                  placeholder="https://yourcompany.com/privacy"
                  {...form.register('privacy_policy_url')}
                />
                {form.formState.errors.privacy_policy_url && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.privacy_policy_url.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="terms_of_service_url">Terms of Service URL</Label>
                <Input
                  id="terms_of_service_url"
                  type="url"
                  placeholder="https://yourcompany.com/terms"
                  {...form.register('terms_of_service_url')}
                />
                {form.formState.errors.terms_of_service_url && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.terms_of_service_url.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="custom_css">Custom CSS</Label>
                <Textarea
                  id="custom_css"
                  rows={8}
                  placeholder="/* Add your custom CSS here */"
                  {...form.register('custom_css')}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Advanced users can add custom CSS to further customize the appearance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={previewChanges}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetPreview}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Preview
          </Button>
        </div>
        
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string {
  if (!hex || typeof hex !== 'string') {
    return '0 0% 0%' // Default to black
  }
  
  const normalizedHex = hex.replace('#', '')
  if (!/^[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
    return '0 0% 0%' // Default to black
  }
  
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