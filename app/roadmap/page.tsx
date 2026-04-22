'use client'

import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'

export default function RoadmapPage() {
  const router = useRouter()

  function enterGeorge() {
    window.localStorage.setItem('george_active', 'true')
    router.push('/george')
  }

  function goBrilliant() {
    router.push('/top-up#waitlist')
  }

  function goHelp() {
    router.push('/help')
  }

  return (
    <PageShell title="Roadmap" eyebrow="Beta" backToGeorge withSidebar={false}>
      <div className="max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <div className="lg:hidden">
            <div className="relative">
              <img
                src="/roadmap/earbuds-hero.png"
                alt="Multiple earbuds supported by Brilliant Conversation Engine"
                className="block h-[52vh] min-h-[360px] w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/90" />
              <div className="absolute inset-x-0 bottom-0 px-6 pb-7">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
                  BRANESx Beta
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white">
                  Earbuds unlock best with Brilliant.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-200">
                  Conversation Engine is built for real moments. Interviews. Negotiations. Workplace pressure. Relationship talks. Fast-moving situations where timing, tone, and wording matter.
                </p>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm leading-7 text-white/90">
                Use earbuds to keep GEORGE close while you stay in the conversation. Brilliant is where live cues, room-awareness, and pressure support start to matter.
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">
                  Powered by Conversation Engine
                </p>
                <p className="mt-3 text-sm leading-7 text-neutral-200">
                  Real-time guidance in your ear. Context-aware. Private. Always with you.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={enterGeorge}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Use GEORGE now
                </button>

                <button
                  type="button"
                  onClick={goBrilliant}
                  className="inline-flex items-center justify-center rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  See Brilliant
                </button>

                <button
                  type="button"
                  onClick={goHelp}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
                >
                  Learn how to use it
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="space-y-6 px-8 py-10 lg:flex lg:flex-col lg:justify-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
                BRANESx Beta
              </p>

              <h1 className="max-w-3xl text-6xl font-semibold tracking-tight text-white">
                Earbuds unlock best with Brilliant.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-neutral-300">
                Conversation Engine is built for real moments. Interviews. Negotiations. Workplace pressure. Relationship talks. Fast-moving situations where timing, tone, and wording matter.
              </p>

              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm leading-7 text-white/90">
                Use earbuds to keep GEORGE close while you stay in the conversation. Brilliant is where live cues, room-awareness, and pressure support start to matter.
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">
                  Powered by Conversation Engine
                </p>
                <p className="mt-3 text-base leading-7 text-neutral-200">
                  Real-time guidance in your ear. Context-aware. Private. Always with you.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={enterGeorge}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Use GEORGE now
                </button>

                <button
                  type="button"
                  onClick={goBrilliant}
                  className="inline-flex items-center justify-center rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  See Brilliant
                </button>

                <button
                  type="button"
                  onClick={goHelp}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
                >
                  Learn how to use it
                </button>
              </div>
            </div>

            <div>
              <img
                src="/roadmap/earbuds-hero.png"
                alt="Multiple earbuds supported by Brilliant Conversation Engine"
                className="block h-full min-h-[640px] w-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">
                Conversation Engine modes
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Choose the kind of help the moment actually needs.
              </h2>
              <p className="text-sm leading-7 text-neutral-300 md:text-base">
                Brilliant is not just stronger chat. It is mode-based live support built for different kinds of human pressure.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Interview mode</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  Helps you answer clearly, stay composed, and recover fast under pressure.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Negotiation mode</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  Helps you protect leverage, control phrasing, and avoid weak concessions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Workplace mode</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  Helps you respond cleanly when blame, tension, or power dynamics show up.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Relationship mode</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  Helps you say what matters without rambling, chasing, or sounding weak.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Defensive mode</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  Helps you protect dignity, slow escalation, and avoid saying the wrong thing under fire.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">Everyday live mode</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  Helps you think and respond in real time when the moment is moving fast.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
