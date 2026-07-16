import { NextRequest, NextResponse } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'
import { logOperationalEvent } from '@/lib/security/telemetry'
import { sendGeorgeUserCommunication } from '@/lib/continuity/send-continuity-email'

type GeorgeCommunicationBody = {
  subject?: unknown
  headline?: unknown
  message?: unknown
  actionUrl?: unknown
  actionLabel?: unknown
  operationalReason?: unknown
}

function clean(value: unknown, maxLength: number) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function allowedActionUrl(value: unknown, req: NextRequest) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw, req.nextUrl.origin)
    if (url.origin !== req.nextUrl.origin) return ''
    return url.toString()
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const session = await readGeorgeSession(req)

  if (!session) {
    logOperationalEvent('george_user_communication_denied', { reason: 'missing_session' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEmail =
    session.source === 'continuity'
      ? String(session.email || '').trim().toLowerCase()
      : ''

  if (!userEmail) {
    logOperationalEvent('george_user_communication_denied', {
      reason: 'verified_user_email_unavailable',
      source: session.source,
    })
    return NextResponse.json(
      { error: 'Verified user email unavailable' },
      { status: 409 }
    )
  }

  let body: GeorgeCommunicationBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const subject = clean(body.subject, 140)
  const headline = clean(body.headline, 180)
  const message = clean(body.message, 1600)
  const operationalReason = clean(body.operationalReason, 300)
  const actionLabel = clean(body.actionLabel, 80)
  const actionUrl = allowedActionUrl(body.actionUrl, req)

  if (!subject || !headline || !message || !operationalReason) {
    return NextResponse.json(
      { error: 'Incomplete operational communication' },
      { status: 400 }
    )
  }

  await sendGeorgeUserCommunication({
    email: userEmail,
    subject,
    headline,
    message,
    operationalReason,
    actionUrl: actionUrl || undefined,
    actionLabel: actionLabel || undefined,
  })

  logOperationalEvent('george_user_communication_sent', {
    source: session.source,
    operationalReason,
    hasAction: Boolean(actionUrl),
  })

  return NextResponse.json({ sent: true, recipient: 'authenticated_user' })
}
