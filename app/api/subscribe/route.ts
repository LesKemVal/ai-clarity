import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function POST() {
  try {
    const priceId = process.env.STRIPE_CORE_PRICE_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY' },
        { status: 500 }
      )
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing STRIPE_CORE_PRICE_ID' },
        { status: 500 }
      )
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_APP_URL' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/top-up?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/top-up?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'No checkout URL returned from Stripe.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create subscription session.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
