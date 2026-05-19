import { NextRequest, NextResponse } from 'next/server'

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
  const body = await req.json().catch(() => ({}))
  const code = String(body?.code || '').trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: 'Founder code required.' }, { status: 400 })
  }

  const codes = parseFounderCodes()
  const tier = codes[code]

  if (!tier) {
    return NextResponse.json({ error: 'Invalid founder code.' }, { status: 403 })
  }

  return NextResponse.json({
    ok: true,
    tier,
  })
}
