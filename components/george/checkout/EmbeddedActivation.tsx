'use client'

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useMemo } from 'react'

type EmbeddedActivationProps = {
  clientSecret: string
  tierLabel: string
  onCancel: () => void
  onFallback: () => void
}

export default function EmbeddedActivation({
  clientSecret,
  tierLabel,
  onCancel,
  onFallback,
}: EmbeddedActivationProps) {
  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!key) return null

    return loadStripe(key)
  }, [])

  if (!stripePromise) {
    return (
      <div className="rounded-[1rem] border border-white/[0.045] bg-black/24 p-4">
        <p className="text-sm font-medium text-white/84">Secure activation unavailable.</p>
        <p className="mt-2 text-sm leading-6 text-white/44">
          Use the fallback checkout while Stripe activation is being configured.
        </p>
        <button
          type="button"
          onClick={onFallback}
          className="mt-4 w-full rounded-[0.75rem] border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/[0.045]"
        >
          Open secure checkout
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[720px] rounded-[1.15rem] border border-white/[0.06] bg-[#07090F]/94 p-3 shadow-[0_18px_54px_rgba(0,0,0,0.42)] md:p-4">
      <div className="mb-3 flex items-start justify-between gap-3 px-1 md:mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#C9D0FF]/52">
            Secure activation
          </p>
          <p className="mt-2 text-base font-semibold text-white/88">
            {tierLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-white/44">
            Activate inside GEORGE. Stripe handles payment security.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/50 transition hover:text-white/78"
        >
          Close
        </button>
      </div>

      <div className="max-h-[74vh] overflow-y-auto overflow-x-hidden rounded-[0.95rem] bg-white md:max-h-[78vh]">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}
