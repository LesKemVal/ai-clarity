import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/subscriptions/subscriber-store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

type VerifiedTier = 'intelligent' | 'brilliant'

const intelligentPriceId = process.env.STRIPE_INTELLIGENT_PRICE_ID
const brilliantPriceId = process.env.STRIPE_BRILLIANT_PRICE_ID

function normalizeTier(tier: unknown): VerifiedTier | null {
  if (tier === 'brilliant' || tier === 'brilliant_day') return 'brilliant'
  if (tier === 'intelligent') return 'intelligent'
  return null
}

function tierFromPriceIds(priceIds: string[]): VerifiedTier | null {
  if (brilliantPriceId && priceIds.includes(brilliantPriceId)) return 'brilliant'
  if (intelligentPriceId && priceIds.includes(intelligentPriceId)) return 'intelligent'
  return null
}

async function resolveTierFromCustomer(customerId: string, fallbackTier: VerifiedTier | null) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  })

  const activeSubscription = subscriptions.data.find((subscription) =>
    ['active', 'trialing', 'past_due', 'incomplete'].includes(subscription.status)
  )

  if (!activeSubscription) return fallbackTier

  const priceIds = activeSubscription.items.data.map((item) => item.price.id)
  return tierFromPriceIds(priceIds) ?? fallbackTier
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY.' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const requestedTier = normalizeTier(body?.tier)
    const paymentIntentId = String(body?.paymentIntentId || '').trim()
    const setupIntentId = String(body?.setupIntentId || '').trim()

    if (!requestedTier) {
      return NextResponse.json({ error: 'Unknown activation tier.' }, { status: 400 })
    }

    if (!paymentIntentId && !setupIntentId) {
      return NextResponse.json({ error: 'Missing Stripe confirmation reference.' }, { status: 400 })
    }

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null
      const verifiedPayment = ['succeeded', 'processing', 'requires_capture'].includes(paymentIntent.status)

      if (!verifiedPayment) {
        return NextResponse.json(
          { verified: false, error: 'Payment has not been confirmed.' },
          { status: 402 }
        )
      }

      const verifiedTier = customerId ? await resolveTierFromCustomer(customerId, requestedTier) : requestedTier

      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId)
        const email = !customer.deleted && 'email' in customer ? customer.email : undefined

        upsertSubscriber({
          email,
          currentTier: verifiedTier ?? requestedTier,
          stripeCustomerId: customerId,
        })
      }

      return NextResponse.json({
        verified: true,
        tier: verifiedTier ?? requestedTier,
        source: 'payment_intent',
      })
    }

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
    const customerId = typeof setupIntent.customer === 'string' ? setupIntent.customer : null

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        { verified: false, error: 'Payment method setup has not been confirmed.' },
        { status: 402 }
      )
    }

    const verifiedTier = customerId ? await resolveTierFromCustomer(customerId, requestedTier) : requestedTier

    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId)
      const email = !customer.deleted && 'email' in customer ? customer.email : undefined

      upsertSubscriber({
        email,
        currentTier: verifiedTier ?? requestedTier,
        stripeCustomerId: customerId,
      })
    }

    return NextResponse.json({
      verified: true,
      tier: verifiedTier ?? requestedTier,
      source: 'setup_intent',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Activation verification failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
