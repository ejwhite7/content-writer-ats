'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  TrendingUp
} from 'lucide-react'
import { Application } from '@/types/database'

interface ApplicationStats {
  total: number
  pending: number
  shortlisted: number
  rejected: number
  hired: number
  recentActivity: Application[]
}

export function ApplicationsStats() {
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      const applications = data.applications || []

      // Calculate stats
      const total = applications.length
      const pending = applications.filter(app => 
        ['applied', 'assessment_submitted', 'ai_reviewed', 'manual_review'].includes(app.status)
      ).length
      const shortlisted = applications.filter(app => 
        ['shortlisted', 'paid_assignment', 'live_assignment'].includes(app.status)
      ).length
      const rejected = applications.filter(app => 
        ['rejected', 'terminated'].includes(app.status)
      ).length
      const hired = applications.filter(app => app.status === 'hired').length
      const recentActivity = applications.slice(0, 5)

      setStats({
        total,
        pending,
        shortlisted,
        rejected,
        hired,
        recentActivity,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load application statistics.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total,
      description: 'All submitted applications',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      description: 'Awaiting response',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Shortlisted',
      value: stats.shortlisted,
      description: 'In consideration',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Hired',
      value: stats.hired,
      description: 'Successful applications',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </div>
                  <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Success Rate */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Performance</CardTitle>
            <CardDescription>
              Track your application success rates and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.total > 0 ? Math.round(((stats.shortlisted + stats.hired + stats.rejected) / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${stats.total > 0 ? ((stats.shortlisted + stats.hired + stats.rejected) / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.total > 0 ? Math.round(((stats.shortlisted + stats.hired) / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${stats.total > 0 ? ((stats.shortlisted + stats.hired) / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hire Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${stats.total > 0 ? (stats.hired / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}