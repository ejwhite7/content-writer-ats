'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu, 
  X, 
  Search, 
  Building2, 
  Users, 
  FileText, 
  Briefcase,
  ChevronDown,
  UserPlus,
  LogIn
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()

  const navigation = [
    { name: 'Find Jobs', href: '/jobs', icon: Search },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'About', href: '/about', icon: Users },
    { name: 'Resources', href: '/resources', icon: FileText },
  ]

  const resources = [
    { name: 'Career Guide', href: '/resources/career-guide' },
    { name: 'Resume Tips', href: '/resources/resume-tips' },
    { name: 'Interview Prep', href: '/resources/interview-prep' },
    { name: 'Salary Guide', href: '/resources/salary-guide' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                VettingPro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Find Jobs
            </Link>
            <Link 
              href="/companies" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Companies
            </Link>
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Career Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {resources.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href}>
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link 
              href="/about" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-2">
                <Link href="/candidate/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.firstName} {user?.lastName}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/applications">Applications</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/sign-out">Sign Out</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="flex items-center space-x-1">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-base font-medium text-muted-foreground hover:text-primary px-3 py-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Auth */}
              {!isSignedIn && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Link
                    href="/sign-in"
                    className="flex items-center space-x-3 text-base font-medium text-muted-foreground hover:text-primary px-3 py-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex items-center space-x-3 text-base font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}