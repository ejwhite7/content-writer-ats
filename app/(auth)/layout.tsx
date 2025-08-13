import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-primary">
        <div className="mx-auto w-full max-w-sm text-white">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-semibold">ATS Platform</span>
          </Link>
          
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to the Future of Hiring
            </h1>
            <p className="text-lg text-white/90">
              Streamline your recruitment process with our AI-powered ATS platform. 
              Connect with top talent and make data-driven hiring decisions.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full" />
                <span className="text-white/90">AI-powered candidate screening</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full" />
                <span className="text-white/90">Streamlined interview scheduling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full" />
                <span className="text-white/90">Data-driven hiring insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-semibold">ATS Platform</span>
            </Link>
          </div>

          {children}
          
          {/* Theme toggle */}
          <div className="mt-8 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}