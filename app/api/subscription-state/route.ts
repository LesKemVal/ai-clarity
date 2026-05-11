import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSubscriberByEmail } from '@/lib/subscriptions/subscriber-store'

const storePath = path.join(process.cwd(), 'data', 'subscription-state.json')

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const subscriber = getSubscriberByEmail(email)

  if (subscriber) {
    return NextResponse.json({
      currentTier: subscriber.currentTier,
      email: subscriber.email,
      lastCheckoutSessionId: subscriber.lastCheckoutSessionId,
      lastSubscriptionId: subscriber.lastSubscriptionId,
      lastCustomerId: subscriber.stripeCustomerId,
    })
  }

  try {
    const raw = fs.readFileSync(storePath, 'utf8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({
      currentTier: 'smart',
      email: email || null,
      lastCheckoutSessionId: null,
      lastSubscriptionId: null,
      lastCustomerId: null,
    })
  }
}
