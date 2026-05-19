import { NextRequest, NextResponse } from 'next/server'

const buckets = new Map<string, { count: number; resetAt: number }>()

const rules: Record<string, { limit: number; windowMs: number; label: string }> = {
  '/api/chat': { limit: 40, windowMs: 60_000, label: 'chat' },
  '/api/founder-code': { limit: 8, windowMs: 15 * 60_000, label: 'founder-code' },
  '/api/continuity/request-link': { limit: 6, windowMs: 15 * 60_000, label: 'continuity-request' },
}

function getRequestIdentity(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })

    return true
  }

  if (bucket.count >= limit) return false

  bucket.count += 1
  buckets.set(key, bucket)
  return true
}

export function middleware(req: NextRequest) {
  const rule = rules[req.nextUrl.pathname]

  if (!rule) return NextResponse.next()

  const ip = getRequestIdentity(req)
  const allowed = checkLimit(`${rule.label}:${ip}`, rule.limit, rule.windowMs)

  if (!allowed) {
    console.warn('[GEORGE][rate-limit]', {
      route: req.nextUrl.pathname,
      label: rule.label,
    })

    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/chat',
    '/api/founder-code',
    '/api/continuity/request-link',
  ],
}
