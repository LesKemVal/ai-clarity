'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const scenes = [
  {
    image: '/hero/foam/foam1.png',
    mode: 'OBSERVATION',
    text: 'Room receptive.',
  },
  {
    image: '/hero/foam/foam2.png',
    mode: 'CUE',
    text: 'Build rapport first.',
  },
  {
    image: '/hero/foam/foam3.png',
    mode: 'LINE',
    text: '"Tell me more about that concern."',
  },
  {
    image: '/hero/foam/foam4.png',
    mode: 'SILENCE',
    text: 'Hold.',
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
    <main className="min-h-screen bg-[#030405] text-white">
      <section className="relative min-h-[100dvh] overflow-hidden bg-[#030405]">
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

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,5,0.92)_0%,rgba(3,4,5,0.58)_14%,rgba(3,4,5,0.18)_42%,rgba(3,4,5,0.84)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-black/95 to-transparent" />

        <header className="relative z-20 flex items-center px-6 pt-6">
          <button
            type="button"
            onClick={() => router.push('/george')}
            className="flex h-[64px] w-[64px] items-center justify-center"
            aria-label="Open GEORGE"
          >
            <img src="/logofav.png" alt="Bx" className="h-[56px] w-[56px] object-contain opacity-95" />
          </button>
        </header>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
          <div className="relative w-full max-w-[980px] -translate-y-[4vh]">

            <div className="absolute left-1/2 top-1/2 h-[38vh] max-h-[330px] w-[82vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-white/18 bg-white/[0.015] shadow-[inset_0_0_80px_rgba(255,255,255,0.035),0_30px_120px_rgba(0,0,0,0.55)]" />

            <div className="absolute left-[9%] top-1/2 h-[36vh] max-h-[300px] w-[34vw] max-w-[390px] -translate-y-1/2 rounded-[999px] border border-white/24 bg-white/[0.018]" />

            <div className="absolute right-[9%] top-1/2 h-[36vh] max-h-[300px] w-[34vw] max-w-[390px] -translate-y-1/2 rounded-[999px] border border-white/24 bg-white/[0.018]" />

            <div className="mx-auto grid min-h-[38vh] max-w-[820px] grid-cols-2 items-center gap-12 px-8">
              <div className="max-w-[320px]">
                <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.34em] text-white/48">
                  {scene.mode}
                </div>
                <div className="font-mono text-[15px] leading-relaxed text-white/94 sm:text-[18px]">
                  {scene.text}
                </div>
              </div>

              <div className="max-w-[320px] justify-self-end text-right">
                <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.34em] text-white/48">
                  GEORGE
                </div>
                <div className="font-mono text-[15px] leading-relaxed text-white/90 sm:text-[18px]">
                  {scene.delivery}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-8">
          <div className="mx-auto max-w-[760px] rounded-[28px] border border-white/12 bg-black/36 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group flex h-[58px] items-center justify-between rounded-[18px] bg-white px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.28em] text-black transition hover:-translate-y-[1px]"
              >
                <span>Ask GEORGE</span>
                <span className="text-[22px] transition-transform group-hover:translate-x-1">→</span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[58px] items-center justify-between rounded-[18px] border border-white/18 bg-white/8 px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:-translate-y-[1px] hover:bg-white/12"
              >
                <span>Bring GEORGE into the room</span>
                <span className="text-[22px] transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#030405] px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
            <p className="max-w-5xl font-mono text-[26px] leading-[1.35] tracking-[-0.03em] text-white/92">
              GEORGE was created to facilitate human ambition, not replace it.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
            <p className="max-w-5xl font-mono text-[18px] leading-8 text-white/72">
              People build. People learn. People decide. People communicate. People solve problems. People pursue opportunities.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
            <p className="max-w-5xl font-mono text-[18px] leading-8 text-white/72">
              Outcomes improve when people have access to better information, stronger preparation, broader perspective, and support in the moments that matter.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
            <p className="max-w-5xl font-mono text-[18px] leading-8 text-white/72">
              Technology should expand human capability, not compete with it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#030405] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/40">
              Environment
            </div>

            <h2 className="mt-3 max-w-4xl font-mono text-[30px] font-semibold leading-tight tracking-[-0.04em] text-white">
              GEORGE adapts to your environment.
            </h2>

            <p className="mt-4 max-w-3xl font-mono text-[18px] leading-8 text-white/60">
              The environment changes. The objective does not.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
                Visible
              </div>
              <div className="font-mono text-[24px] text-white/92">
                Visible Interfaces
              </div>
              <p className="mt-4 font-mono leading-7 text-white/60">
                Desktop. Mobile. Displays. Surfaces designed for direct interaction.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
                Discreet
              </div>
              <div className="font-mono text-[24px] text-white/92">
                Discreet Interfaces
              </div>
              <p className="mt-4 font-mono leading-7 text-white/60">
                Technologies capable of accompanying users without becoming the center of attention.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/6 bg-white/[0.008] p-7">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
                Future
              </div>
              <div className="font-mono text-[24px] text-white/92">
                Future Interfaces
              </div>
              <p className="mt-4 font-mono leading-7 text-white/60">
                New ways for human and artificial intelligence to collaborate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
