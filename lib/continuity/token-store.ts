import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { getSubscriberByEmail } from '@/lib/subscriptions/subscriber-store'

type ContinuityTokenRecord = {
  tokenHash: string
  email: string
  expiresAt: number
  used: boolean
  createdAt: number
}

type ContinuityTokenStore = {
  tokens: ContinuityTokenRecord[]
}

const storePath = path.join(process.cwd(), 'data', 'continuity-tokens.json')
const TOKEN_TTL_MS = 15 * 60 * 1000

function readStore(): ContinuityTokenStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8'))
    return {
      tokens: Array.isArray(parsed?.tokens) ? parsed.tokens : [],
    }
  } catch {
    return { tokens: [] }
  }
}

function writeStore(store: ContinuityTokenStore) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2))
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createContinuityToken(emailInput: unknown) {
  const email = String(emailInput || '').trim().toLowerCase()
  if (!email) return { error: 'Enter an email address.' }

  const subscriber = getSubscriberByEmail(email)
  if (!subscriber) return { error: 'No subscriber continuity was found for that email.' }

  const token = crypto.randomBytes(32).toString('hex')
  const now = Date.now()
  const record: ContinuityTokenRecord = {
    tokenHash: hashToken(token),
    email,
    expiresAt: now + TOKEN_TTL_MS,
    used: false,
    createdAt: now,
  }

  const store = readStore()
  const activeTokens = store.tokens.filter((item) => item.expiresAt > now && !item.used)
  writeStore({ tokens: [record, ...activeTokens].slice(0, 100) })

  return { token, email, expiresAt: record.expiresAt }
}

export function verifyContinuityToken(tokenInput: unknown) {
  const token = String(tokenInput || '').trim()
  if (!token) return { error: 'Missing continuity token.' }

  const now = Date.now()
  const tokenHash = hashToken(token)
  const store = readStore()
  const index = store.tokens.findIndex((item) => item.tokenHash === tokenHash)

  if (index < 0) return { error: 'Continuity link is invalid.' }

  const record = store.tokens[index]
  if (record.used) return { error: 'Continuity link has already been used.' }
  if (record.expiresAt < now) return { error: 'Continuity link has expired.' }

  const subscriber = getSubscriberByEmail(record.email)
  if (!subscriber) return { error: 'Subscriber continuity was not found.' }

  store.tokens[index] = { ...record, used: true }
  writeStore(store)

  return {
    email: subscriber.email,
    currentTier: subscriber.currentTier,
    lastCheckoutSessionId: subscriber.lastCheckoutSessionId,
    lastSubscriptionId: subscriber.lastSubscriptionId,
    lastCustomerId: subscriber.stripeCustomerId,
  }
}
