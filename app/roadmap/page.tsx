'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'

const images = ['/hero/world.svg']

export default function RoadmapPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [startingTrial, setStartingTrial] = useState(false)
  const [startingBrilliant, setStartingBrilliant] = useState(false)

  async function startCheckout(tier: 'intelligent' | 'brilliant') {
    try {
      tier === 'intelligent' ? setStartingTrial(true) : setStartingBrilliant(true)

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Unable to continue.')
      }

      window.location.href = data.url
    } catch (error) {
      console.error(error)
      alert('Unable to continue right now.')
      setStartingTrial(false)
      setStartingBrilliant(false)
    }
  }

  function enterSmartGeorge() {
    window.localStorage.setItem('george_active', 'true')
    window.localStorage.setItem('george_entry_mode', 'smart')
    router.push('/george')
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 2800)

    return () => clearInterval(interval)
  }, [])

  return (
    <PageShell title="Roadmap" eyebrow="Direction" backToGeorge withSidebar={false}>
      <div className="max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-neutral-800 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-16 md:py-20">
            <div className="max-w-3xl space-y-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
                Use GEORGE now. Upgrade when weight increases.
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                GEORGE gets more useful as the stakes go up.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
                Smart gets you moving. Intelligent gives GEORGE stronger continuity and better judgment around your life. Brilliant is for people who want more leverage in real rooms.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={enterSmartGeorge}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Use GEORGE now
                </button>

                <button
                  type="button"
                  onClick={() => startCheckout('intelligent')}
                  disabled={startingTrial || startingBrilliant}
                  className="inline-flex items-center justify-center rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {startingTrial ? 'Opening...' : 'Upgrade to Intelligent'}
                </button>

                <button
                  type="button"
                  onClick={() => startCheckout('brilliant')}
                  disabled={startingTrial || startingBrilliant}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {startingBrilliant ? 'Opening...' : 'Go Brilliant'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 md:p-8">
          <div className="max-w-3xl space-y-5">
            <h2 className="text-2xl font-semibold text-white">
              GEORGE works where life actually happens
            </h2>

            <p className="text-sm leading-7 text-neutral-200 md:text-base">
              GEORGE is not here to sound smart. GEORGE is here to help you think clearly, move when it matters, and hold direction when real life gets noisy.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              That can mean preparing for a test, navigating a hard conversation, thinking through a business move, or keeping your footing when pressure distorts judgment.
            </p>

            <p className="text-sm leading-7 text-white md:text-base">
              GEORGE does not stop at information. He is built to stay with the work until it becomes real.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">
                Start here
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Choose the level that fits how you use GEORGE.
              </h2>
              <p className="text-sm leading-7 text-neutral-300 md:text-base">
                Smart is a real entry point. Intelligent is the strongest practical upgrade for most people. Brilliant is where the pressure-room advantage starts to matter.
              </p>

              <p className="text-base font-medium text-white md:text-lg">
                Your potential + GEORGE&apos;s potential = Power.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5 space-y-3">
                <p className="text-sm font-medium text-white">Smart — Free</p>
                <ul className="space-y-1 text-sm leading-6 text-neutral-400">
                  <li>• Clear direction</li>
                  <li>• Immediate next steps</li>
                  <li>• Everyday decision support</li>
                  <li>• Useful without friction</li>
                </ul>
                <p className="pt-2 text-xs text-neutral-500">
                  This is where motion begins.
                </p>
              </div>

              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-5 space-y-3">
                <p className="text-sm font-medium text-white">Intelligent — $9.99</p>
                <ul className="space-y-1 text-sm leading-6 text-neutral-200">
                  <li>• Everything in Smart</li>
                  <li>• Stronger continuity</li>
                  <li>• Better reasoning under pressure</li>
                  <li>• Light voice interaction</li>
                  <li>• More useful over time</li>
                </ul>
                <p className="pt-2 text-xs text-neutral-400">
                  This is where GEORGE becomes more personal and more useful.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5 space-y-3">
                <p className="text-sm font-medium text-white">Brilliant — $25</p>
                <ul className="space-y-1 text-sm leading-6 text-neutral-400">
                  <li>• Everything in Intelligent</li>
                  <li>• Guided Conversation Engine</li>
                  <li>• Sharper live-room handling</li>
                  <li>• Better control in costly moments</li>
                  <li>• Stronger presence when it matters</li>
                </ul>
                <p className="pt-2 text-xs text-neutral-500">
                  Walk in prepared. Stay sharp in the room.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterSmartGeorge}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
              >
                Use GEORGE now
              </button>

              <button
                type="button"
                onClick={() => startCheckout('intelligent')}
                disabled={startingTrial || startingBrilliant}
                className="inline-flex items-center justify-center rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startingTrial ? 'Opening...' : 'Upgrade to Intelligent'}
              </button>

              <button
                type="button"
                onClick={() => startCheckout('brilliant')}
                disabled={startingTrial || startingBrilliant}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startingBrilliant ? 'Opening...' : 'Go Brilliant'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
