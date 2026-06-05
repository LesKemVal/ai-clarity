'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [showLiveOptions, setShowLiveOptions] = useState(false)

  return (
    <main className="min-h-[100dvh] bg-[#040507] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1080px] flex-col px-5 pb-10 pt-8 sm:px-8">
        <header className="flex items-center justify-between">
          <img src="/logofav.png" alt="Bx" className="h-9 w-9 object-contain opacity-90" />
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/24">
            Intelligent Utility
          </div>
        </header>

        <section className="mt-20 max-w-[840px]">
          <h1 className="text-[56px] font-semibold leading-[0.9] tracking-[-0.065em] text-white md:text-[92px]">
            GEORGE
          </h1>

          <p className="mt-7 max-w-[780px] text-[21px] leading-8 text-white/66 md:text-[24px] md:leading-9">
            Increase the probability of getting more of what you want by improving your conversation.
          </p>
        </section>

        <section className="mt-12 max-w-[860px]">
          <p className="text-[20px] leading-8 text-white/86">
            Master GEORGE and maximize the benefit of articulate, mature presentation.
          </p>

          <p className="mt-5 text-[15px] leading-8 text-white/62">
            Better understanding is useful.
            <br />
            Better presentation changes outcomes.
          </p>
        </section>

        <div className="mt-9 grid w-full max-w-[520px] grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push('/george')}
            className="flex h-14 flex-1 items-center justify-center rounded-[1rem] border border-[#AAB4FF]/18 bg-[#AAB4FF]/[0.08] px-5 text-[14px] font-semibold text-[#D7DCFF] transition hover:bg-[#AAB4FF]/[0.12]"
          >
            Open GEORGE
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLiveOptions((value) => !value)}
              className="flex h-14 w-full items-center justify-center rounded-[1rem] border border-white/[0.07] bg-white/[0.018] px-5 text-[14px] font-semibold text-white/72 transition hover:bg-white/[0.035] hover:text-white"
            >
              Enter LIVE
            </button>

            {showLiveOptions && (
              <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[210px] rounded-[1rem] border border-white/[0.07] bg-[#070A0F]/96 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.setItem('GEORGE_PENDING_LIVE_SIGNAL_ACQUISITION', 'start')
                    router.push('/george?start=1')
                  }}
                  className="block w-full rounded-[0.8rem] px-3 py-2.5 text-left text-[13px] text-white/74 transition hover:bg-white/[0.045] hover:text-white"
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

        <div className="mt-10 w-full max-w-[760px] overflow-x-auto whitespace-nowrap text-[11px] uppercase tracking-[0.24em] text-white/32 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          Interviews • Meetings • Negotiations • Presentations • Boardrooms • Sales Calls • Difficult Conversations
        </div>

        <footer className="mt-auto pt-16 text-center text-[10px] uppercase tracking-[0.32em] text-white/18">
          Direction → Action → Signal
        </footer>
      </div>
    </main>
  )
}
