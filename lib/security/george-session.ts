import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByEmail, type SubscriberTier } from '@/lib/subscriptions/subscriber-store'

export type GeorgeSessionSource = 'continuity' | 'founder'

export type GeorgeSession = {
  email: string
  tier: Exclude<SubscriberTier, 'smart'>
  source: GeorgeSessionSource
  issuedAt: number
  expiresAt: number
}

const COOKIE_NAME = 'george_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000

function getSessionSecret() {
  return (
    process.env.GEORGE_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.OPENAI_API_KEY ||
    ''
  )
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url')
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function sign(payload: string) {
  const secret = getSessionSecret()
  if (!secret) return ''

  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function createGeorgeSessionToken(input: {
  email: string
  tier: Exclude<SubscriberTier, 'smart'>
  source: GeorgeSessionSource
}) {
  const email = input.email.trim().toLowerCase()
  const now = Date.now()

  const payload = base64UrlEncode(JSON.stringify({
    email,
    tier: input.tier,
    source: input.source,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  }))

  const signature = sign(payload)
  if (!signature) return ''

  return `${payload}.${signature}`
}

export function readGeorgeSession(req: NextRequest): GeorgeSession | null {
  const token = req.cookies.get(COOKIE_NAME)?.value || ''
  const [payload, signature] = token.split('.')

  if (!payload || !signature) return null

  const expected = sign(payload)
  if (!expected || !safeEqual(signature, expected)) return null

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<GeorgeSession>

    if (!parsed.email || !parsed.tier || !parsed.expiresAt || !parsed.source) return null
    if (parsed.expiresAt < Date.now()) return null
    if (parsed.tier !== 'intelligent' && parsed.tier !== 'brilliant') return null
    if (parsed.source !== 'continuity' && parsed.source !== 'founder') return null

    if (parsed.source === 'continuity') {
      const subscriber = getSubscriberByEmail(parsed.email)
      if (!subscriber) return null
      if (subscriber.currentTier !== parsed.tier) return null
    }

    return {
      email: parsed.email,
      tier: parsed.tier,
      source: parsed.source,
      issuedAt: Number(parsed.issuedAt || 0),
      expiresAt: parsed.expiresAt,
    }
  } catch {
    return null
  }
}

export function setGeorgeSessionCookie(
  response: NextResponse,
  input: {
    email: string
    tier: Exclude<SubscriberTier, 'smart'>
    source: GeorgeSessionSource
  }
) {
  const token = createGeorgeSessionToken(input)
  if (!token) return response

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })

  return response
}

export function clearGeorgeSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
