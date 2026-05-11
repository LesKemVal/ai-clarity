import { NextRequest, NextResponse } from 'next/server'
import { createContinuityToken } from '@/lib/continuity/token-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = createContinuityToken(body?.email)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
    const continuityUrl = `${appUrl}/george?continuity=${encodeURIComponent(result.token)}`

    return NextResponse.json({
      ok: true,
      email: result.email,
      expiresAt: result.expiresAt,
      continuityUrl,
      devNotice: 'Email transport is not connected yet. Use continuityUrl for local testing.',
    })
  } catch {
    return NextResponse.json({ error: 'Unable to create continuity link.' }, { status: 500 })
  }
}
