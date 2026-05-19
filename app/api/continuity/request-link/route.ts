import { NextRequest, NextResponse } from 'next/server'
import { createContinuityToken } from '@/lib/continuity/token-store'
import { sendContinuityEmail } from '@/lib/continuity/send-continuity-email'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit({
      key: `continuity-request:${getRequestIdentity(req)}`,
      limit: 6,
      windowMs: 15 * 60_000,
    })

    if (!rate.ok) {
      return NextResponse.json({ error: 'Too many continuity requests. Try again later.' }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    const result = createContinuityToken(body?.email)

    if ('error' in result) {
      console.warn('[GEORGE][continuity][request-failed]', {
        ip: getRequestIdentity(req),
      })

      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
    const continuityUrl = `${appUrl}/george?continuity=${encodeURIComponent(result.token)}`

    await sendContinuityEmail({
      email: result.email,
      continuityUrl,
    })

    console.info('[GEORGE][continuity][requested]', {
      email: result.email,
    })

    return NextResponse.json({
      ok: true,
      email: result.email,
      expiresAt: result.expiresAt,
    })
  } catch {
    return NextResponse.json({ error: 'Unable to create continuity link.' }, { status: 500 })
  }
}
