'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const liveSituations = ['interviews', 'negotiations', 'presentations', 'board meetings', 'Everyday conversations!']
  const [typedSituation, setTypedSituation] = useState('')

  useEffect(() => {
    let situationIndex = 0
    let characterIndex = 0
    let timer: number | undefined

    const typeNext = () => {
      const currentSituation = liveSituations[situationIndex]

      characterIndex += 1
      setTypedSituation(currentSituation.slice(0, characterIndex))

      if (characterIndex < currentSituation.length) {
        timer = window.setTimeout(typeNext, 75)
        return
      }

      const isLast = situationIndex === liveSituations.length - 1

      timer = window.setTimeout(() => {
        characterIndex = 0
        situationIndex = isLast ? 0 : situationIndex + 1
        setTypedSituation('')
        timer = window.setTimeout(typeNext, 160)
      }, isLast ? 2000 : 250)
    }

    setTypedSituation('')
    timer = window.setTimeout(typeNext, 250)

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george/live-entry?source=start')
  }

  useEffect(() => {
    const restoreInteractivity = () => {
      document.body.style.pointerEvents = ''
      document.documentElement.style.pointerEvents = ''
    }

    window.addEventListener('pageshow', restoreInteractivity)
    window.addEventListener('focus', restoreInteractivity)

    return () => {
      window.removeEventListener('pageshow', restoreInteractivity)
      window.removeEventListener('focus', restoreInteractivity)
    }
  }, [])

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#030405] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_54%_34%,rgba(174,182,255,0.075),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_18%,rgba(255,255,255,0.018))]" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[760px] flex-col px-6 py-4">
        <header className="flex items-center justify-between border-b border-white/[0.11] pb-3">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.push('/george')}
              className="flex h-[46px] w-[46px] items-center justify-center"
              aria-label="Open GEORGE"
            >
              <img src="/logofav.png" alt="Bx" className="h-[42px] w-[42px] object-contain opacity-95" />
            </button>
            <div className="text-[13px] uppercase tracking-[0.42em] text-white/76">
              BRANESx
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'GEORGE by BRANESx', url: window.location.href }).catch(() => {})
              }
            }}
            className="text-[8px] uppercase tracking-[0.18em] text-white/42 transition hover:text-white/68"
          >
            Share
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-between">
          <div className="pt-6">
            <h1 className="text-[66px] font-semibold leading-[0.88] tracking-[-0.078em] text-white sm:text-[96px]">
              Ask<br />
              <span className="text-[#BFC7FF]">GEORGE.</span>
            </h1>

            <div className="mt-5 inline-block rounded-[18px] border border-white/[0.08] bg-black/35 px-4 py-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm">
              <p className="text-[16px] uppercase leading-[1.65] tracking-[0.34em] text-white/90">
                Plan. Decide.<br />
                Prepare. Build.
              </p>

              <p className="mt-3 max-w-[520px] text-[12px] uppercase leading-6 tracking-[0.22em] text-white/54">
                Use GEORGE LIVE during{' '}
                <span className="inline-block min-w-[210px] text-left text-[#D7DCFF]/78">
                  {typedSituation}
                  <span className="ml-0.5 inline-block h-[14px] w-px translate-y-[2px] animate-pulse bg-[#D7DCFF]/70" />
                </span>
              </p>
            </div>
          </div>

          <div className="relative mx-auto my-4 h-[230px] w-full max-w-[520px] sm:h-[300px]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 360" aria-hidden="true">
              <defs>
                <filter id="earGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Head anchor */}
              <line x1="255" y1="192" x2="135" y2="58" stroke="rgba(191,199,255,0.38)" strokeWidth="1" />
              <line x1="255" y1="192" x2="255" y2="70" stroke="rgba(191,199,255,0.34)" strokeWidth="1" />
              <line x1="255" y1="192" x2="378" y2="78" stroke="rgba(191,199,255,0.34)" strokeWidth="1" />

              <circle cx="135" cy="58" r="3" fill="#BFC7FF" />
              <circle cx="255" cy="70" r="3" fill="#BFC7FF" />
              <circle cx="378" cy="78" r="3" fill="#BFC7FF" />

              {/* Stick figure */}
              <circle cx="244" cy="196" r="27" fill="transparent" stroke="rgba(255,255,255,0.86)" strokeWidth="2" />
              <circle cx="271" cy="203" r="5" fill="#BFC7FF" filter="url(#earGlow)" />
              <line x1="244" y1="223" x2="244" y2="286" stroke="rgba(255,255,255,0.82)" strokeWidth="2" />
              <line x1="244" y1="238" x2="222" y2="278" stroke="rgba(255,255,255,0.78)" strokeWidth="2" />
              <line x1="244" y1="238" x2="266" y2="278" stroke="rgba(255,255,255,0.78)" strokeWidth="2" />
            </svg>

            <div className="absolute left-[9%] top-[8%] text-[12px] uppercase tracking-[0.34em] text-white/86">
              Investor
            </div>
            <div className="absolute left-[46%] top-[13%] text-[12px] uppercase tracking-[0.34em] text-white/86">
              CEO
            </div>
            <div className="absolute right-[12%] top-[15%] text-[12px] uppercase tracking-[0.34em] text-white/86">
              Teacher
            </div>
          </div>

          <div className="-mt-16 border-t border-white/[0.105] pt-5 sm:-mt-20">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group flex h-[60px] items-center justify-between rounded-[18px] bg-white px-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-black transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_12px_34px_rgba(255,255,255,0.16)] active:opacity-90"
              >
                <span>Ask GEORGE</span>
                <span className="text-[22px] transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[60px] items-center justify-between rounded-[18px] bg-[#BFC7FF] px-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-black transition-all duration-150 hover:bg-[#D2D7FF] hover:shadow-[0_12px_36px_rgba(191,199,255,0.26)] active:opacity-90"
              >
                <span>Go LIVE</span>
                <span className="text-[22px] transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-6">→</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between pt-3 text-[10px] uppercase tracking-[0.36em] text-white/56">
          <span>BRANESx</span>
          <span>2026</span>
        </footer>
      </div>
    </main>
  )
}
