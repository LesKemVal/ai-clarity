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
          className="mb-6 h-28 w-28 rounded-[2rem] object-contain opacity-95 sm:h-32 sm:w-32"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          OPERATIONAL INTELLIGENCE
        </div>
        <h1 className="max-w-[640px] text-[31px] font-semibold leading-[1.02] tracking-[-0.06em] text-white/94 md:text-[52px]">
          Operational conversational intelligence
        </h1>
        <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Direction, continuity, and conversational support when timing, pressure, and words matter.
        </p>

        <div className="mt-8 grid w-full max-w-[560px] gap-4 text-left">
          <button
            type="button"
            onClick={() => setOpenCapability(georgeOpen ? null : 'george')}
            className={`group w-full group relative overflow-hidden rounded-[1.2rem] border px-5 py-4 backdrop-blur-xl text-left transition-all duration-300 ${
              georgeOpen
                ? 'border-[#DCE1E7]/[0.18] bg-white/[0.055] shadow-[0_22px_54px_rgba(0,0,0,0.30)]'
                : 'border-white/[0.055] bg-black/[0.18] hover:border-white/[0.11] hover:bg-white/[0.03] hover:shadow-[0_18px_48px_rgba(0,0,0,0.34)]'
            }`}
            aria-expanded={georgeOpen}
          >
            
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.2rem]">
              <span className="absolute inset-0 opacity-[0.16] [background:linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.24)_50%,transparent_82%)] animate-[operationalShimmer_7s_linear_infinite]" />
            </span>

            
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.2rem]">
              <span className="absolute inset-0 opacity-[0.16] [background:linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.24)_50%,transparent_82%)] animate-[operationalShimmer_7s_linear_infinite]" />
            </span>

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">GEORGE</div>
                <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white/88">Ask GEORGE</div>
              </div>

              <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-black/30 text-[14px] text-white/42 transition-all duration-300 ${georgeOpen ? 'rotate-45 bg-white/[0.06] text-white/78' : 'group-hover:text-white/72'}`}>
                <span className="translate-y-[-1px]">⌄</span>
              </div>
            </div>

            <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${georgeOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-[14px] leading-6 text-white/58">
                  Set the direction. GEORGE helps map the route.
                </p>

                <div className="mt-4 grid gap-2 text-[12px] text-white/44">
                  <div className="rounded-[0.82rem] border border-[#DCE1E7]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Strategic mapping</div>
                  <div className="rounded-[0.82rem] border border-[#DCE1E7]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Goal alignment</div>
                  <div className="rounded-[0.82rem] border border-[#DCE1E7]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Momentum recovery</div>
                  <div className="rounded-[0.82rem] border border-[#DCE1E7]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Decision framing</div>
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOpenCapability(liveOpen ? null : 'live')}
            className={`group relative w-full overflow-hidden group relative overflow-hidden rounded-[1.2rem] border px-5 py-4 backdrop-blur-xl text-left transition-all duration-300 ${
              liveOpen
                ? 'border-[#8FB6C9]/[0.28] bg-[linear-gradient(180deg,rgba(143,182,201,0.10),rgba(8,17,29,0.72))] shadow-[0_24px_60px_rgba(4,10,18,0.42),inset_0_1px_0_rgba(143,182,201,0.08)]'
                : 'border-[#DCE1E7]/[0.14] bg-[#8FB6C9]/[0.018] hover:border-[#8FB6C9]/[0.28] hover:bg-[#8FB6C9]/[0.06] hover:shadow-[0_18px_52px_rgba(5,12,22,0.42)]'
            }`}
            aria-expanded={liveOpen}
          >
            <span className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,182,201,0.18),transparent_44%)] transition ${liveOpen ? 'opacity-90' : 'opacity-30'}`} />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#B8D4E6]/58">LIVE GEORGE</div>
                <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#E6F3FA]/90">GEORGE LIVE</div>
              </div>

              <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#8FB6C9]/[0.14] bg-black/30 text-[14px] text-[#B8D4E6]/56 transition-all duration-300 ${liveOpen ? 'rotate-45 bg-[#8FB6C9]/[0.08] text-white' : 'group-hover:text-white/84'}`}>
                <span className="translate-y-[-1px]">⌄</span>
              </div>
            </div>

            <div className={`relative grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${liveOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-[14px] leading-6 text-white/66">
                  Real-time conversational support when timing, pressure, and words matter.
                </p>

                <div className="mt-4 grid gap-2 text-[12px] text-white/48">
                  <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Conversational recovery</div>
                  <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Pressure navigation</div>
                  <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Bluetooth earbuds, glasses, or text</div>
                  <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.10] bg-black/24 px-3 py-2.5 backdrop-blur-md">Tactical pacing + response shaping</div>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-7 grid w-full max-w-[440px] gap-3 sm:grid-cols-2">
          <Link
            href="/george"
            className="group flex items-center justify-center rounded-[1.1rem] border border-[#F8FAFC]/[0.46] bg-[#020304] px-6 py-4 text-[14px] font-semibold text-[#F8FAFC] shadow-[0_0_0_1px_rgba(248,250,252,0.10),0_14px_32px_rgba(0,0,0,0.34)] transition hover:border-[#F8FAFC]/[0.68] hover:bg-[#050607] hover:text-white"
          >
            Enter GEORGE
          </Link>

          <button
            type="button"
            onClick={() => setShowLiveStart(true)}
            className="group relative flex items-center justify-center overflow-hidden rounded-[1.1rem] border border-[#8FB6C9]/[0.34] bg-[#0B1622] px-6 py-4 text-[14px] font-semibold text-[#E6F3FA] shadow-[0_0_0_1px_rgba(143,182,201,0.08),0_14px_32px_rgba(0,0,0,0.34)] transition hover:border-[#8FB6C9]/[0.48] hover:bg-[#101C2A]"
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
