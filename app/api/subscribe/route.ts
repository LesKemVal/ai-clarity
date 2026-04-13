import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function POST() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const priceId = process.env.STRIPE_CORE_PRICE_ID

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY' },
        { status: 500 }
      )
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_APP_URL' },
        { status: 500 }
      )
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing STRIPE_CORE_PRICE_ID' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/george?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/top-up?subscription=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create checkout session.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
