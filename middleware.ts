import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    '/',
    '/jobs',
    '/jobs/(.*)',
    '/api/webhooks/(.*)',
    '/api/public/(.*)',
    '/_vercel',
    '/favicon.ico',
  ],
  // Routes that can always be accessed, and have protection if user is signed in
  ignoredRoutes: [
    '/_next/(.*)',
    '/api/public/(.*)',
    '/api/webhooks/(.*)',
    '/_vercel',
    '/favicon.ico',
  ],
  // Define organization-based routes if needed
  // organizationRoles: ['admin', 'member'],
  // Allow users to visit organization selection page
  // organizationSelection: {
  //   url: '/organization-selection'
  // },
  
  // Custom redirect logic
  afterAuth(auth, req: NextRequest) {
    const { userId, orgRole, orgId } = auth
    const { pathname } = req.nextUrl
    
    // Handle root redirect based on user role
    if (pathname === '/' && userId) {
      const url = req.nextUrl.clone()
      
      // Check if user has admin role (stored in Clerk metadata)
      if (auth.sessionClaims?.metadata?.role === 'admin') {
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
      
      if (auth.sessionClaims?.metadata?.role !== 'admin') {
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
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}