// Test file to check branding provider types
import type { BrandingSettings, BrandingUpdateInput } from './lib/branding/branding-provider'

// Test the types work correctly
const testBranding: BrandingSettings = {
  id: 'test',
  tenant_id: 'test-tenant',
  primary_color: '#000000',
  secondary_color: '#ffffff',
  accent_color: '#ff0000',
  background_color: '#ffffff',
  text_color: '#000000',
  font_family: 'Arial',
  social_links: {},
  created_at: '2023-01-01',
  updated_at: '2023-01-01'
}

const testUpdate: BrandingUpdateInput = {
  primary_color: '#new-color',
  company_name: 'Updated Company'
}

console.log('Types work correctly!')