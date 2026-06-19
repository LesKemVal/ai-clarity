'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const scenes = [
  {
    image: '/hero/hero.jpg',
    hue: 'hue-rotate(205deg) saturate(0.72) brightness(0.68)',
    cue: 'Lead with the outcome.',
    label: 'PREPARE',
  },
  {
    image: '/landing/city02.png',
    hue: 'hue-rotate(180deg) saturate(0.62) brightness(0.58)',
    cue: 'Anchor value first.',
    label: 'NEGOTIATE',
  },
  {
    image: '/interviewstick.png',
    hue: 'hue-rotate(215deg) saturate(0.55) brightness(0.56)',
    cue: 'Answer the question first.',
    label: 'INTERVIEW',
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
            filter: item.hue,
            transform: 'scale(1.04)',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(90deg,rgba(3,4,5,0.92),rgba(3,4,5,0.52),rgba(3,4,5,0.9)),linear-gradient(180deg,rgba(3,4,5,0.45),rgba(3,4,5,0.92))]" />

      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
        <div className="relative h-[42vw] min-h-[270px] w-[86vw] max-w-[1100px]">
          <svg viewBox="0 0 1200 520" className="h-full w-full drop-shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
            <path
              d="M120 238 C124 132 201 82 333 86 C445 90 503 133 524 221 C545 158 586 132 646 132 C706 132 747 158 768 221 C789 133 847 90 959 86 C1091 82 1168 132 1172 238 C1176 356 1089 423 963 421 C832 419 781 348 768 254 C747 300 706 321 646 321 C586 321 545 300 524 254 C511 348 460 419 329 421 C203 423 116 356 120 238Z"
              fill="rgba(5,8,12,0.72)"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="10"
            />
            <path
              d="M166 230 C169 156 226 121 331 124 C429 127 486 163 497 245 C508 331 445 383 334 383 C224 383 162 320 166 230Z"
              fill="rgba(190,215,255,0.055)"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="3"
            />
            <path
              d="M795 245 C806 163 863 127 961 124 C1066 121 1123 156 1126 230 C1130 320 1068 383 958 383 C847 383 784 331 795 245Z"
              fill="rgba(190,215,255,0.055)"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="3"
            />
            <path d="M120 236 L18 178" stroke="rgba(255,255,255,0.36)" strokeWidth="10" strokeLinecap="round" />
            <path d="M1172 236 L1282 178" stroke="rgba(255,255,255,0.36)" strokeWidth="10" strokeLinecap="round" />
          </svg>

          <div className="absolute left-[17%] top-[34%] max-w-[280px]">
            <div className="mb-2 text-[10px] uppercase tracking-[0.34em] text-white/48">
              GEORGE · {scene.label}
            </div>
            <div className="text-[15px] leading-snug text-white/86 sm:text-[18px]">
              {scene.cue}
            </div>
          </div>
        </div>
      </div>

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

        <section className="flex flex-1 items-end pb-8">
          <div className="max-w-[780px]">
            <div className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/48">
              Different room. Same GEORGE.
            </div>

            <h1 className="max-w-[760px] text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[82px]">
              Prepare and execute with GEORGE.
            </h1>

            <p className="mt-5 max-w-[640px] text-[15px] leading-7 text-white/68 sm:text-[17px]">
              GEORGE helps you prepare, communicate, decide, and adapt when outcomes depend on what happens in the room.
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
