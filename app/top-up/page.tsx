'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'

const tiers = [
  {
    amount: 10,
    label: 'Quick reset',
    description: 'A light continuation. Good for short sessions and immediate follow-through.',
    featured: false,
  },
  {
    amount: 25,
    label: 'Core continuation',
    description: 'The standard top-up. Best for staying in motion across active goals.',
    featured: true,
  },
  {
    amount: 50,
    label: 'Deep work',
    description: 'More room to think, recalibrate, and keep momentum when the work gets heavier.',
    featured: false,
  },
]

export default function TopUpPage() {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null)
  const [message, setMessage] = useState<string>('')

  async function startCheckout(amount: number) {
    try {
      setMessage('')
      setLoadingAmount(amount)

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to start checkout.')
      }

      if (!data?.url) {
        throw new Error('Missing checkout URL.')
      }

      window.location.href = data.url
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Unable to start checkout.'
      setMessage(text)
      setLoadingAmount(null)
    }
  }

  return (
    <PageShell
      title="Top-Up"
      eyebrow="Continue"
      backToGeorge
      withSidebar={false}
    >
      <div className="space-y-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-base leading-7 text-neutral-300">
              Keep going without breaking stride.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Top-Up keeps the work moving. Use it when you need more room to think,
              decide, write, build, or push a goal forward without losing continuity.
            </p>

            {message ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {message}
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.amount}
              className={`rounded-3xl border p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur transition ${
                tier.featured
                  ? 'border-[#7C8CFF]/30 bg-[#7C8CFF]/8'
                  : 'border-neutral-800 bg-neutral-950/60'
              }`}
            >
              <div className="flex min-h-[220px] flex-col">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                    {tier.label}
                  </p>

                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    ${tier.amount}
                  </h2>

                  <p className="text-sm leading-7 text-neutral-400">
                    {tier.description}
                  </p>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => startCheckout(tier.amount)}
                    disabled={loadingAmount !== null}
                    className={`w-full rounded-full px-5 py-3 text-sm font-medium transition button-press disabled:cursor-not-allowed disabled:opacity-60 ${
                      tier.featured
                        ? 'bg-[#7C8CFF] text-black hover:opacity-90'
                        : 'border border-neutral-700 text-neutral-200 hover:border-[#7C8CFF] hover:text-[#7C8CFF]'
                    }`}
                  >
                    {loadingAmount === tier.amount
                      ? 'Opening checkout...'
                      : `Choose $${tier.amount}`}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-white">Continuation</p>
              <p className="mt-2 text-sm leading-7 text-neutral-400">
                Pick up where you left off without dropping context.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">Momentum</p>
              <p className="mt-2 text-sm leading-7 text-neutral-400">
                Keep the main objective moving while secondary tracks stay organized.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">Clarity under pressure</p>
              <p className="mt-2 text-sm leading-7 text-neutral-400">
                Use more capacity when the route changes, the stakes rise, or the work gets heavier.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
