'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import GeorgePaymentElement from '@/components/george/checkout/GeorgePaymentElement'

type CheckoutTier = 'intelligent' | 'brilliant' | 'brilliant_day'

export default function ActivatePage() {
  const [tier, setTier] = useState<CheckoutTier>('brilliant')
  const [intent, setIntent] = useState('')

  const copy = useMemo(() => {
    if (tier === 'intelligent') return 'Activate Intelligent operational support.'
    if (tier === 'brilliant_day') return 'Activate Brilliant for today.'
    return 'Activate Brilliant operational awareness.'
  }, [tier])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const nextTier = params.get('tier')
    const nextIntent = params.get('intent') || ''

    if (nextTier === 'intelligent' || nextTier === 'brilliant' || nextTier === 'brilliant_day') {
      setTier(nextTier)
    }

    setIntent(nextIntent)
  }, [])

  const accessBrief = useMemo(() => {
    if (tier === 'intelligent') {
      return {
        current: 'Smart',
        recommended: 'Intelligent',
        headline: 'Everything in Smart, plus stronger continuity, contextual awareness, expanded LIVE resources, and operational support.',
        resources: ['Stronger continuity', 'Contextual awareness', 'Expanded LIVE resources', 'Operational support'],
        capabilities: ['Carry more context across work', 'Prepare with less drift', 'Work through decisions with stronger continuity', 'Enter LIVE with more support behind the room'],
        liveCapacity: ['Expanded LIVE capacity', 'Better context carry', 'Stronger timing support', 'More useful room preparation'],
      }
    }

    if (tier === 'brilliant_day') {
      return {
        current: 'Smart or Intelligent',
        recommended: 'Brilliant Day',
        headline: 'Temporary Brilliant access for high-pressure moments.',
        resources: ['Day access', 'Brilliant-level LIVE support', 'Contextual carry', 'Operational guidance'],
        capabilities: ['Prepare for one important room', 'Use stronger support without changing monthly access', 'Bring GEORGE into a consequential conversation', 'Move through pressure with more context'],
        liveCapacity: ['Temporary Brilliant LIVE capacity', 'Stronger pressure support', 'More useful response shaping', 'Better room awareness for the day'],
      }
    }

    return {
      current: intent === 'stay-brilliant' ? 'Brilliant' : 'Intelligent',
      recommended: 'Brilliant',
      headline: intent === 'stay-brilliant'
        ? 'Highest access active. Brilliant includes maximum continuity, deep contextual awareness, persistent operational support, and the highest LIVE capacity.'
        : 'Everything in Intelligent, plus deeper continuity, stronger awareness, persistent operational support, and the highest LIVE capacity.',
      resources: ['Maximum continuity', 'Deep contextual awareness', 'Persistent operational support', 'Highest LIVE capacity'],
      capabilities: ['Carry deeper context across projects', 'Use GEORGE as a persistent operational companion', 'Navigate high-pressure work with stronger support', 'Maintain continuity through more complex objectives'],
      liveCapacity: ['Highest LIVE capacity', 'Maximum room awareness', 'Strongest continuity carry', 'Deepest pressure and response support'],
    }
  }, [tier, intent])

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

          <Link href="/help" className="text-[11px] uppercase tracking-[0.22em] text-[#C9D0FF]/48 hover:text-[#D7DCFF]">
            Help
          </Link>
        </div>

        <section className="rounded-[1rem] border border-white/[0.035] bg-white/[0.008] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Access Activation</p>

          <h1 className="mt-4 text-[32px] font-semibold leading-[1.0] tracking-[-0.045em] text-white/92 md:text-[42px]">
            {copy}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/46">
            Activate or restore access to GEORGE. Continuity, LIVE access, and operational support are connected to verified identity.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[0.9rem] border border-white/[0.045] bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">Current</div>
              <div className="mt-2 text-sm text-white/72">{accessBrief.current}</div>
            </div>
            <div className="rounded-[0.9rem] border border-[#AAB4FF]/12 bg-[#AAB4FF]/[0.035] p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#D7DCFF]/40">Recommended</div>
              <div className="mt-2 text-sm text-[#D7DCFF]/84">{accessBrief.recommended}</div>
            </div>
            <div className="rounded-[0.9rem] border border-white/[0.045] bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">Use</div>
              <div className="mt-2 text-sm text-white/72">Resources → capability → LIVE capacity</div>
            </div>
          </div>

          <div className="mt-5 rounded-[1rem] border border-white/[0.045] bg-black/18 p-4">
            <p className="text-sm font-medium text-white/82">{accessBrief.headline}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['Resources', accessBrief.resources],
                ['What You Can Do', accessBrief.capabilities],
                ['LIVE Capacity', accessBrief.liveCapacity],
              ].map(([label, items]) => (
                <div key={String(label)} className="rounded-[0.85rem] border border-white/[0.04] bg-white/[0.012] p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">{String(label)}</div>
                  <div className="mt-3 space-y-2">
                    {(items as string[]).map((item) => (
                      <div key={item} className="flex gap-2 text-[11.5px] leading-5 text-white/48">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#AAB4FF]/52" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
