'use client'

import Link from 'next/link'
import { useState } from 'react'

type CapabilityMode = 'george' | 'live' | null

export default function RootPage() {
  const [openCapability, setOpenCapability] = useState<CapabilityMode>(null)
  const [showLiveStart, setShowLiveStart] = useState(false)
  const georgeOpen = openCapability === 'george'
  const liveOpen = openCapability === 'live'

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-[#DCE1E7]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0A0C10_0%,#06070A_46%,#050609_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.045]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,16,0.38),rgba(8,10,14,0.24)_36%,rgba(6,7,10,0.52)_70%,rgba(6,7,10,0.92)_100%)]" />
        <div className="absolute left-1/2 top-[-90px] h-[92%] w-[1180px] -translate-x-1/2 overflow-hidden rounded-[1.8rem] bg-[linear-gradient(105deg,rgba(10,12,16,0.30),rgba(18,20,26,0.12)_44%,rgba(7,10,17,0.26))] opacity-76">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(174,182,255,0.045),transparent_24%),radial-gradient(circle_at_74%_30%,rgba(126,160,190,0.035),transparent_18%),radial-gradient(circle_at_38%_66%,rgba(20,48,76,0.12),transparent_28%)]" />
          <div className="absolute left-[6%] top-[182px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/10 to-transparent" />
          <div className="absolute left-[12%] top-[248px] h-px w-[72%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          <div className="absolute left-[20%] top-[378px] h-px w-[64%] bg-gradient-to-r from-transparent via-[#7EC9DA]/10 to-transparent" />
          <div className="absolute left-[28%] top-[520px] h-px w-[48%] bg-gradient-to-r from-transparent via-[#9BB8CF]/8 to-transparent" />
          <div className="absolute left-[18%] top-[168px] h-2 w-2 rounded-[0.25rem] bg-white/[0.04]" />
          <div className="absolute left-[42%] top-[238px] h-2.5 w-2.5 rounded-[0.3rem] bg-[#8FB6C9]/10" />
          <div className="absolute left-[63%] top-[164px] h-3 w-3 rounded-[0.35rem] bg-[#8FB6C9]/5" />
          <div className="absolute right-[5%] top-[112px] h-24 w-24 rounded-full border border-[#8FB6C9]/7" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent via-[#06070A]/58 to-[#06070A]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-4 text-center sm:px-6">
        <img
          src="/logofav.png"
          alt="BRANESx"
          className="mb-7 h-36 w-36 rounded-[2.1rem] object-contain opacity-95 sm:h-40 sm:w-40"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          OPERATIONAL INTELLIGENCE
        </div>
        <h1 className="max-w-[640px] text-[33px] font-semibold leading-[1.05] tracking-[-0.055em] text-white/94 md:text-[52px]">
          LIVE Conversation assistance
        </h1>
        <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Use GEORGE to plan, decide, prepare, respond, and keep momentum when timing, pressure, and words matter most.
        </p>

        <div className="mt-8 grid w-full max-w-[520px] gap-3 text-left">
          <button
            type="button"
            onClick={() => setOpenCapability(georgeOpen ? null : 'george')}
            className={`group w-full rounded-[1.15rem] border px-5 py-4 text-left transition-all duration-300 ${
              georgeOpen
                ? 'border-[#DCE1E7]/[0.18] bg-white/[0.055] shadow-[0_22px_54px_rgba(0,0,0,0.30)]'
                : 'border-white/[0.055] bg-black/[0.18] hover:border-white/[0.10] hover:bg-white/[0.028]'
            }`}
            aria-expanded={georgeOpen}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">GEORGE</div>
                <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white/88">Normal GEORGE</div>
              </div>

              <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] text-[18px] text-white/42 transition ${georgeOpen ? 'rotate-45 bg-white/[0.06] text-white/78' : 'group-hover:text-white/72'}`}>
                +
              </div>
            </div>

            <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${georgeOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-[14px] leading-6 text-white/58">
                  Turn a goal, problem, document, idea, or decision into direction and a useful next step.
                </p>

                <div className="mt-4 grid gap-2 text-[12px] text-white/44">
                  <div className="rounded-[0.75rem] border border-white/[0.035] bg-black/20 px-3 py-2">Build, decide, plan, learn, prepare.</div>
                  <div className="rounded-[0.75rem] border border-white/[0.035] bg-black/20 px-3 py-2">Use documents, screenshots, ideas, or pressure.</div>
                  <div className="rounded-[0.75rem] border border-white/[0.035] bg-black/20 px-3 py-2">GEORGE keeps moving toward the outcome.</div>
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOpenCapability(liveOpen ? null : 'live')}
            className={`group relative w-full overflow-hidden rounded-[1.15rem] border px-5 py-4 text-left transition-all duration-300 ${
              liveOpen
                ? 'border-[#8FB6C9]/[0.28] bg-[linear-gradient(180deg,rgba(143,182,201,0.10),rgba(8,17,29,0.72))] shadow-[0_24px_60px_rgba(4,10,18,0.42),inset_0_1px_0_rgba(143,182,201,0.08)]'
                : 'border-[#DCE1E7]/[0.14] bg-[#8FB6C9]/[0.018] hover:border-[#8FB6C9]/[0.22] hover:bg-[#8FB6C9]/[0.045]'
            }`}
            aria-expanded={liveOpen}
          >
            <span className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,182,201,0.18),transparent_44%)] transition ${liveOpen ? 'opacity-90' : 'opacity-30'}`} />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#B8D4E6]/58">LIVE GEORGE</div>
                <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#E6F3FA]/90">Real-time support</div>
              </div>

              <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#8FB6C9]/[0.14] text-[18px] text-[#B8D4E6]/56 transition ${liveOpen ? 'rotate-45 bg-[#8FB6C9]/[0.08] text-white' : 'group-hover:text-white/84'}`}>
                +
              </div>
            </div>

            <div className={`relative grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${liveOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-[14px] leading-6 text-white/66">
                  Use LIVE when the room matters: interviews, negotiations, calls, meetings, conflict, presentations, or any moment where timing and words count.
                </p>

                <div className="mt-4 grid gap-2 text-[12px] text-white/48">
                  <div className="rounded-[0.75rem] border border-[#8FB6C9]/[0.08] bg-black/20 px-3 py-2">Timing. Pressure. The next useful line.</div>
                  <div className="rounded-[0.75rem] border border-[#8FB6C9]/[0.08] bg-black/20 px-3 py-2">Use one earbud. Let GEORGE track the room.</div>
                  <div className="rounded-[0.75rem] border border-[#8FB6C9]/[0.08] bg-black/20 px-3 py-2">Prepare the room first, or enter quickly.</div>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-7 grid w-full max-w-[440px] gap-3 sm:grid-cols-2">
          <Link
            href="/george"
            className="group flex items-center justify-center rounded-[1.1rem] border border-[#DCE1E7]/[0.18] bg-[#0D1117] px-6 py-4 text-[14px] font-semibold text-[#DCE1E7] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition hover:border-white/[0.18] hover:bg-[#11151A] hover:text-white"
          >
            Enter GEORGE
          </Link>

          <button
            type="button"
            onClick={() => setShowLiveStart(true)}
            className="group relative flex items-center justify-center overflow-hidden rounded-[1.1rem] border border-[#8FB6C9]/[0.16] bg-[#101722] px-6 py-4 text-[14px] font-semibold text-[#D7E6EE] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition hover:border-[#8FB6C9]/[0.24] hover:bg-[#121B27]"
          >
            <span>Enter LIVE</span>
          </button>
        </div>

        <p className="mt-5 text-[12px] leading-5 text-white/32">
          GEORGE starts free. LIVE Conversation begins with Intelligent.
        </p>
      </div>

      {showLiveStart && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/78 px-4 pb-5 sm:items-center sm:pb-0">
          <button
            type="button"
            aria-label="Close LIVE start"
            onClick={() => setShowLiveStart(false)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative w-full max-w-[390px] rounded-[1.15rem] border border-[#8FB6C9]/[0.10] bg-[#080D14]/[0.98] p-4 text-left shadow-[0_26px_70px_rgba(0,0,0,0.58)]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/60">
              LIVE GEORGE
            </div>

            <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-[#DDEAF2]">
              Start or resume.
            </div>

            <p className="mt-2 text-[13px] leading-6 text-[#9FA9B5]">
              Prepare the room, or continue the LIVE Conversation already in motion.
            </p>

            <div className="mt-5 grid gap-2">
              <Link
                href="/george/live-entry"
                className="rounded-[0.9rem] border border-[#8FB6C9]/[0.18] bg-[#8FB6C9]/[0.075] px-4 py-3 text-center text-[13px] font-semibold text-[#E6F3FA] transition hover:bg-[#8FB6C9]/[0.11]"
              >
                Prepare Room
              </Link>

              <button
                type="button"
                onClick={() => {
                  const hasLive =
                    typeof window !== 'undefined' &&
                    window.localStorage.getItem('GEORGE_LIVE_SETUP')

                  window.location.href = hasLive
                    ? '/george/live'
                    : '/george/live-entry'
                }}
                className="rounded-[0.9rem] border border-white/[0.06] bg-black/24 px-4 py-3 text-center text-[13px] font-medium text-white/68 transition hover:border-white/[0.10] hover:text-white/84"
              >
                Resume LIVE Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
