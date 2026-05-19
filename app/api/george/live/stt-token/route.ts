import { NextRequest, NextResponse } from 'next/server'
import { verifyLiveAccessFromRequest } from '@/lib/subscriptions/live-access'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

// Temporary-token route is retained for later production hardening.
export async function GET(req: NextRequest) {
  const rate = checkRateLimit({
    key: `live-stt:${getRequestIdentity(req)}`,
    limit: 30,
    windowMs: 60_000,
  })

  if (!rate.ok) {
    return NextResponse.json({ error: 'LIVE speech access temporarily rate limited.' }, { status: 429 })
  }

  const access = verifyLiveAccessFromRequest(
    req,
    req.nextUrl.searchParams.get('email')
  )

  if (!access.ok) {
    console.warn('[LIVE][stt][auth-failed]', {
      status: access.status,
      reason: access.error,
    })

    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  try {
    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LIVE speech is not fully configured.' },
        { status: 500 }
      )
    }

    const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scopes: ['usage:write'],
        ttl: 60,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')

      console.warn('[LIVE][stt][provider-failed]', {
        status: res.status,
      })

      return NextResponse.json(
        {
          error: 'Failed to create temporary Deepgram token',
          status: res.status,
          detail,
        },
        { status: 500 }
      )
    }

    const data = await res.json()

    return NextResponse.json({
      token: data?.access_token || '',
    })
  } catch {
    return NextResponse.json(
      { error: 'Temporary token generation failed' },
      { status: 500 }
    )
  }
}
