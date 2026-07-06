'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const heroStatements = [
  'REAL-TIME CONVERSATION ASSISTANT',
  'CHOOSE THE OUTCOME',
  'ASK GEORGE',
  'ENTER LIVE',
  'INTERVIEWS • NEGOTIATIONS • PRESENTATIONS',
  'BOARD MEETINGS • INVESTOR MEETINGS • PERFORMANCE REVIEWS',
  'AUDIO GLASSES (Recommended)',
  'EARBUDS (Private audio)',
]

export function HomeHeroSequence() {
  const router = useRouter()
  const [statementIndex, setStatementIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStatementIndex((index) => (index + 1) % heroStatements.length)
    }, 2600)

    return () => window.clearInterval(timer)
  }, [])

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george/live-entry?source=start')
  }

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_32%,rgba(55,183,255,0.09),transparent_30%),linear-gradient(180deg,#050607_0%,#000_100%)]" />

      <button
        type="button"
        onClick={() => router.push('/george')}
        className="absolute left-5 top-5 z-40 flex h-[58px] w-[58px] items-center justify-center"
        aria-label="Open GEORGE"
      >
        <img src="/logofav.png" alt="Bx" className="h-[52px] w-[52px] object-contain opacity-95" />
      </button>

      <div className="relative z-10 mx-auto h-[100dvh] w-full max-w-[1500px]">
        <div className="absolute left-[7%] top-[19%] z-30 max-w-[1100px] pr-8 text-left">
          <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.34em] text-[#E7C47D]/70">
            GEORGE
          </div>

          <div
            key={statementIndex}
            className="animate-[homeHeroStatement_2.6s_ease-in-out_both] font-mono text-[44px] font-black uppercase leading-[0.92] tracking-[-0.075em] text-white/92 sm:text-[78px] md:text-[104px]"
          >
            {heroStatements[statementIndex]}
          </div>

          <style jsx>{`
            @keyframes homeHeroStatement {
              0% {
                opacity: 0;
                transform: translateY(-18px);
                filter: blur(2px);
              }
              15%, 76% {
                opacity: 1;
                transform: translateY(0);
                filter: blur(0);
              }
              100% {
                opacity: 0;
                transform: translateY(18px);
                filter: blur(2px);
              }
            }
          `}</style>
        </div>

        <div className="absolute inset-x-5 bottom-5 z-40">
          <div className="mx-auto max-w-[760px] rounded-[26px] border border-white/12 bg-black/42 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group flex h-[56px] items-center justify-between rounded-[17px] bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-black transition hover:-translate-y-[1px]"
              >
                <span>Ask GEORGE <span className="text-black/45">(Prepare)</span></span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">→</span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[56px] items-center justify-between rounded-[17px] border border-white/18 bg-white/8 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:-translate-y-[1px] hover:bg-white/12"
              >
                <span>LIVE Support <span className="text-white/45">(Execute)</span></span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
