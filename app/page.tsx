'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [showLiveOptions, setShowLiveOptions] = useState(false)

  return (
    <main className="min-h-[100dvh] bg-[#040507] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1100px] flex-col px-6 pb-12 pt-10 sm:px-8">
        <div className="flex items-center">
          <img
            src="/logofav.png"
            alt="Bx"
            className="h-9 w-9 object-contain opacity-90"
          />
        </div>

        <div className="mt-16 max-w-[760px]">
          <h1 className="text-[52px] font-semibold leading-[0.92] tracking-[-0.06em] text-white md:text-[86px]">
            GEORGE
          </h1>

          <p className="mt-6 max-w-[760px] text-[20px] leading-8 text-white/60">
            Put GEORGE in your ear before walking into an interview, meeting, boardroom, negotiation, or presentation — and better your success ratio.
          </p>
        </div>

        <div className="relative z-10 mt-14 w-full max-w-[920px] rounded-[1.5rem] border border-white/[0.085] bg-[#10131B]/72 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-md md:p-7">
          <p className="text-[19px] leading-8 text-white/84">
            Potential is rarely limited by knowledge.
          </p>

          <p className="mt-5 text-[15px] leading-8 text-white/72">
            With GEORGE in your ear, you avoid losing context, misremembering important details, or losing your position as conversations evolve.
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLiveOptions((value) => !value)}
              className="rounded-[1rem] border border-white/[0.06] bg-white/[0.015] px-7 py-4 text-[15px] font-medium text-white/70 transition hover:bg-white/[0.03] hover:text-white"
            >
              Enter LIVE
            </button>

            {showLiveOptions && (
              <div className="absolute left-0 top-full z-20 mt-2 w-[210px] rounded-[1rem] border border-white/[0.07] bg-[#070A0F]/95 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                      window.localStorage.setItem('GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION', 'start')
                      router.push('/george?live=1&start=1')
                    }}
                  className="block w-full rounded-[0.8rem] px-3 py-2.5 text-left text-[13px] text-white/72 transition hover:bg-white/[0.045] hover:text-white"
                >
                  Start New LIVE
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/live?resume=1')}
                  className="mt-1 block w-full rounded-[0.8rem] px-3 py-2.5 text-left text-[13px] text-white/52 transition hover:bg-white/[0.045] hover:text-white"
                >
                  Resume LIVE
                </button>
              </div>
            )}
          </div>
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
              Earbuds connect you to GEORGE.<br />
              GEORGE helps you stay connected to the conversation.
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
