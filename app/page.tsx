'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="min-h-[100dvh] bg-[#040507] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1100px] flex-col px-6 pb-12 pt-10 sm:px-8">
        <div className="text-[11px] uppercase tracking-[0.32em] text-white/42">
          BRANESx
        </div>

        <div className="mt-16 max-w-[760px]">
          <h1 className="text-[52px] font-semibold leading-[0.92] tracking-[-0.06em] text-white md:text-[86px]">
            GEORGE
          </h1>

          <p className="mt-6 max-w-[760px] text-[20px] leading-8 text-white/54">
            Operational intelligence for moments where judgment, timing, and communication matter.
          </p>

          <p className="mt-6 max-w-[720px] text-[16px] leading-8 text-white/40">
            Whatever you want to become, build, solve, navigate, or say — start with GEORGE.
          </p>
        </div>

        <div className="mt-14 max-w-[760px] rounded-[1.5rem] border border-white/[0.05] bg-white/[0.02] p-6 backdrop-blur-sm">
          <p className="text-[18px] leading-8 text-white/76">
            Most people already possess more knowledge than they realize.
          </p>

          <p className="mt-5 text-[15px] leading-8 text-white/42">
            What slows them down is recall, articulation, organization, confidence,
            adaptation, and composure.
          </p>

          <p className="mt-5 text-[15px] leading-8 text-white/60">
            GEORGE helps close that gap.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push('/george')}
            className="rounded-[1rem] border border-[#AAB4FF]/18 bg-[#AAB4FF]/[0.08] px-7 py-4 text-[15px] font-semibold text-[#D7DCFF] transition hover:bg-[#AAB4FF]/[0.12]"
          >
            Open GEORGE
          </button>

          <button
            type="button"
            onClick={() => router.push('/george/live-entry')}
            className="rounded-[1rem] border border-white/[0.06] bg-white/[0.015] px-7 py-4 text-[15px] font-medium text-white/70 transition hover:bg-white/[0.03] hover:text-white"
          >
            Enter LIVE
          </button>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          <section className="rounded-[1.2rem] border border-white/[0.04] bg-white/[0.01] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/28">
              PREPARE
            </div>

            <div className="mt-4 text-[14px] leading-8 text-white/58">
              Interviews.<br />
              Meetings.<br />
              Presentations.<br />
              Negotiations.<br />
              Difficult conversations.
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-white/[0.04] bg-white/[0.01] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/28">
              THINK
            </div>

            <div className="mt-4 text-[14px] leading-8 text-white/58">
              Decisions.<br />
              Strategy.<br />
              Planning.<br />
              Problem solving.<br />
              Execution.
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-white/[0.04] bg-white/[0.01] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/28">
              LIVE
            </div>

            <div className="mt-4 text-[14px] leading-8 text-white/58">
              When the conversation begins,
              bring GEORGE into the room.
            </div>
          </section>
        </div>

        <div className="mt-auto pt-16 text-center text-[10px] uppercase tracking-[0.32em] text-white/18">
          Direction → Action → Signal
        </div>
      </div>
    </main>
  )
}
