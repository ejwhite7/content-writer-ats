import Link from 'next/link'
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github, 
  Facebook,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PublicFooter() {
  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
  ]

  const candidateLinks = [
    { name: 'Browse Jobs', href: '/jobs' },
    { name: 'Resume Builder', href: '/resume-builder' },
    { name: 'Career Advice', href: '/career-advice' },
    { name: 'Salary Guide', href: '/salary-guide' },
  ]

  const employerLinks = [
    { name: 'Post a Job', href: '/employers/post-job' },
    { name: 'Find Candidates', href: '/employers/candidates' },
    { name: 'Pricing', href: '/employers/pricing' },
    { name: 'Enterprise', href: '/employers/enterprise' },
  ]

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ]

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'GitHub', href: '#', icon: Github },
  ]

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  VettingPro
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                The AI-powered recruitment platform connecting top talent with leading companies. 
                Find your dream job or hire exceptional candidates with intelligent matching.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>hello@vettingpro.com</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="w-9 h-9 rounded-md bg-background border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
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

            {/* For Candidates */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">For Candidates</h3>
              <ul className="space-y-2">
                {candidateLinks.map((link) => (
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

            {/* For Employers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">For Employers</h3>
              <ul className="space-y-2">
                {employerLinks.map((link) => (
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

            {/* Support & Newsletter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Support</h3>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
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

              {/* Newsletter Signup */}
              <div className="pt-4">
                <h4 className="font-medium text-foreground mb-2">Stay Updated</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Get the latest job opportunities and career tips.
                </p>
                <form className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-9 text-sm"
                  />
                  <Button size="sm" className="w-full h-9">
                    Subscribe
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 VettingPro, Inc. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Cookies
              </Link>
              <Link href="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}