'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    const errorId = Sentry.captureException(error, {
      tags: {
        component: 'global_error_boundary'
      },
      contexts: {
        error: {
          digest: error.digest
        }
      }
    })
    
    console.error('Global error captured:', error, 'Sentry ID:', errorId)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-center">
              <AlertTriangle className="h-20 w-20 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Application Error
              </h1>
              <p className="text-gray-600">
                Something went seriously wrong with the application. Our team has been notified and is working on a fix.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {error.stack}
                </pre>
                {error.digest && (
                  <p className="text-xs text-gray-400 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </details>
            )}

            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            <p className="text-xs text-gray-400">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}