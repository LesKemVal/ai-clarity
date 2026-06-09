'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [showLiveOptions, setShowLiveOptions] = useState(false)
  const liveSituations = ['interviews', 'boardrooms', 'meetings', 'everyday conversations']
  const [situationIndex, setSituationIndex] = useState(0)
  const [typedSituation, setTypedSituation] = useState('')

  useEffect(() => {
    const word = liveSituations[situationIndex]
    let i = 0
    setTypedSituation('')

    const typing = window.setInterval(() => {
      i += 1
      setTypedSituation(word.slice(0, i))

      if (i >= word.length) {
        window.clearInterval(typing)
        window.setTimeout(() => {
          setSituationIndex((index) => (index + 1) % liveSituations.length)
        }, word === 'everyday conversations' ? 1800 : 950)
      }
    }, 42)

    return () => window.clearInterval(typing)
  }, [situationIndex])

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george?start=1')
  }

  return (
    <main className="george-home-depth relative min-h-[100dvh] overflow-hidden bg-[#030406] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(174,182,255,0.105),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(143,182,201,0.045),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1120px] flex-col px-5 pb-4 pt-4 sm:px-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/george')}
            className="flex h-[76px] w-[76px] items-center justify-center"
            aria-label="Open GEORGE"
          >
            <img src="/logofav.png" alt="Bx" className="h-[68px] w-[68px] object-contain opacity-95" />
          </button>

          <div className="text-[9px] uppercase tracking-[0.3em] text-white/20">
            BRANESx
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-start pt-8 text-left sm:pt-10">
          <div className="mx-auto w-full max-w-[720px]">
            <h1 className="text-[48px] font-semibold leading-[0.9] tracking-[-0.074em] text-white sm:text-[82px]">
              Ask GEORGE.
            </h1>

            <p className="mt-5 max-w-[720px] font-mono text-[14px] leading-7 tracking-[0.01em] text-white/54 sm:text-[17px] sm:leading-8">
              GEORGE is Brilliant operational awareness designed to move users from where they are to where they want to be. Use GEORGE to plan, prepare, build, decide, write, negotiate, learn, or work—or bring GEORGE into interviews, meetings, negotiations, and other rooms where your success is tied to how your case, ideas, plans, or concerns are presented.
            </p>

            <div className="mx-auto mt-7 flex h-[178px] w-full max-w-[390px] items-center justify-center sm:h-[260px] sm:max-w-[560px]">
              <img
                src="/interviewstick.png"
                alt=""
                className="max-h-[165px] w-auto object-contain opacity-95 sm:max-h-[245px]"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group relative min-h-[76px] overflow-hidden rounded-[1.05rem] border border-[#AEB6FF]/24 bg-[#AEB6FF]/[0.075] px-5 py-3 text-left shadow-[0_0_32px_rgba(174,182,255,0.075)] transition hover:border-[#AEB6FF]/42 hover:bg-[#AEB6FF]/[0.115]"
              >
                <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/26 to-transparent" />
                <span className="block text-[12px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/90">
                  Ask GEORGE
                </span>
                <span className="mt-2 block text-[12px] leading-5 text-white/46">
                  Think. Write. Decide. Prepare. Build.
                </span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLiveOptions((value) => !value)}
                  className="min-h-[76px] w-full rounded-[1.05rem] border border-white/[0.09] bg-white/[0.012] px-5 py-3 text-left transition hover:border-white/[0.18] hover:bg-white/[0.026]"
                >
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.22em] text-white/74">
                    LIVE Mode
                  </span>
                  <span className="mt-2 block text-[12px] leading-5 text-white/42">
                    Bring GEORGE into the room.
                  </span>
                </button>

                {showLiveOptions && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[250px] rounded-[1rem] border border-white/[0.07] bg-[#070A0F]/96 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
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
          </div>
        </section>

        <footer className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.045] pt-4 pb-5 text-[8px] uppercase tracking-[0.16em] text-white/20 sm:text-[9px]">
          <span>BRANESx by R. Block Share Holdings, LLC</span>
          <span>2026</span>
        </footer>
      </div>
    </main>
  )
}
