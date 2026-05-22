import { getRedis } from '@/lib/storage/redis'

export type SubscriberTier = 'smart' | 'intelligent' | 'brilliant'

export type SubscriberRecord = {
  email: string
  currentTier: SubscriberTier
  stripeCustomerId: string | null
  lastCheckoutSessionId: string | null
  lastSubscriptionId: string | null
  updatedAt: string
}

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase()
}

function customerKey(customerId: string) {
  return `george:customer:${customerId}`
}

function subscriberKey(email: string) {
  return `george:subscriber:${email}`
}

export async function getSubscriberByEmail(email: unknown): Promise<SubscriberRecord | null> {
  const cleanEmail = normalizeEmail(email)

  if (!cleanEmail) return null

  const redis = getRedis()
  const raw = await redis.get(subscriberKey(cleanEmail))

  if (!raw) return null

  return JSON.parse(raw as string)
}

export async function getSubscriberByCustomerId(customerId: unknown): Promise<SubscriberRecord | null> {
  const cleanCustomerId = String(customerId || '').trim()

  if (!cleanCustomerId) return null

  const redis = getRedis()

  const email = await redis.get(customerKey(cleanCustomerId))

  if (!email) return null

  return getSubscriberByEmail(String(email))
}

export async function upsertSubscriber(input: {
  email?: unknown
  currentTier?: SubscriberTier
  stripeCustomerId?: unknown
  lastCheckoutSessionId?: unknown
  lastSubscriptionId?: unknown
}) {
  const redis = getRedis()

  const emailFromInput = normalizeEmail(input.email)
  const customerId = String(input.stripeCustomerId || '').trim()

  let email = emailFromInput

  if (!email && customerId) {
    const existing = await redis.get(customerKey(customerId))
    email = String(existing || '')
  }

  if (!email) return null

  const previous = await getSubscriberByEmail(email)

  const next: SubscriberRecord = {
    email,
    currentTier: input.currentTier || previous?.currentTier || 'smart',
    stripeCustomerId: customerId || previous?.stripeCustomerId || null,
    lastCheckoutSessionId:
      String(input.lastCheckoutSessionId || previous?.lastCheckoutSessionId || '') || null,
    lastSubscriptionId:
      String(input.lastSubscriptionId || previous?.lastSubscriptionId || '') || null,
    updatedAt: new Date().toISOString(),
  }

  await redis.set(subscriberKey(email), JSON.stringify(next))

  if (next.stripeCustomerId) {
    await redis.set(customerKey(next.stripeCustomerId), email)
  }

  return next
}
