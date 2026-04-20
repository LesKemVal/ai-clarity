'use client'

import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'

export default function RoadmapPage() {
  const router = useRouter()

  function enterGeorge() {
    window.localStorage.setItem('george_active', 'true')
    router.push('/george')
  }

  function goWaitlist() {
    router.push('/top-up')
  }

  function goHelp() {
    router.push('/help')
  }

  return (
    <PageShell title="Roadmap" eyebrow="Beta" backToGeorge withSidebar={false}>
      <div className="max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-neutral-800 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-16 md:py-20">
            <div className="max-w-3xl space-y-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
                BRANESx Beta
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                GEORGE is in beta, but the direction is already real.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
                Use GEORGE now. Join the waitlist while paid access is still in beta. Help shape what becomes stronger, sharper, and more useful over time.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={enterGeorge}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Use GEORGE now
                </button>

                <button
                  type="button"
                  onClick={goWaitlist}
                  className="inline-flex items-center justify-center rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Join the waitlist
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
        </section>

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 md:p-8">
          <div className="max-w-3xl space-y-5">
            <h2 className="text-2xl font-semibold text-white">
              What beta means right now
            </h2>

            <p className="text-sm leading-7 text-neutral-200 md:text-base">
              GEORGE is live for testing and real use, but paid access, launch messaging, and broader rollout are still being shaped.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              During beta, the right move is to gather signal, improve the product, tighten the experience, and make sure people understand how to use GEORGE well before broader release.
            </p>

            <p className="text-sm leading-7 text-white md:text-base">
              This is where feedback matters.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">
                Current product path
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                GEORGE gets more useful as the weight of the moment increases.
              </h2>
              <p className="text-sm leading-7 text-neutral-300 md:text-base">
                Smart is for clarity and movement. Intelligent is for continuity and better judgment over time. Brilliant is where Conversation Engine, live cues, and room-awareness start to matter.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5 space-y-3">
                <p className="text-sm font-medium text-white">Smart</p>
                <ul className="space-y-1 text-sm leading-6 text-neutral-400">
                  <li>• Quick clarity</li>
                  <li>• Immediate next moves</li>
                  <li>• Useful without setup</li>
                  <li>• Start using GEORGE now</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-5 space-y-3">
                <p className="text-sm font-medium text-white">Intelligent</p>
                <ul className="space-y-1 text-sm leading-6 text-neutral-200">
                  <li>• Stronger continuity</li>
                  <li>• Better framing</li>
                  <li>• More useful over time</li>
                  <li>• Better for active goals</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black/25 p-5 space-y-3">
                <p className="text-sm font-medium text-white">Brilliant</p>
                <ul className="space-y-1 text-sm leading-6 text-neutral-400">
                  <li>• Conversation Engine</li>
                  <li>• Live cues</li>
                  <li>• Better room handling</li>
                  <li>• Sharper pressure support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What is coming
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-neutral-300">
                Better onboarding so new users immediately understand what GEORGE is for and how to get more from it.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-neutral-300">
                Stronger Conversation Engine support so people know how to use Focus, voice speed, mic, and LIVE cues in real moments.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-neutral-300">
                Better course and resource discovery so GEORGE can help users find credible learning paths and structure progress around them.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-neutral-300">
                Waitlist, feedback, and beta learning loops that help shape launch in a more grounded way.
              </div>
            </div>

            <p className="text-sm leading-7 text-white md:text-base">
              GEORGE is not just for answers. GEORGE is being built to help people move.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
