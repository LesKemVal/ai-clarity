const buckets = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  const bucket = buckets.get(input.key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    })

    return {
      ok: true,
      remaining: input.limit - 1,
      resetAt: now + input.windowMs,
    }
  }

  if (bucket.count >= input.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    }
  }

  bucket.count += 1
  buckets.set(input.key, bucket)

  return {
    ok: true,
    remaining: Math.max(0, input.limit - bucket.count),
    resetAt: bucket.resetAt,
  }
}

export function getRequestIdentity(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
