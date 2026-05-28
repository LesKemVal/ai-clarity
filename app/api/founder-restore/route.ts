import { NextRequest, NextResponse } from 'next/server'
import { setGeorgeSessionCookie } from '@/lib/security/george-session'
import { upsertSubscriber } from '@/lib/subscriptions/subscriber-store'

export async function POST(req: NextRequest) {
  const adminSecret = process.env.GEORGE_ADMIN_RESTORE_SECRET
  const body = await req.json().catch(() => ({}))

  if (!adminSecret || body?.secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const email = String(body?.email || '').trim().toLowerCase()
  const tier =
    body?.tier === 'brilliant'
      ? 'brilliant'
      : body?.tier === 'intelligent'
        ? 'intelligent'
        : null

  if (!email || !email.includes('@') || !tier) {
    return NextResponse.json(
      { error: 'Valid email and tier required.' },
      { status: 400 }
    )
  }

  try {
    await upsertSubscriber({
      email,
      currentTier: tier,
    })
  } catch (error) {
    console.error('[GEORGE][founder-restore][subscriber-upsert-failed]', error)
  }

  const response = NextResponse.json({
    ok: true,
    email,
    tier,
  })

  setGeorgeSessionCookie(response, {
    email,
    tier,
    source: 'continuity',
  })

  return response
}
