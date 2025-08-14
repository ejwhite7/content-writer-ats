import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/jobs',
  '/jobs/(.*)',
  '/api/webhooks/(.*)',
  '/api/public/(.*)',
  '/_vercel',
  '/favicon.ico',
  '/_next/(.*)',
])

export default clerkMiddleware((auth, req: NextRequest) => {
  // Handle public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // Protect all other routes
  const authData = auth()
  
  // Custom redirect logic
  function handleAuth() {
    const { userId, sessionClaims } = authData
    const { pathname } = req.nextUrl
    
    // Handle root redirect based on user role
    if (pathname === '/' && userId) {
      const url = req.nextUrl.clone()
      
      // Check if user has admin role (stored in Clerk metadata)
      if ((sessionClaims?.metadata as any)?.role === 'admin') {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      } else {
        url.pathname = '/candidate'
        return NextResponse.redirect(url)
      }
    }
    
    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!userId) {
        const url = req.nextUrl.clone()
        url.pathname = '/sign-in'
        return NextResponse.redirect(url)
      }
      
      if ((sessionClaims?.metadata as any)?.role !== 'admin') {
        const url = req.nextUrl.clone()
        url.pathname = '/candidate'
        return NextResponse.redirect(url)
      }
    }
    
    // Protect candidate routes
    if (pathname.startsWith('/candidate')) {
      if (!userId) {
        const url = req.nextUrl.clone()
        url.pathname = '/sign-in'
        return NextResponse.redirect(url)
      }
    }
    
    // Allow public routes and API routes
    return NextResponse.next()
  }
  
  return handleAuth()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}