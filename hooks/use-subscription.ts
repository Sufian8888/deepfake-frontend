'use client'

import * as React from 'react'
import { getSubscriptionInfo, isProOrAbovePlan } from '@/lib/subscription'

type PlanKey = 'free' | 'pro' | 'enterprise'
type SubscriptionInfo = {
  plan: PlanKey
  status: string
  cycle: string
  isPremium: boolean
}

export function useSubscription() {
  const [info, setInfo] = React.useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const p = await getSubscriptionInfo()
        if (!mounted) return
        setInfo(p)
      } catch (err) {
        if (!mounted) return
        setInfo({ plan: 'free', status: 'inactive', cycle: 'monthly', isPremium: false })
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }

    load()

    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent<SubscriptionInfo>
      if (!customEvent.detail || !mounted) return
      setInfo(customEvent.detail)
      setIsLoading(false)
    }

    window.addEventListener('subscription:changed', handleChange)

    return () => {
      mounted = false
      window.removeEventListener('subscription:changed', handleChange)
    }
  }, [])

  const plan = info?.plan ?? null
  const isProOrAbove = React.useMemo(() => isProOrAbovePlan(plan), [plan])

  return {
    plan,
    status: info?.status ?? 'inactive',
    cycle: info?.cycle ?? 'monthly',
    isPremium: info?.isPremium ?? false,
    isLoading,
    isProOrAbove,
  }
}
