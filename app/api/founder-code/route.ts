import { NextRequest, NextResponse } from 'next/server'
import { setGeorgeSessionCookie } from '@/lib/security/george-session'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

type Tier = 'intelligent' | 'brilliant'

function parseFounderCodes() {
  const raw = process.env.GEORGE_FOUNDER_CODES || ''

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, Tier>>((acc, entry) => {
      const [code, tier] = entry.split(':').map((part) => part.trim().toUpperCase())

      if (!code) return acc
      if (tier === 'BRILLIANT') acc[code] = 'brilliant'
      if (tier === 'INTELLIGENT') acc[code] = 'intelligent'

      return acc
    }, {})
}

export async function POST(req: NextRequest) {
  const rate = checkRateLimit({
    key: `founder-code:${getRequestIdentity(req)}`,
    limit: 8,
    windowMs: 15 * 60_000,
  })

  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many founder code attempts. Try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const code = String(body?.code || '').trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: 'Founder code required.' }, { status: 400 })
  }

  const codes = parseFounderCodes()
  const tier = codes[code]

  if (!tier) {
    console.warn('[GEORGE][founder-code][invalid]', {
      ip: getRequestIdentity(req),
    })

    return NextResponse.json({ error: 'Invalid founder code.' }, { status: 403 })
  }

  const response = NextResponse.json({
    ok: true,
    tier,
  })

  // Founder sessions intentionally avoid exposing subscriber records.
  setGeorgeSessionCookie(response, {
    email: `founder:${code.toLowerCase()}`,
    tier,
    source: 'founder',
  })

  return response
}
