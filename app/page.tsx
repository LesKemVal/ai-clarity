'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [showLiveOptions, setShowLiveOptions] = useState(false)

  const startLive = () => {
    window.localStorage.setItem('GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION', 'start')
    router.push('/george?start=1')
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#040507] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1120px] flex-col px-5 pb-8 pt-7 sm:px-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/george')}
            className="flex items-center gap-3 text-left"
            aria-label="Open GEORGE"
          >
            <img src="/logofav.png" alt="Bx" className="h-9 w-9 object-contain opacity-90" />
            <span className="hidden text-[10px] uppercase tracking-[0.28em] text-white/28 sm:block">
              BRANESx
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/george')}
            className="text-[10px] uppercase tracking-[0.28em] text-white/28 transition hover:text-white/58"
          >
            Open
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-center pb-8 pt-16">
          <div className="max-w-[860px]">
            <div className="mb-5 text-[10px] uppercase tracking-[0.34em] text-[#AEB6FF]/42">
              Intelligent utility
            </div>

            <h1 className="text-[58px] font-semibold leading-[0.88] tracking-[-0.07em] text-white md:text-[104px]">
              GEORGE
            </h1>

            <p className="mt-8 max-w-[780px] text-[20px] leading-8 tracking-[-0.01em] text-white/72 md:text-[25px] md:leading-9">
              Ask, prepare, or take GEORGE into the room when words matter.
            </p>

            <p className="mt-5 max-w-[680px] text-[14px] leading-7 text-white/46 md:text-[15px] md:leading-8">
              Use GEORGE for decisions, preparation, interviews, negotiations, meetings, presentations, and difficult conversations.
            </p>

            <div className="mt-10 flex w-full max-w-[560px] flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="flex h-14 flex-1 items-center justify-center rounded-[1rem] border border-[#AEB6FF]/18 bg-[#AEB6FF]/[0.075] px-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#D7DCFF]/86 transition hover:border-[#AEB6FF]/30 hover:bg-[#AEB6FF]/[0.11] hover:text-white"
              >
                Ask GEORGE
              </button>

              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setShowLiveOptions((value) => !value)}
                  className="flex h-14 w-full items-center justify-center rounded-[1rem] border border-white/[0.08] bg-transparent px-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/68 transition hover:border-white/[0.15] hover:text-white"
                >
                  LIVE GEORGE
                </button>

                {showLiveOptions && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[230px] rounded-[1rem] border border-white/[0.07] bg-[#070A0F]/96 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={startLive}
                      className="block w-full rounded-[0.8rem] px-3 py-2.5 text-left text-[13px] text-white/76 transition hover:bg-white/[0.045] hover:text-white"
                    >
                      Start new LIVE
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/george/live')}
                      className="mt-1 block w-full rounded-[0.8rem] px-3 py-2.5 text-left text-[13px] text-white/48 transition hover:bg-white/[0.045] hover:text-white"
                    >
                      Resume LIVE
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 grid max-w-[820px] gap-2 text-[12px] leading-6 text-white/38 sm:grid-cols-3">
              <div className="border-l border-white/[0.07] pl-4">
                Prepare what to say.
              </div>
              <div className="border-l border-white/[0.07] pl-4">
                Improve how you present.
              </div>
              <div className="border-l border-white/[0.07] pl-4">
                Stay steady in real time.
              </div>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-4 border-t border-white/[0.04] pt-5 text-[10px] uppercase tracking-[0.28em] text-white/20">
          <span>Direction → Action → Signal</span>
          <span className="hidden sm:inline">Normal · LIVE · Continuity</span>
        </footer>
      </div>
    </main>
  )
}
