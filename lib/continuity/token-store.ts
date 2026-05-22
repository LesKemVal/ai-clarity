import crypto from 'crypto'
import { getRedis } from '@/lib/storage/redis'
import { getSubscriberByEmail } from '@/lib/subscriptions/subscriber-store'

const TOKEN_TTL_SECONDS = 15 * 60

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function tokenKey(tokenHash: string) {
  return `george:continuity:${tokenHash}`
}

export async function createContinuityToken(emailInput: unknown) {
  const email = String(emailInput || '').trim().toLowerCase()

  if (!email) {
    return { error: 'Enter an email address.' }
  }

  const subscriber = await getSubscriberByEmail(email)

  if (!subscriber) {
    return { error: 'No subscriber continuity was found for that email.' }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)

  const redis = getRedis()

  const expiresAt = Date.now() + TOKEN_TTL_SECONDS * 1000

  await redis.set(
    tokenKey(tokenHash),
    JSON.stringify({
      email,
      used: false,
      expiresAt,
    }),
    {
      EX: TOKEN_TTL_SECONDS,
    }
  )

  return {
    token,
    email,
    expiresAt,
  }
}

export async function verifyContinuityToken(tokenInput: unknown) {
  const token = String(tokenInput || '').trim()

  if (!token) {
    return { error: 'Missing continuity token.' }
  }

  const tokenHash = hashToken(token)

  const redis = getRedis()

  const raw = await redis.get(tokenKey(tokenHash))

  if (!raw) {
    return { error: 'Continuity link is invalid or expired.' }
  }

  const record = JSON.parse(raw as string)

  if (record.used) {
    return { error: 'Continuity link has already been used.' }
  }

  if (record.expiresAt < Date.now()) {
    return { error: 'Continuity link has expired.' }
  }

  const subscriber = await getSubscriberByEmail(record.email)

  if (!subscriber) {
    return { error: 'Subscriber continuity was not found.' }
  }

  record.used = true

  await redis.set(
    tokenKey(tokenHash),
    JSON.stringify(record),
    {
      EX: TOKEN_TTL_SECONDS,
    }
  )

  return {
    email: subscriber.email,
    currentTier: subscriber.currentTier,
    lastCheckoutSessionId: subscriber.lastCheckoutSessionId,
    lastSubscriptionId: subscriber.lastSubscriptionId,
    lastCustomerId: subscriber.stripeCustomerId,
  }
}
