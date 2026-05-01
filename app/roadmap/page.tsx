'use client'

import PageShell from '@/components/layout/PageShell'

export default function RoadmapPage() {

  function enterGeorge() {
    window.localStorage.setItem('george_active', 'true')
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  

  function goHelp() {
    window.open('/help','_blank','noopener,noreferrer')
  }

  return (
    <PageShell title="" eyebrow="" backToGeorge withSidebar={false}>
      <div className="max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <div className="relative overflow-hidden">
            <img
              src="/roadmap/earbuds-clean.png"
              alt="Multiple earbuds supported by Brilliant Conversation Engine"
              className="block h-[280px] w-full object-cover object-center sm:h-[360px] md:h-[440px] lg:h-[560px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-start pt-52 sm:pt-60 md:pt-72 lg:pt-80">
              <div className="px-6 py-6 md:px-8">
                <div className="max-w-2xl space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
                    BRANESx Beta
                  </p>

                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
                    Earbuds unlock best with Brilliant.
                  </h1>

                  <p className="max-w-xl text-sm leading-7 text-neutral-200 md:text-base">
                    Start free. Upgrade when you want deeper continuity, stronger guidance, and live advantage in real time.
                  </p>

                  <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm leading-7 text-white/90">
                    Early users get first access to future features, smarter guidance, and premium upgrades as GEORGE continues to mature.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-6 py-6 md:px-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterGeorge}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
              >
                Use GEORGE now

<button
  type="button"
  onClick={() => window.location.href = '/george'}
  className="inline-flex items-center justify-center rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
>
  Enter GEORGE
</button>

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
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div className="max-w-3xl space-y-3">              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Smart, Intelligent, Brilliant, Professional.
              </h2>
              <p className="text-sm leading-7 text-neutral-300 md:text-base">
                Smart gets you moving. Intelligent sharpens continuity. Brilliant unlocks live advantage. Professional is for people whose conversations create revenue, appointments, donations, influence, or measurable outcomes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Smart</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Start here</p>
                </div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-300">
                  <li>• Quick clarity</li>
                  <li>• Immediate next moves</li>
                  <li>• Useful without setup</li>
                  <li>• Fast help when you need direction</li>
                </ul>              </div>

              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Intelligent</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D7DDFF]">Best value</p>
                </div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-100">
                  <li>• Stronger continuity</li>
                  <li>• Better framing</li>
                  <li>• More useful over time</li>
                  <li>• Better for active goals and ongoing progress</li>
                </ul>              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4 shadow-[0_0_30px_rgba(124,140,255,0.07)]">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Brilliant</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Flagship</p>
                </div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-200">
                  <li>• Conversation Engine</li>
                  <li>• Earbud live guidance</li>
                  <li>• Live cues</li>
                  <li>• Better room handling</li>
                  <li>• Sharper pressure support</li>
                </ul>              </div>
              <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-5 space-y-4 shadow-[0_0_30px_rgba(34,197,94,0.07)]">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Professional</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/65">Performance tier</p>
                </div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-100">
                  <li>• Revenue-generating live tools</li>
                  <li>• Sales and appointment assist</li>
                  <li>• Campaign memory</li>
                  <li>• ROI-focused outcomes</li>
                </ul>
              </div>

            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
