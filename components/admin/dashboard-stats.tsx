'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  data: {
    totalApplications: number
    shortlistedCandidates: number
    hiredThisMonth: number
    avgTimeToHire: number
  }
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Applications This Month',
      value: data.totalApplications,
      icon: Users,
      change: '+12%', // This could be calculated from previous month
      changeType: 'positive' as const
    },
    {
      title: 'Shortlisted',
      value: data.shortlistedCandidates,
      icon: UserCheck,
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Hired This Month',
      value: data.hiredThisMonth,
      icon: TrendingUp,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg. Time to Hire',
      value: `${data.avgTimeToHire} days`,
      icon: Calendar,
      change: '-2 days',
      changeType: 'positive' as const
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {' '}from last month
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}