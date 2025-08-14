import Link from 'next/link'
import Image from 'next/image'
import { Briefcase } from 'lucide-react'
import { useBranding } from '@/lib/branding/branding-provider'

export function PublicFooter() {
  const { branding } = useBranding()
  
  const essentialLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact Us', href: '/contact' },
  ]

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {branding?.logo_url ? (
                  <Image
                    src={branding.logo_url}
                    alt={branding.company_name || 'Logo'}
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                ) : (
                  <Briefcase className="h-8 w-8 text-primary" />
                )}
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {branding?.company_name || 'Content Writer Jobs'}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                {branding?.tagline || 'Connecting talented content writers with companies that need great writing. Find your next content writing opportunity or hire exceptional writers.'}
              </p>
            </div>

            {/* Essential Links */}
            <div className="space-y-4">
              <ul className="space-y-2">
                {essentialLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              © 2024 {branding?.company_name || 'Content Writer Jobs'}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}