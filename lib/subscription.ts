import { authAPI, billingAPI } from '@/lib/api'

type PlanKey = 'free' | 'pro' | 'enterprise'
type SubscriptionInfo = {
  plan: PlanKey
  status: string
  cycle: string
  isPremium: boolean
}

// Simple in-memory cache and in-flight dedupe for subscription info
let cache: { info?: SubscriptionInfo; expiresAt?: number } = {}
let inflight: Promise<SubscriptionInfo> | null = null

const CACHE_TTL_MS = 10_000 // short cache to reduce flicker without staying stale too long
const SUBSCRIPTION_CHANGED_EVENT = 'subscription:changed'

function buildSubscriptionInfo(plan: PlanKey, status = 'inactive', cycle = 'monthly', isPremium?: boolean): SubscriptionInfo {
  return {
    plan,
    status,
    cycle,
    isPremium: isPremium ?? (plan === 'pro' || plan === 'enterprise'),
  }
}

function readLocalSubscription(): SubscriptionInfo | null {
  try {
    const user = authAPI.getCurrentUser()
    if (!user?.subscription_plan) {
      return null
    }

    return buildSubscriptionInfo(
      user.subscription_plan,
      user.subscription_status ?? 'inactive',
      user.subscription_cycle ?? 'monthly',
      user.is_premium,
    )
  } catch {
    return null
  }
}

function syncLocalUserSubscription(info: SubscriptionInfo) {
  if (typeof window === 'undefined') return

  try {
    const user = authAPI.getCurrentUser()
    if (!user) return

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        subscription_plan: info.plan,
        subscription_status: info.status,
        subscription_cycle: info.cycle,
        is_premium: info.isPremium,
      })
    )
    window.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGED_EVENT, { detail: info }))
  } catch {
    // ignore localStorage parsing errors and fall back to network refresh later
  }
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  const now = Date.now()
  if (cache.info && cache.expiresAt && now < cache.expiresAt) {
    return cache.info
  }

  const localInfo = readLocalSubscription()
  if (localInfo) {
    cache = { info: localInfo, expiresAt: now + CACHE_TTL_MS }
    return localInfo
  }

  if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
    const info = buildSubscriptionInfo('free')
    cache = { info, expiresAt: Date.now() + CACHE_TTL_MS }
    return info
  }

  if (inflight) return inflight

  inflight = (async () => {
    try {
      const res = await billingAPI.getMe()
      const info = buildSubscriptionInfo(
        (res && res.subscription_plan) || 'free',
        res?.subscription_status || 'inactive',
        res?.subscription_cycle || 'monthly',
        res?.is_premium,
      )
      cache = { info, expiresAt: Date.now() + CACHE_TTL_MS }
      syncLocalUserSubscription(info)
      return info
    } catch (err) {
      const info = buildSubscriptionInfo('free')
      cache = { info, expiresAt: Date.now() + CACHE_TTL_MS }
      return info
    } finally {
      inflight = null
    }
  })()

  return inflight
}

export async function getSubscription(): Promise<PlanKey> {
  const info = await getSubscriptionInfo()
  return info.plan
}

export function isProOrAbovePlan(plan: PlanKey | null | undefined) {
  return plan === 'pro' || plan === 'enterprise'
}

export function invalidateSubscriptionCache() {
  cache = {}
}

export function syncSubscriptionInfo(info: SubscriptionInfo) {
  cache = { info, expiresAt: Date.now() + CACHE_TTL_MS }
  syncLocalUserSubscription(info)
}
