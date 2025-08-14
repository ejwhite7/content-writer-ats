import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { BrandingProvider } from '@/lib/branding/branding-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import * as Sentry from '@sentry/nextjs';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Content Writer Jobs - Find Your Next Writing Opportunity',
    template: '%s | Content Writer Jobs'
  },
  description: 'Connect with companies looking for talented content writers. Browse vetted writing opportunities, showcase your skills, and land your perfect content writing role.',
  keywords: ['content writer jobs', 'writing jobs', 'copywriter', 'blog writer', 'content marketing', 'freelance writing', 'content creation', 'writing career'],
  authors: [{ name: 'Content Writer Jobs' }],
  creator: 'Content Writer Jobs',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Content Writer Jobs - Find Your Next Writing Opportunity',
    description: 'Connect with companies looking for talented content writers. Browse vetted writing opportunities, showcase your skills, and land your perfect content writing role.',
    siteName: 'Content Writer Jobs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Writer Jobs - Find Your Next Writing Opportunity',
    description: 'Connect with companies looking for talented content writers. Browse vetted writing opportunities, showcase your skills, and land your perfect content writing role.',
    creator: '@contentwriterjobs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  other: {
    ...Sentry.getTraceData()
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className
        )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BrandingProvider tenantId="default">
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Toaster />
            </BrandingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}