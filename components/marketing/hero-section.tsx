'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Users, 
  Building2, 
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface HeroSectionProps {
  onSearch?: (query: string, location: string) => void
  featuredCompanies?: string[]
  stats?: {
    totalJobs: number
    totalCompanies: number
    successfulPlacements: number
  }
}

export function HeroSection({ 
  onSearch, 
  featuredCompanies = ['Google', 'Microsoft', 'Apple', 'Netflix', 'Spotify'],
  stats = {
    totalJobs: 15420,
    totalCompanies: 2500,
    successfulPlacements: 8930
  }
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery, location)
    }
  }

  const popularSearches = [
    'Software Engineer',
    'Product Manager', 
    'Data Scientist',
    'UX Designer',
    'DevOps Engineer'
  ]

  const benefits = [
    'AI-powered job matching',
    'Direct company connections',
    'Real-time application tracking',
    'Personalized recommendations'
  ]

  return (
    <section className="relative bg-gradient-to-br from-background via-background/95 to-muted/20 border-b">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative">
        <div className="container mx-auto px-4 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  #1 AI-Powered ATS Platform
                </Badge>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Find Your 
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {' '}Dream Job
                  </span>
                  <br />
                  With AI Precision
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Connect with top companies through our intelligent matching system. 
                  Get discovered, apply smarter, and land your perfect role faster than ever.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 p-2 bg-background border rounded-lg shadow-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <Search className="h-5 w-5 text-muted-foreground ml-3 mr-2 flex-shrink-0" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 text-base"
                    />
                  </div>
                  
                  <div className="flex items-center flex-1 min-w-0 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-3">
                    <MapPin className="h-5 w-5 text-muted-foreground ml-3 sm:ml-0 mr-2 flex-shrink-0" />
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 text-base"
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="px-8">
                    Search Jobs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>

              {/* Popular Searches */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/jobs">
                  <Button size="lg" className="w-full sm:w-auto">
                    Browse All Jobs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                  <PlayCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Column - Visual/Stats */}
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border p-6 text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalJobs.toLocaleString()}+
                  </div>
                  <div className="text-sm text-muted-foreground">Active Jobs</div>
                </div>
                
                <div className="bg-card rounded-lg border p-6 text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalCompanies.toLocaleString()}+
                  </div>
                  <div className="text-sm text-muted-foreground">Companies</div>
                </div>
                
                <div className="sm:col-span-2 bg-card rounded-lg border p-6 text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats.successfulPlacements.toLocaleString()}+
                  </div>
                  <div className="text-sm text-muted-foreground">Successful Placements</div>
                </div>
              </div>

              {/* Featured Companies */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Trusted by leading companies worldwide
                  </p>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center justify-items-center opacity-60">
                  {featuredCompanies.map((company) => (
                    <div 
                      key={company} 
                      className="h-12 w-20 bg-muted rounded flex items-center justify-center text-xs font-medium text-muted-foreground"
                    >
                      {company}
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-primary/5 rounded-lg border border-primary/20 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      "I found my dream job in just 2 weeks! The AI matching was incredibly accurate."
                    </p>
                    <div className="text-sm font-medium">
                      Sarah Chen, Software Engineer at Google
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}