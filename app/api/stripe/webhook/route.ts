import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

const intelligentPriceId = process.env.STRIPE_INTELLIGENT_PRICE_ID
const brilliantPriceId = process.env.STRIPE_BRILLIANT_PRICE_ID

const storePath = path.join(process.cwd(), 'data', 'subscription-state.json')

function writeStore(payload: {
  currentTier: 'smart' | 'intelligent' | 'brilliant'
  lastCheckoutSessionId: string | null
  lastSubscriptionId: string | null
  lastCustomerId: string | null
}) {
  fs.writeFileSync(storePath, JSON.stringify(payload, null, 2))
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8'))
  } catch {
    return {
      currentTier: 'smart',
      lastCheckoutSessionId: null,
      lastSubscriptionId: null,
      lastCustomerId: null,
    }
  }
}

function getTierFromPriceIds(priceIds: string[]): 'smart' | 'intelligent' | 'brilliant' | null {
  if (brilliantPriceId && priceIds.includes(brilliantPriceId)) return 'brilliant'
  if (intelligentPriceId && priceIds.includes(intelligentPriceId)) return 'intelligent'
  return null
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY.' }, { status: 500 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET.' }, { status: 500 })
  }

  try {
    const body = await req.text()

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log('stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const existing = readStore()

        writeStore({
          currentTier:
            session.metadata?.tier === 'brilliant'
              ? 'brilliant'
              : session.metadata?.tier === 'intelligent'
              ? 'intelligent'
              : existing.currentTier,
          lastCheckoutSessionId: session.id,
          lastSubscriptionId:
            typeof session.subscription === 'string'
              ? session.subscription
              : existing.lastSubscriptionId,
          lastCustomerId:
            typeof session.customer === 'string'
              ? session.customer
              : existing.lastCustomerId,
        })

        console.log('checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          tier: session.metadata?.tier ?? null,
        })
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const priceIds = subscription.items.data.map((item) => item.price.id)
        const activeStatuses = ['active', 'trialing', 'past_due']

        const existing = readStore()
        const mappedTier = getTierFromPriceIds(priceIds)

        writeStore({
          currentTier: activeStatuses.includes(subscription.status)
            ? (mappedTier ?? existing.currentTier)
            : 'smart',
          lastCheckoutSessionId: existing.lastCheckoutSessionId,
          lastSubscriptionId: subscription.id,
          lastCustomerId:
            typeof subscription.customer === 'string'
              ? subscription.customer
              : existing.lastCustomerId,
        })

        console.log(event.type, {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          priceIds,
        })
        break
      }

      default:
        console.log('unhandled stripe event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Webhook handler failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
