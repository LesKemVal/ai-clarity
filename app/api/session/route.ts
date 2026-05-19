import { NextRequest, NextResponse } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'
import { logOperationalEvent } from '@/lib/security/telemetry'

export async function GET(req: NextRequest) {
  const session = readGeorgeSession(req)

  if (!session) {
    logOperationalEvent('session_missing', { liveAccess: false })

    return NextResponse.json({
      authenticated: false,
      tier: 'smart',
      liveAccess: false,
    })
  }

  logOperationalEvent('session_restored', {
    source: session.source,
    tier: session.tier,
    liveAccess: true,
    email: session.source === 'continuity' ? session.email : null,
  })

  return NextResponse.json({
    authenticated: true,
    tier: session.tier,
    liveAccess: true,
    source: session.source,
    email: session.source === 'continuity' ? session.email : null,
    expiresAt: session.expiresAt,
  })
}
