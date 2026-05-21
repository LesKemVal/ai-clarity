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

function getActivationReturnUrl(appUrl: string, tier: PlanTier) {
  const params = new URLSearchParams({
    payment: 'success',
    tier,
    source: 'payment_element',
  })

  return `${appUrl}/top-up?${params.toString()}`
}

function extractPaymentIntentClientSecret(subscription: Stripe.Subscription) {
  const invoice = subscription.latest_invoice

  if (!invoice || typeof invoice === 'string') return null

  const paymentIntent = invoice.payment_intent

  if (!paymentIntent || typeof paymentIntent === 'string') return null

  return paymentIntent.client_secret
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

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' },
        { status: 500 }
      )
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

    const customer = await stripe.customers.create({
      ...(validEmail ? { email } : {}),
      metadata: {
        source: 'george_payment_element',
        tier,
        ...(validEmail ? { email } : {}),
      },
    })

    if (tier === 'brilliant_day') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500,
        currency: 'usd',
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        metadata: {
          tier,
          source: 'george_payment_element',
          ...(validEmail ? { email } : {}),
        },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        mode: 'payment',
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        returnUrl: getActivationReturnUrl(appUrl, tier),
        customerId: customer.id,
      })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        tier,
        source: 'george_payment_element',
        ...(validEmail ? { email } : {}),
      },
      ...(tier === 'intelligent' ? { trial_period_days: 30 } : {}),
      expand: ['latest_invoice.payment_intent'],
    })

    const clientSecret = extractPaymentIntentClientSecret(subscription)

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Unable to prepare the payment form.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret,
      mode: 'subscription',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      returnUrl: getActivationReturnUrl(appUrl, tier),
      customerId: customer.id,
      subscriptionId: subscription.id,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to prepare payment form.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
