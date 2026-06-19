'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const georgeSignals = [
  { mode: 'OBSERVATION', text: 'Decision maker appears unconvinced.' },
  { mode: 'CUE', text: 'Build rapport before discussing terms.' },
  { mode: 'LINE', text: '"Tell me more about that concern."' },
  { mode: 'SILENCE', text: 'Hold.' },
]

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
  const [signalIndex, setSignalIndex] = useState(0)
  const scene = scenes[sceneIndex]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSignalIndex((current) => (current + 1) % georgeSignals.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [])

  const signal = georgeSignals[signalIndex]

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

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,5,0.92)_0%,rgba(3,4,5,0.62)_18%,rgba(3,4,5,0.28)_42%,rgba(3,4,5,0.92)_100%)]" />

      
      <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
        <div className="relative w-[92vw] max-w-[1100px]">

          <svg
            viewBox="0 0 1200 520"
            className="h-auto w-full opacity-90"
          >
            <path
              d="M120 238 C124 132 201 82 333 86 C445 90 503 133 524 221 C545 158 586 132 646 132 C706 132 747 158 768 221 C789 133 847 90 959 86 C1091 82 1168 132 1172 238 C1176 356 1089 423 963 421 C832 419 781 348 768 254 C747 300 706 321 646 321 C586 321 545 300 524 254 C511 348 460 419 329 421 C203 423 116 356 120 238Z"
              fill="transparent"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="8"
            />
          </svg>

          <div className="absolute left-[14%] top-[31%] max-w-[260px]">
            <div className="mb-2 text-[10px] tracking-[0.3em] text-white/50">
              {signal.mode}
            </div>
            <div className="text-[14px] leading-relaxed text-white/92">
              {signal.text}
            </div>
          </div>

          <div className="absolute right-[14%] top-[31%] max-w-[240px] text-right">
            <div className="mb-2 text-[10px] tracking-[0.3em] text-white/50">
              DELIVERY
            </div>
            <div className="text-[13px] leading-relaxed text-white/88">
              Observation · Cue · Line · Silence
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
            <img src="/logofav.png" alt="Bx" className="h-14 w-14 object-contain opacity-95" />
            
          </button>
        </header>

        <section className="flex flex-1 items-end pb-12">
          <div className="max-w-[720px] rounded-[28px] border border-white/10 bg-black/34 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.68)] backdrop-blur-xl sm:p-7">

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
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">

            <div className="mb-10">
              <div className="text-[11px] uppercase tracking-[0.32em] text-white/40">
                Human Capability
              </div>

              <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.04em] text-white">
                GEORGE should help people in the rooms they decide matter.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div className="overflow-hidden rounded-[28px] border border-white/8">
                <img
                  src="/hero/foam/foam1.png"
                  alt=""
                  className="h-[220px] w-full object-cover"
                />
                <div className="p-6">
                  <div className="text-[18px] text-white/90">
                    People build.
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/8">
                <img
                  src="/hero/foam/foam2.png"
                  alt=""
                  className="h-[220px] w-full object-cover"
                />
                <div className="p-6">
                  <div className="text-[18px] text-white/90">
                    People learn.
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/8">
                <img
                  src="/hero/foam/foam3.png"
                  alt=""
                  className="h-[220px] w-full object-cover"
                />
                <div className="p-6">
                  <div className="text-[18px] text-white/90">
                    People decide.
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/8">
                <img
                  src="/hero/foam/foam4.png"
                  alt=""
                  className="h-[220px] w-full object-cover"
                />
                <div className="p-6">
                  <div className="text-[18px] text-white/90">
                    People pursue opportunities.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>


        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">

            <div className="mb-10">
              <div className="text-[11px] uppercase tracking-[0.32em] text-white/40">
                Environment
              </div>

              <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.04em] text-white">
                GEORGE adapts to your environment.
              </h2>

              <p className="mt-4 max-w-3xl text-[18px] leading-8 text-white/60">
                The environment changes. The objective does not.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
                <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
                  Visible
                </div>

                <div className="text-[24px] text-white/92">
                  Visible Interfaces
                </div>

                <p className="mt-4 text-white/60 leading-7">
                  Desktop. Mobile. Displays. Surfaces designed for direct interaction.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
                <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
                  Discreet
                </div>

                <div className="text-[24px] text-white/92">
                  Discreet Interfaces
                </div>

                <p className="mt-4 text-white/60 leading-7">
                  Technologies capable of accompanying users without becoming the center of attention.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
                <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
                  Future
                </div>

                <div className="text-[24px] text-white/92">
                  Future Interfaces
                </div>

                <p className="mt-4 text-white/60 leading-7">
                  New ways for human and artificial intelligence to collaborate.
                </p>
              </div>

            </div>

          </div>
        </section>


        <section className="border-t border-white/8 px-6 py-20">
          <div className="mx-auto max-w-6xl space-y-4">

            <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
              <p className="text-[26px] leading-[1.35] tracking-[-0.03em] text-white/92">
                GEORGE was created to facilitate human ambition, not replace it.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
              <p className="max-w-5xl text-[18px] leading-8 text-white/72">
                People build. People learn. People decide.
                People communicate. People solve problems.
                People pursue opportunities.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
              <p className="max-w-5xl text-[18px] leading-8 text-white/72">
                Outcomes improve when people have access to better information,
                stronger preparation, broader perspective, and support in the
                moments that matter.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.015] p-7">
              <p className="max-w-5xl text-[18px] leading-8 text-white/72">
                Technology should expand human capability, not compete with it.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
