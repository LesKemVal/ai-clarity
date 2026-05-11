import { NextRequest, NextResponse } from 'next/server'
import { verifyContinuityToken } from '@/lib/continuity/token-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = verifyContinuityToken(body?.token)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch {
    return NextResponse.json({ error: 'Unable to verify continuity link.' }, { status: 500 })
  }
}
