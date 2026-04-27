'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UserStats {
  total_videos: number
  total_predictions: number
  deepfakes_found: number
  genuine_videos: number
  pending_analyses: number
  success_rate?: number
}

export function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Videos',
      value: stats.total_videos,
      icon: Video,
      description: 'Uploaded videos',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Analyses Complete',
      value: stats.total_predictions,
      icon: Shield,
      description: 'Videos analyzed',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Genuine Videos',
      value: stats.genuine_videos,
      icon: CheckCircle,
      description: 'Authentic content',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Deepfakes Found',
      value: stats.deepfakes_found,
      icon: AlertTriangle,
      description: 'AI-generated content',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="glass border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
