import fs from 'fs'
import path from 'path'

export type SubscriberTier = 'smart' | 'intelligent' | 'brilliant'

export type SubscriberRecord = {
  email: string
  currentTier: SubscriberTier
  stripeCustomerId: string | null
  lastCheckoutSessionId: string | null
  lastSubscriptionId: string | null
  updatedAt: string
}

type SubscriberStore = {
  subscribers: Record<string, SubscriberRecord>
  customers: Record<string, string>
}

const storePath = path.join(process.cwd(), 'data', 'subscribers.json')

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase()
}

function defaultStore(): SubscriberStore {
  return {
    subscribers: {},
    customers: {},
  }
}

function readStore(): SubscriberStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8'))
    return {
      subscribers: parsed?.subscribers || {},
      customers: parsed?.customers || {},
    }
  } catch {
    return defaultStore()
  }
}

function writeStore(store: SubscriberStore) {
  if (process.env.VERCEL === '1') {
    return
  }

  fs.mkdirSync(path.dirname(storePath), { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2))
}

export function getSubscriberByEmail(email: unknown): SubscriberRecord | null {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return null

  const store = readStore()
  return store.subscribers[cleanEmail] || null
}

export function getSubscriberByCustomerId(customerId: unknown): SubscriberRecord | null {
  const cleanCustomerId = String(customerId || '').trim()
  if (!cleanCustomerId) return null

  const store = readStore()
  const email = store.customers[cleanCustomerId]
  if (!email) return null

  return store.subscribers[email] || null
}

export function upsertSubscriber(input: {
  email?: unknown
  currentTier?: SubscriberTier
  stripeCustomerId?: unknown
  lastCheckoutSessionId?: unknown
  lastSubscriptionId?: unknown
}) {
  const store = readStore()

  const emailFromInput = normalizeEmail(input.email)
  const customerId = String(input.stripeCustomerId || '').trim()
  const emailFromCustomer = customerId ? store.customers[customerId] : ''
  const email = emailFromInput || emailFromCustomer

  if (!email) return null

  const previous = store.subscribers[email]

  const next: SubscriberRecord = {
    email,
    currentTier: input.currentTier || previous?.currentTier || 'smart',
    stripeCustomerId: customerId || previous?.stripeCustomerId || null,
    lastCheckoutSessionId: String(input.lastCheckoutSessionId || previous?.lastCheckoutSessionId || '') || null,
    lastSubscriptionId: String(input.lastSubscriptionId || previous?.lastSubscriptionId || '') || null,
    updatedAt: new Date().toISOString(),
  }

  store.subscribers[email] = next

  if (next.stripeCustomerId) {
    store.customers[next.stripeCustomerId] = email
  }

  writeStore(store)

  return next
}
