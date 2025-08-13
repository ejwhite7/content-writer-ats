import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@/types/database'

export type UserRole = 'admin' | 'candidate'

export interface AuthUser extends User {
  clerk_id: string
}

/**
 * Get the current authenticated user from Clerk and Supabase
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { userId } = auth()
    if (!userId) return null

    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (error || !user) {
      console.error('Error fetching user from Supabase:', error)
      return null
    }

    return user as AuthUser
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Check if the current user has candidate role
 */
export async function isCandidate(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'candidate'
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Admin role required')
  }
  return user
}

/**
 * Require candidate role - throws if not candidate
 */
export async function requireCandidate(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'candidate') {
    throw new Error('Candidate role required')
  }
  return user
}

/**
 * Get tenant information for the current user
 */
export async function getCurrentTenant() {
  const user = await getCurrentUser()
  if (!user?.tenant_id) return null

  const supabase = createClient()
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*, branding_settings(*)')
    .eq('id', user.tenant_id)
    .single()

  if (error) {
    console.error('Error fetching tenant:', error)
    return null
  }

  return tenant
}

/**
 * Update user role in both Clerk and Supabase
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    // Update in Supabase
    const supabase = createClient()
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ role })
      .eq('clerk_id', userId)

    if (supabaseError) {
      throw new Error(`Failed to update role in Supabase: ${supabaseError.message}`)
    }

    // You would also update Clerk metadata here if needed
    // This would require the Clerk backend API
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}