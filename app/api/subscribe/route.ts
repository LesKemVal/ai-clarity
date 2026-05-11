import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/subscriptions/subscriber-store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

type PlanTier = 'intelligent' | 'brilliant' | 'brilliant_day'

function getPriceIdForTier(tier: PlanTier) {
  if (tier === 'brilliant_day') return process.env.STRIPE_BRILLIANT_DAY_PRICE_ID
  if (tier === 'brilliant') return process.env.STRIPE_BRILLIANT_PRICE_ID
  return process.env.STRIPE_INTELLIGENT_PRICE_ID
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const tier: PlanTier =
      body?.tier === 'brilliant_day'
        ? 'brilliant_day'
        : body?.tier === 'brilliant'
          ? 'brilliant'
          : 'intelligent'

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const priceId = getPriceIdForTier(tier)
    const email = String(body?.email || '').trim().toLowerCase()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 })
    }

    if (!appUrl) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_APP_URL' }, { status: 500 })
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price ID for tier: ${tier}` },
        { status: 500 }
      )
    }

    if (email && !validEmail) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    if (validEmail) {
      upsertSubscriber({ email, currentTier: 'smart' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: tier === 'brilliant_day' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tier,
        ...(validEmail ? { email } : {}),
      },
      ...(validEmail ? { customer_email: email } : {}),
      ...(tier === 'brilliant_day'
        ? {}
        : {
            subscription_data: {
              metadata: {
                tier,
                ...(validEmail ? { email } : {}),
              },
              ...(tier === 'intelligent' ? { trial_period_days: 30 } : {}),
            },
          }),
      success_url:
        tier === 'brilliant_day'
          ? `${appUrl}/george/live?daily=success&session_id={CHECKOUT_SESSION_ID}`
          : `${appUrl}/george?subscription=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        tier === 'brilliant_day'
          ? `${appUrl}/george/live?daily=cancelled`
          : `${appUrl}/george?subscription=cancelled&tier=${tier}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create checkout session.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
