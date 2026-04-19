'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'

const plans = [
  {
    key: 'smart',
    title: 'Smart GEORGE',
    price: 'Free',
    label: 'Start here',
    text: 'Useful now. Clear next moves, steady help, and immediate usefulness without friction.',
    bullets: [
      'Ask GEORGE anything',
      'Clear next moves',
      'Useful daily support',
    ],
    cta: 'Included',
    disabled: true,
  },
  {
    key: 'intelligent',
    title: 'Intelligent GEORGE',
    price: '$9.99',
    label: 'Most people should start here',
    text: 'Sharper daily advantage. Better framing, stronger continuity, and faster progress when things matter.',
    bullets: [
      'Stronger continuity',
      'Smarter framing and signals',
      'Better carry between sessions',
      'More useful day to day',
    ],
    cta: 'Upgrade to Intelligent',
    featured: true,
  },
  {
    key: 'brilliant',
    title: 'Brilliant GEORGE',
    price: '$25',
    label: 'Real-room advantage',
    text: 'Bring GEORGE into pressure moments. Walk in prepared. Stay sharp in the room. Keep leverage.',
    bullets: [
      'Guided Conversation Engine',
      'Doctor visit mode',
      'Dealership mode',
      'Job interview mode',
      'Boss / workplace mode',
      'Relationship talk mode',
    ],
    cta: 'Become Brilliant',
  },
]

export default function TopUpPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function subscribe(tier: 'intelligent' | 'brilliant') {
    try {
      setLoading(tier)
      setMessage('')

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) throw new Error(data?.error || 'Unable to continue.')

      window.location.href = data.url
    } catch (e: any) {
      setMessage(e?.message || 'Unable to continue.')
      setLoading(null)
    }
  }

  return (
    <PageShell backToGeorge withSidebar={false}>
      <div className="space-y-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-4xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
              Bring GEORGE with you
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Choose the level that matches the weight of the moment.
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              GEORGE is not here for entertainment. GEORGE helps you think clearly, move faster,
              and stay composed when decisions matter. Pick the tier that fits how you use him.
            </p>

            <div className="grid gap-3 pt-2 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300">
                Clearer decisions
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300">
                Stronger continuity
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300">
                Better real-world execution
              </div>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm text-white">
                {message}
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-3xl border p-6 ${
                plan.featured
                  ? 'border-[#7C8CFF]/40 bg-[#7C8CFF]/10 shadow-[0_0_30px_rgba(124,140,255,0.12)]'
                  : 'border-neutral-800 bg-neutral-950/60'
              }`}
            >
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">
                  {plan.label}
                </p>

                <p className="text-lg font-medium text-white">{plan.title}</p>

                <p className="text-3xl font-semibold text-white">{plan.price}</p>

                <p className="text-sm leading-7 text-neutral-300">
                  {plan.text}
                </p>

                <ul className="space-y-2 pt-2 text-sm text-neutral-400">
                  {plan.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#7C8CFF]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={plan.disabled || loading !== null}
                onClick={() =>
                  plan.key === 'intelligent'
                    ? subscribe('intelligent')
                    : plan.key === 'brilliant'
                    ? subscribe('brilliant')
                    : null
                }
                className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  plan.featured
                    ? 'border border-[#7C8CFF]/50 bg-[#7C8CFF] text-black hover:opacity-90'
                    : 'border border-white/10 text-white hover:border-[#7C8CFF]'
                }`}
              >
                {loading === plan.key ? 'Opening...' : plan.cta}
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Why people upgrade
            </h2>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              People lose time, money, leverage, and confidence every day because they walk into
              important moments unprepared. GEORGE helps reduce that.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                Intelligent is for people who use GEORGE often and want a stronger daily edge.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                Brilliant is for people who want GEORGE with them in live rooms where mistakes get expensive.
              </div>
            </div>

            <p className="text-sm leading-7 text-white md:text-base">
              One better decision can pay for this many times over.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
