import { NextRequest, NextResponse } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'
import {
  clearServerSessions,
  deleteServerSession,
  readServerSessions,
  upsertServerSession,
} from '@/lib/george/session/server-store'
import type { GeorgeStoredSession } from '@/lib/george/session/store'

function unauthorized() {
  return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  const session = await readGeorgeSession(req)
  if (!session?.email) return unauthorized()

  const sessions = await readServerSessions(session.email)

  return NextResponse.json({
    sessions,
  })
}

export async function POST(req: NextRequest) {
  const userSession = await readGeorgeSession(req)
  if (!userSession?.email) return unauthorized()

  const body = await req.json().catch(() => null)
  const incoming = body?.session as GeorgeStoredSession | undefined

  if (!incoming?.id || !incoming?.mode || !Array.isArray(incoming.messages)) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 400 })
  }

  const saved = await upsertServerSession(userSession.email, incoming)

  return NextResponse.json({
    session: saved,
  })
}

export async function DELETE(req: NextRequest) {
  const userSession = await readGeorgeSession(req)
  if (!userSession?.email) return unauthorized()

  const url = new URL(req.url)
  const sessionId = url.searchParams.get('id')
  const clearAll = url.searchParams.get('all') === '1'

  if (clearAll) {
    await clearServerSessions(userSession.email)
    return NextResponse.json({ ok: true, sessions: [] })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session id.' }, { status: 400 })
  }

  const sessions = await deleteServerSession(userSession.email, sessionId)

  return NextResponse.json({
    ok: true,
    sessions,
  })
}
