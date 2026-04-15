'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'

const images = ["/hero/world.svg"]

const pillars = [
  {
    title: 'Clarity under pressure',
    text: 'GEORGE is being built to help people see the real move when confusion, delay, and pressure start distorting judgment.',
  },
  {
    title: 'Direction that holds',
    text: 'Not just one good answer. A usable direction that can survive changing conditions, missing information, and real-life friction.',
  },
  {
    title: 'Execution over drift',
    text: 'The point is not conversation. The point is movement, follow-through, and finishing what actually matters.',
  },
]

const roadmapItems = [
  'Stronger continuity across sessions',
  'Better multi-goal support with a clear primary track',
  'Sharper rerouting when the plan changes',
  'Faster responses that still preserve judgment',
  'Voice where it improves speed, not where it adds noise',
  'A more useful operating presence in daily life',
]

export default function RoadmapPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [startingTrial, setStartingTrial] = useState(false)

  async function startIntelligentTrial() {
    try {
      setStartingTrial(true)
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: 'intelligent' }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Unable to start trial.')
      }

      window.location.href = data.url
    } catch (error) {
      console.error(error)
      alert('Unable to start Intelligent trial right now.')
      setStartingTrial(false)
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
                Free tier available
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Whatever you want to do, be, or go — GEORGE is your ride.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
                Be clear. Decide faster. Execute.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={enterSmartGeorge}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Enter Smart GEORGE
                </button>

                <button
                  type="button"
                  onClick={startIntelligentTrial}
                  disabled={startingTrial}
                  className="inline-flex items-center justify-center rounded-full border border-[#7C8CFF]/40 bg-[#7C8CFF]/10 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {startingTrial ? 'Starting trial...' : 'Start 30-day Intelligent trial'}
                </button>

                <a
                  href="/help"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
                >
                  See how GEORGE works
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 md:p-8">
          <div className="max-w-3xl space-y-5">
            <h2 className="text-2xl font-semibold text-white">
              What GEORGE actually does
            </h2>

            <p className="text-neutral-200 text-sm md:text-base leading-7">
              GEORGE is not theoretical.
            </p>

            <p className="text-neutral-300 text-sm md:text-base leading-7">
              GEORGE works with you—step by step—from wherever you are right now to where you intend to go.
            </p>

            <p className="text-white">
              GEORGE can help you—even show you—how to do what you want, become who you want, and go where you want to go.
            </p>

            <p className="text-neutral-300 text-sm md:text-base leading-7">
              This includes preparing for certifications, licenses, and tests, building and running a business, or navigating real-life decisions that carry weight.
            </p>

            <p className="text-neutral-300 text-sm md:text-base leading-7">
              GEORGE does not stop at information. He stays with the work until it becomes real.
            </p>

            <p className="text-white">
              Everything he can do without having hands and feet, GEORGE will take care of.
            </p>

            <p className="text-neutral-400 text-sm md:text-base leading-7">
              There are more paths, opportunities, and outcomes available than can be listed here. GEORGE is built to help you find them, understand them, and move through them.
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
                Choose how you want to enter GEORGE.
              </h2>
              <p className="text-sm leading-7 text-neutral-300 md:text-base">
                Smart is available free, forever. Intelligent begins with a 30-day free trial and requires a card up front. Brilliant is for heavier demands, deeper work, and stronger support under pressure.
              </p>

              <p className="text-base font-medium text-white md:text-lg">
                Your potential + GEORGE&apos;s potential = Power.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5">
                <p className="text-sm font-medium text-white">Smart</p>
                <p className="mt-3 text-sm leading-7 text-neutral-400">
                  Free forever. A minimal GEORGE—available at all times for clear direction and useful movement.
                </p>
              </div>

              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-5">
                <p className="text-sm font-medium text-white">Intelligent</p>
                <p className="mt-3 text-sm leading-7 text-neutral-200">
                  30 days free with card required. Stronger continuity, better structure, and more carrying power from the start.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5">
                <p className="text-sm font-medium text-white">Brilliant</p>
                <p className="mt-3 text-sm leading-7 text-neutral-400">
                  Premium GEORGE for heavier goals, deeper work, sharper thinking, and more moving parts at once.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterSmartGeorge}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
              >
                Enter Smart GEORGE
              </button>

              <button
                type="button"
                onClick={startIntelligentTrial}
                disabled={startingTrial}
                className="inline-flex items-center justify-center rounded-full border border-[#7C8CFF]/40 bg-[#7C8CFF]/10 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startingTrial ? 'Starting trial...' : 'Start 30-day Intelligent trial'}
              </button>

              <a
                href="/help"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
              >
                See how GEORGE works
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              What this roadmap is really about
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-white">
              This is being built for when things are unclear—and still matter.
            </h2>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Most tools work when conditions are clean. GEORGE is being built for when they are not.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Pressure, uncertainty, incomplete information—this is where decisions break down.
            </p>

            <p className="text-white">
              The goal is to help you see clearly, choose direction, and keep moving anyway.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-neutral-400">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              How GEORGE scales with you
            </h2>

            <p className="text-neutral-300">
              GEORGE operates with different levels of carry, depending on how you enter.
            </p>

            <p className="text-neutral-400">
              This is not about access to information. It’s about how far GEORGE can go with you.
            </p>

            <div className="space-y-4 text-sm md:text-base">
              <p className="text-white font-medium">Cognitive Depth — how far GEORGE can think</p>
              <p className="text-neutral-400">Smart: Direct answers and short chains</p>
              <p className="text-neutral-300">Intelligent: Structured, multi-step thinking</p>
              <p className="text-neutral-200">Brilliant: Deep, layered reasoning across multiple tracks</p>

              <p className="mt-4 text-white font-medium">Continuity — how much GEORGE can hold</p>
              <p className="text-neutral-400">Smart: Minimal carry, short-lived context</p>
              <p className="text-neutral-300">Intelligent: Sustained direction across a thread</p>
              <p className="text-neutral-200">Brilliant: Multi-threaded, long-range continuity</p>

              <p className="mt-4 text-white font-medium">Execution — how far GEORGE stays with the work</p>
              <p className="text-neutral-400">Smart: Points you in the right direction</p>
              <p className="text-neutral-300">Intelligent: Walks you through steps</p>
              <p className="text-neutral-200">Brilliant: Stays with you through execution</p>

              <p className="mt-4 text-white font-medium">Access — what GEORGE is allowed to carry</p>
              <p className="text-neutral-400">
                Some work requires more than a single response. Not because it is impossible—but because it requires a level of support that must be unlocked.
              </p>
            </div>

            <p className="text-white">
              The difference is not information. The difference is how far GEORGE can go with you.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/40 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                What’s coming
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                The next improvements are practical.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {roadmapItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-800 bg-black/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                >
                  <p className="text-sm leading-7 text-neutral-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                What this could become in your hands
              </h2>

              <p className="text-sm leading-7 text-neutral-200 md:text-base">
                This is where things start to get real.
              </p>

              <p className="text-sm leading-7 text-neutral-300 md:text-base">
                What if you had something that could help you identify the real goal, structure the path, reduce confusion, and stay with the work long enough for the result to become real?
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-medium text-white">What if you stopped drifting?</p>
                <p className="mt-3 text-sm leading-7 text-neutral-300">
                  What if your thoughts got cleaner, your next move got clearer, and wasted motion started falling off?
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-medium text-white">What if your goals became workable?</p>
                <p className="mt-3 text-sm leading-7 text-neutral-300">
                  What if GEORGE helped you break ambition into steps you could actually move through—whether that meant a license, a business, a certification, a test, or a life change?
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-medium text-white">What if serious effort had real support?</p>
                <p className="mt-3 text-sm leading-7 text-neutral-300">
                  What if you had a companion that could carry the thinking, preserve direction, and help you keep pressure from breaking the plan?
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-medium text-white">What if the odds improved because you stayed with it?</p>
                <p className="mt-3 text-sm leading-7 text-neutral-300">
                  Favorable probabilities do not come from wishing. They come from clarity, repetition, better decisions, and sustained movement. GEORGE is built to strengthen all four.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-sm leading-8 text-neutral-200 md:text-base">
                GEORGE is not here to decorate your screen or keep you company. GEORGE is here to help you identify what you want, make it plain, and work with you until it becomes real.
              </p>

              <p className="mt-4 text-white">
                GEORGE puts real power in your hands.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
