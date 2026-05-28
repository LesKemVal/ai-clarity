import { NextRequest, NextResponse } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'
import { getSubscriberByEmail } from '@/lib/subscriptions/subscriber-store'

function smartFallback(email: string | null = null) {
  return {
    currentTier: 'smart',
    email,
    lastCheckoutSessionId: null,
    lastSubscriptionId: null,
    lastCustomerId: null,
    authority: 'none',
  }
}

export async function GET(req: NextRequest) {
  const session = await readGeorgeSession(req)

  if (session) {
    return NextResponse.json({
      currentTier: session.tier,
      email: session.source === 'continuity' ? session.email : null,
      lastCheckoutSessionId: null,
      lastSubscriptionId: null,
      lastCustomerId: null,
      authority: 'session',
      source: session.source,
      expiresAt: session.expiresAt,
    })
  }

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase() || ''

  if (!email) {
    return NextResponse.json(smartFallback(null), { status: 400 })
  }

  const subscriber = await getSubscriberByEmail(email)

  if (!subscriber) {
    return NextResponse.json(smartFallback(email))
  }

  return NextResponse.json({
    currentTier: subscriber.currentTier,
    email: subscriber.email,
    lastCheckoutSessionId: subscriber.lastCheckoutSessionId,
    lastSubscriptionId: subscriber.lastSubscriptionId,
    lastCustomerId: subscriber.stripeCustomerId,
    authority: 'email_fallback',
  })
}
