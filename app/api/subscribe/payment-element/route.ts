import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/subscriptions/subscriber-store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

type PlanTier = 'intelligent' | 'brilliant' | 'brilliant_day'
type ExpandedInvoice = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null
  confirmation_secret?: {
    client_secret?: string | null
  } | null
  payments?: {
    data?: Array<{
      payment?:
        | {
            payment_intent?: string | Stripe.PaymentIntent | null
            type?: string
          }
        | Stripe.PaymentIntent
        | null
    }>
  } | null
}

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

async function extractPaymentIntentClientSecret(subscription: Stripe.Subscription) {
  const invoice = subscription.latest_invoice as ExpandedInvoice | string | null

  if (!invoice) return null

  const expandedInvoice =
    typeof invoice === 'string'
      ? ((await stripe.invoices.retrieve(invoice, {
          expand: ['payment_intent', 'confirmation_secret', 'payments'],
        })) as ExpandedInvoice)
      : invoice

  if (expandedInvoice.confirmation_secret?.client_secret) {
    return expandedInvoice.confirmation_secret.client_secret
  }

  const invoicePayment = expandedInvoice.payments?.data?.[0]?.payment
  const paymentIntentRef =
    expandedInvoice.payment_intent ??
    (invoicePayment && 'payment_intent' in invoicePayment
      ? invoicePayment.payment_intent
      : invoicePayment)

  if (!paymentIntentRef) return null

  if (typeof paymentIntentRef === 'string') {
    const retrievedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentRef)
    return retrievedPaymentIntent.client_secret
  }

  if ('client_secret' in paymentIntentRef) {
    return paymentIntentRef.client_secret
  }

  return null
}

function extractSetupIntentClientSecret(subscription: Stripe.Subscription) {
  const setupIntent = subscription.pending_setup_intent

  if (!setupIntent || typeof setupIntent === 'string') return null

  return setupIntent.client_secret
}

async function getOneTimePriceAmount(priceId: string) {
  const price = await stripe.prices.retrieve(priceId)

  if (!price.unit_amount || !price.currency) {
    throw new Error('Stripe price must include a unit amount and currency.')
  }

  return {
    amount: price.unit_amount,
    currency: price.currency,
  }
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
      const oneTimePrice = await getOneTimePriceAmount(priceId)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: oneTimePrice.amount,
        currency: oneTimePrice.currency,
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        metadata: {
          tier,
          source: 'george_payment_element',
          priceId,
          ...(validEmail ? { email } : {}),
        },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        intentType: 'payment',
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
        priceId,
        ...(validEmail ? { email } : {}),
      },
      ...(tier === 'intelligent' ? { trial_period_days: 30 } : {}),
      expand: ['latest_invoice', 'latest_invoice.payments', 'pending_setup_intent'],
    })

    const paymentClientSecret = await extractPaymentIntentClientSecret(subscription)
    const setupClientSecret = extractSetupIntentClientSecret(subscription)
    const clientSecret = paymentClientSecret ?? setupClientSecret

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Unable to prepare the payment form.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret,
      intentType: paymentClientSecret ? 'payment' : 'setup',
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
