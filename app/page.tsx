'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const scenes = [
  {
    image: '/hero/foam/foam1.png',
    renders: [
      'Observation: Decision maker listening.',
      'Cue: Lead with value.',
      'Say: "I think this aligns with what you are already building."',
    ],
  },
  {
    image: '/hero/foam/foam2.png',
    renders: [
      'Observation: Parent seeking reassurance.',
      'Cue: Reduce uncertainty.',
      'Say: "Here is what support will look like moving forward."',
    ],
  },
  {
    image: '/hero/foam/foam3.png',
    renders: [
      'Observation: Reception positive.',
      'Cue: Expand answer.',
      'Say: "I can walk through how I approached that challenge."',
    ],
  },
  {
    image: '/hero/foam/foam4.png',
    renders: [
      'Observation: Entrepreneur interested.',
      'Cue: Ask about current project.',
      'Ask: "What are you spending most of your time building right now?"',
    ],
  },
]

export default function HomePage() {
  const router = useRouter()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [glassesOn, setGlassesOn] = useState(false)
  const [glassesStep, setGlassesStep] = useState(0)
  const [renderIndex, setRenderIndex] = useState(0)
  const [typedRender, setTypedRender] = useState('')
  const scene = scenes[sceneIndex]
  const liveRender = scene.renders[renderIndex % scene.renders.length]

  useEffect(() => {
    const stepOne = window.setTimeout(() => setGlassesStep(1), 700)
    const stepTwo = window.setTimeout(() => setGlassesStep(2), 1400)
    const stepThree = window.setTimeout(() => setGlassesStep(3), 2100)
    const finishIntro = window.setTimeout(() => setGlassesOn(true), 3100)

    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length)
    }, 7000)

    return () => {
      window.clearTimeout(stepOne)
      window.clearTimeout(stepTwo)
      window.clearTimeout(stepThree)
      window.clearTimeout(finishIntro)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    setRenderIndex(0)
  }, [sceneIndex])

  useEffect(() => {
    if (!glassesOn) return

    const timer = window.setInterval(() => {
      setRenderIndex((current) => {
        const next = current + 1

        if (next >= scene.renders.length) {
          setSceneIndex((currentScene) => (currentScene + 1) % scenes.length)
          return 0
        }

        return next
      })
    }, 2800)

    return () => window.clearInterval(timer)
  }, [glassesOn, sceneIndex, scene.renders.length])

  useEffect(() => {
    if (!glassesOn) return

    setTypedRender('')

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedRender(liveRender.slice(0, index))

      if (index >= liveRender.length) {
        window.clearInterval(timer)
      }
    }, 26)

    return () => window.clearInterval(timer)
  }, [glassesOn, liveRender])

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

        
<div className="pointer-events-none absolute inset-0 z-10">

          {!glassesOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative transition-all duration-700 ease-out"
                style={{
                  transform: `scale(${[1, 1.45, 2.15, 3.15][glassesStep]})`,
                  opacity: [1, 0.88, 0.58, 0.12][glassesStep],
                }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">
                  AI GLASSES VIEW
                </div>

                <svg
                  viewBox="0 0 1200 520"
                  className="w-[92vw] max-w-[980px]"
                >
                  <path
                    d="M178 260 C178 152 246 102 365 102 C468 102 533 148 548 242 C566 203 598 184 640 184 C682 184 714 203 732 242 C747 148 812 102 915 102 C1034 102 1102 152 1102 260 C1102 365 1030 418 914 418 C795 418 740 355 732 271 C714 310 682 328 640 328 C598 328 566 310 548 271 C540 355 485 418 366 418 C250 418 178 365 178 260Z"
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="8"
                  />
                </svg>
              </div>
            </div>
          )}

          {glassesOn && (
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <div className="w-full max-w-[720px]">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-white/55">
                  GEORGE ACTIVE
                </div>

                <div
                  key={liveRender}
                  className="max-w-[680px] rounded-[22px] border border-white/10 bg-black/24 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.44)] backdrop-blur-sm"
                >
                  <div className="font-mono text-[20px] leading-relaxed text-white/94 sm:text-[28px]">
                    {typedRender}
                    <span className="ml-1 inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-white/70" />
                  </div>
                </div>
              </div>
            </div>
          )}

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

      <section className="bg-[#F4F3EE] px-6 py-14 text-black">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 border-b border-black/15 pb-12 md:grid-cols-[1.05fr_0.95fr]">
            <h1 className="max-w-3xl font-serif text-[42px] leading-[0.98] tracking-[-0.06em] md:text-[68px]">
              GEORGE helps you perform when words matter.
            </h1>

            <div className="max-w-2xl">
              <p className="text-[19px] leading-8 text-black/76 md:text-[22px]">
                Prepare GEORGE with the material that matters, then bring GEORGE into interviews, meetings, negotiations, presentations, doctor visits, and other rooms where the outcome depends on communication.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/george')}
                  className="rounded-[14px] bg-black px-6 py-4 font-mono text-[13px] uppercase tracking-[0.18em] text-white"
                >
                  Ask GEORGE
                </button>

                <button
                  type="button"
                  onClick={startLive}
                  className="rounded-[14px] border border-black/25 px-6 py-4 font-mono text-[13px] uppercase tracking-[0.18em] text-black"
                >
                  Try LIVE
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-black/12">
            {[
              ['PREPARE', 'Upload the job ad, résumé, notes, deck, offer, agenda, or context. GEORGE uses that material to understand what matters before the room starts.'],
              ['ENTER THE ROOM', 'Use GEORGE on desktop, mobile, glasses, or other discreet, consent-aware interfaces. The device is transport. GEORGE is the operating layer.'],
              ['GET SUPPORT', 'GEORGE can render a cue, line, response, presentation, continuation, or silence depending on what improves the outcome.'],
              ['STAY IN CONTROL', 'You decide what to accept, change, ignore, or say. GEORGE supports judgment; GEORGE does not replace it.'],
              ['ADAPT LIVE', 'Steering phrases let advanced users adjust tone, support type, delivery, or pacing without breaking the conversation.'],
            ].map(([label, body]) => (
              <div key={label} className="grid gap-5 py-8 md:grid-cols-[0.32fr_0.68fr]">
                <div className="font-mono text-[13px] uppercase tracking-[0.24em] text-black/58">
                  {label}
                </div>
                <p className="max-w-3xl text-[21px] leading-8 tracking-[-0.02em] text-black/82">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
