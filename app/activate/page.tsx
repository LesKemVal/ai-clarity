'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import GeorgePaymentElement from '@/components/george/checkout/GeorgePaymentElement'

type CheckoutTier = 'intelligent' | 'brilliant' | 'brilliant_day'

export default function ActivatePage() {
  const [tier, setTier] = useState<CheckoutTier>('brilliant')

  const copy = useMemo(() => {
    if (tier === 'intelligent') return 'Intelligent activation.'
    if (tier === 'brilliant_day') return 'Brilliant Day activation.'
    return 'Brilliant activation.'
  }, [tier])

  function legacyCheckout(nextTier: CheckoutTier) {
    window.location.href = `/top-up?checkout=${nextTier}`
  }

  return (
    <main className="min-h-[100dvh] bg-[#06070A] px-4 py-5 text-white">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/george" className="text-[11px] uppercase tracking-[0.22em] text-white/36 hover:text-white/70">
            GEORGE
          </Link>

          <Link href="/top-up" className="text-[11px] uppercase tracking-[0.22em] text-[#C9D0FF]/48 hover:text-[#D7DCFF]">
            Access
          </Link>
        </div>

        <section className="rounded-[1rem] border border-white/[0.035] bg-white/[0.008] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Runtime Activation</p>

          <h1 className="mt-4 text-[32px] font-semibold leading-[1.0] tracking-[-0.045em] text-white/92 md:text-[42px]">
            {copy}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/46">
            Activate GEORGE with a dark, focused Stripe form built for continuity, LIVE access, and runtime support.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {(['intelligent', 'brilliant', 'brilliant_day'] as CheckoutTier[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTier(item)}
                className={`rounded-[0.75rem] border px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] transition ${
                  tier === item
                    ? 'border-[#AAB4FF]/22 bg-[#AAB4FF]/[0.085] text-[#D7DCFF]'
                    : 'border-white/[0.045] bg-black/20 text-white/42 hover:text-white/72'
                }`}
              >
                {item === 'brilliant_day' ? 'Day Access' : item}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <GeorgePaymentElement
              tier={tier}
              onClose={() => window.location.href = '/george'}
              onLegacyCheckout={legacyCheckout}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
