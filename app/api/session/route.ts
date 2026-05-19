import { NextRequest, NextResponse } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'

export async function GET(req: NextRequest) {
  const session = readGeorgeSession(req)

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      tier: 'smart',
      liveAccess: false,
    })
  }

  return NextResponse.json({
    authenticated: true,
    tier: session.tier,
    liveAccess: true,
    source: session.source,
    email: session.source === 'continuity' ? session.email : null,
    expiresAt: session.expiresAt,
  })
}
