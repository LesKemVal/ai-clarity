'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const scenes = [
  {
    image: '/hero/foam/foam1.png',
    cue: 'Room receptive.',
    label: 'ARRIVAL',
  },
  {
    image: '/hero/foam/foam2.png',
    cue: 'Alignment possible.',
    label: 'SCHOOL',
  },
  {
    image: '/hero/foam/foam3.png',
    cue: 'Positive reception.',
    label: 'INTERVIEW',
  },
  {
    image: '/hero/foam/foam4.png',
    cue: 'Trust forming.',
    label: 'SOCIAL',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [sceneIndex, setSceneIndex] = useState(0)
  const scene = scenes[sceneIndex]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [])

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george/live-entry?source=start')
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#030405] text-white">
      {scenes.map((item, index) => (
        <div
          key={item.image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ease-out ${
            index === sceneIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${item.image})`,
            transform: 'scale(1.02)',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.035),transparent_34%),linear-gradient(180deg,rgba(3,4,5,0.18),rgba(3,4,5,0.38)_42%,rgba(3,4,5,0.92))]" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-6 py-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/george')}
            className="flex items-center gap-4"
            aria-label="Open GEORGE"
          >
            <img src="/logofav.png" alt="Bx" className="h-10 w-10 object-contain opacity-90" />
            <span className="text-[12px] uppercase tracking-[0.42em] text-white/62">BRANESx</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'GEORGE by BRANESx', url: window.location.href }).catch(() => {})
              }
            }}
            className="text-[9px] uppercase tracking-[0.24em] text-white/42 transition hover:text-white/70"
          >
            Share
          </button>
        </header>

        <section className="flex flex-1 items-end pb-12">
          <div className="max-w-[720px] rounded-[28px] border border-white/10 bg-black/58 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.68)] backdrop-blur-xl sm:p-7">
            <div className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/48">
              Different room. Same GEORGE.
            </div>

            <h1 className="max-w-[760px] text-[40px] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[66px]">
              Prepare. Present. Sell. Negotiate.
            </h1>

            <p className="mt-5 max-w-[640px] text-[15px] leading-7 text-white/68 sm:text-[17px]">
              One GEORGE. Different rooms. Different outcomes.
            </p>

            <div className="mt-8 grid max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group flex h-[58px] items-center justify-between rounded-[18px] bg-white px-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-black transition hover:-translate-y-[1px]"
              >
                <span>Ask GEORGE</span>
                <span className="text-[22px] transition-transform group-hover:translate-x-1">→</span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[58px] items-center justify-between rounded-[18px] border border-white/16 bg-white/8 px-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:-translate-y-[1px] hover:bg-white/12"
              >
                <span>Bring GEORGE into the room</span>
                <span className="text-[22px] transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between text-[10px] uppercase tracking-[0.36em] text-white/42">
          <span>BRANESx</span>
          <span>2026</span>
        </footer>
      </div>
    </main>
  )
}
