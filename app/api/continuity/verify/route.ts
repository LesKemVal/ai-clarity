import { NextRequest, NextResponse } from 'next/server'
import { verifyContinuityToken } from '@/lib/continuity/token-store'
import { setGeorgeSessionCookie } from '@/lib/security/george-session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = verifyContinuityToken(body?.token)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const response = NextResponse.json({
      ok: true,
      ...result,
    })

    if (result.currentTier === 'intelligent' || result.currentTier === 'brilliant') {
      setGeorgeSessionCookie(response, {
        email: result.email,
        tier: result.currentTier,
        source: 'continuity',
      })
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Unable to verify continuity link.' }, { status: 500 })
  }
}
