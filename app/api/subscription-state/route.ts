import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByEmail } from '@/lib/subscriptions/subscriber-store'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json(
      {
        currentTier: 'smart',
        email: null,
        lastCheckoutSessionId: null,
        lastSubscriptionId: null,
        lastCustomerId: null,
      },
      { status: 400 }
    )
  }

  const subscriber = getSubscriberByEmail(email)

  if (!subscriber) {
    return NextResponse.json({
      currentTier: 'smart',
      email,
      lastCheckoutSessionId: null,
      lastSubscriptionId: null,
      lastCustomerId: null,
    })
  }

  return NextResponse.json({
    currentTier: subscriber.currentTier,
    email: subscriber.email,
    lastCheckoutSessionId: subscriber.lastCheckoutSessionId,
    lastSubscriptionId: subscriber.lastSubscriptionId,
    lastCustomerId: subscriber.stripeCustomerId,
  })
}
