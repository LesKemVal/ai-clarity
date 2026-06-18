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

  const access = await verifyLiveAccessFromRequest(
    req,
    req.nextUrl.searchParams.get('email')
  )

  const founderBypass =
    process.env.NODE_ENV !== 'production' &&
    Boolean(process.env.FOUNDER_OVERRIDE_CODE || process.env.BRILLIANT_FOUNDER_CODE)

  if (!access.ok && !founderBypass) {
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

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        token: apiKey,
        localDevToken: true,
      })
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

      return NextResponse.json({
        token: apiKey,
        directKeyFallback: true,
        providerStatus: res.status,
      })
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
