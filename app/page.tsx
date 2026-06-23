'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const scenes = [
  {
    image: '/hero/interview/interview10.png',
    overlays: false,
    renders: [
      'Not clear, not certain — you are on your own.',
    ],
  },
  {
    image: '/hero/interview/interview11.png',
    overlays: true,
    renders: [
      'Say: "I think the important question isn\'t whether I can do the work. It\'s how quickly I can begin creating value for the team."',
      'Say: "I think the important question isn\'t whether I can do the work. It\'s how quickly I can begin creating value for the team."',
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
  const [overlayVisible, setOverlayVisible] = useState(false)
  const scene = scenes[sceneIndex] || scenes[0]
  const sceneShowsOverlay = Boolean(scene.overlays)
  const liveRender = scene.renders[renderIndex % scene.renders.length] || scene.renders[0]
  const firstFrame = sceneIndex === 0

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length)
    }, 11200)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    setRenderIndex(0)
    setTypedRender('')
    setOverlayVisible(false)

    const overlayTimer = window.setTimeout(() => setOverlayVisible(true), 1700)

    return () => window.clearTimeout(overlayTimer)
  }, [sceneIndex])

  useEffect(() => {
    if (!overlayVisible) return

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
  }, [overlayVisible, sceneIndex, scene.renders.length])

  useEffect(() => {
    if (!overlayVisible) return

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
  }, [overlayVisible, liveRender])

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george/live-entry?source=start')
  }

  return (
    <main className="min-h-screen bg-[#030405] text-white">
      <section className="relative min-h-[100dvh] overflow-hidden bg-[#030405]">
        {scenes.map((item, index) => (
          <div
            key={`${item.image}-${index}`}
            className={`absolute inset-0 bg-cover bg-[center_top] sm:bg-center transition-opacity duration-[1400ms] ease-out ${
              index === sceneIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${item.image})`,
              transform: 'scale(1.005)',
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

        

        {firstFrame && (
          <div className="pointer-events-none absolute left-5 right-5 top-[22vh] z-30 sm:left-10 sm:right-auto sm:top-[27vh] sm:max-w-[760px]">
            <div className="max-w-[560px] rounded-[24px] border border-white/10 bg-black/34 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-5">
              <p className="font-serif text-[28px] leading-[1.05] tracking-[-0.04em] text-white sm:text-[42px]">
                Real-time support.
              </p>

              <div className="mt-4 space-y-3 text-[13px] leading-6 text-white/74 sm:text-[15px] sm:leading-7">
                <p>GEORGE provides real-time guidance through line-of-sight displays, discreet audio support, and other available interfaces.</p>
                <p>GEORGE observes relevant signals, considers context and objectives, and provides cues, guidance, and response support in pursuit of your desired outcome.</p>
              </div>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/52 sm:text-[11px]">
                Success is often determined by conversation.
              </p>
            </div>
          </div>
        )}

<div className="pointer-events-none absolute inset-0 z-10">



          {overlayVisible && sceneShowsOverlay && (
            <div className="absolute inset-0 px-4 pt-[12vh] sm:px-10 sm:pt-[14vh]">
              <div className="pointer-events-none absolute right-[148px] top-[14.5vh] hidden h-px w-[72px] bg-white/[0.18] sm:block" />
              <div className="pointer-events-none absolute right-[148px] top-[13.2vh] hidden font-mono text-[7px] uppercase tracking-[0.22em] text-white/34 sm:block">
                glasses signal layer
              </div>

              <div className="pointer-events-none absolute left-[5vw] top-[22vh] border-l border-white/[0.16] pl-2 font-mono sm:left-[10vw] sm:top-[28vh]">
                <div className="text-[7px] uppercase tracking-[0.26em] text-white/34">signal</div>
                <div className="mt-1 text-[10px] text-white/68 sm:text-[11px]">evaluating risk</div>
              </div>

              <div className="pointer-events-none absolute left-1/2 top-[19vh] -translate-x-1/2 border-l border-white/[0.14] pl-2 font-mono">
                <div className="text-[7px] uppercase tracking-[0.26em] text-white/32">signal</div>
                <div className="mt-1 text-[10px] text-white/64 sm:text-[11px]">shared objective</div>
              </div>

              <div className="pointer-events-none absolute right-[3vw] top-[15vh] border-l border-white/[0.16] pl-2 font-mono sm:right-[5vw] sm:top-[17vh]">
                <div className="text-[7px] uppercase tracking-[0.26em] text-white/34">signal</div>
                <div className="mt-1 text-[10px] text-white/68 sm:text-[11px]">needs proof</div>
              </div>

              <div className="pointer-events-none absolute left-[14vw] top-[42vh] border-l border-white/[0.12] pl-2 font-mono sm:left-[20vw] sm:top-[44vh]">
                <div className="text-[7px] uppercase tracking-[0.26em] text-white/30">signal</div>
                <div className="mt-1 text-[10px] text-white/62 sm:text-[11px]">interest present</div>
              </div>

              <div
                key={liveRender}
                className="absolute left-1/2 top-[48vh] w-[82vw] max-w-[520px] -translate-x-1/2 rounded-[14px] border border-white/[0.08] bg-black/[0.22] px-3.5 py-2.5 shadow-[0_18px_62px_rgba(0,0,0,0.34)] backdrop-blur-sm sm:top-[54vh] sm:px-4 sm:py-3"
              >
                <div className="mb-2 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.34em] text-white/38">
                  <span className="h-px w-7 bg-white/16" />
                  <span>
                    {liveRender.startsWith('Say:') || liveRender.startsWith('Ask:')
                      ? 'say'
                      : liveRender.startsWith('Cue:')
                        ? 'cue'
                        : 'observation'}
                  </span>
                </div>

                <div className="border-l border-white/[0.14] pl-3">
                  <div className="font-mono text-[11px] leading-5 tracking-[0.02em] text-white/82 sm:text-[14px] sm:leading-6">
                    {typedRender
                      .replace(/^Observation:\s*/i, '')
                      .replace(/^Cue:\s*/i, '')
                      .replace(/^Say:\s*/i, '')
                      .replace(/^Ask:\s*/i, '')}
                    <span className="ml-1 inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-white/58" />
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
              <div className="space-y-5 text-[15px] leading-7 text-black/68 md:text-[17px] md:leading-8">
                <p>Every decision is made from signals.</p>

                <p>A pause before an answer, a pricing objection, a change in tone, a deadline, a title, a concern, or a question that wasn't asked. These signals, if not missed, tell us something.</p>

                <p>Most people notice some of these signals. GEORGE can recognize, organize, remember, connect, reason and make sense of thousands of these &quot;tells&quot;, simultaneously - which can translate into better decisions, stronger relationships, improved negotiations, more sales, greater trust, better hiring decisions, better investments, reduced risk, increased revenue, and better outcomes overall.</p>

                <p>The more signal GEORGE receives, the better it understands the conversation, the people involved, the pressures that exist, and the outcomes that matter.</p>

                <p>Good decisions are often the result of recognizing the right signal at the right moment.</p>

                <p>GEORGE is designed to help users surface, understand, prioritize, and act on signal in real time.</p>
              </div>

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
              ['PREPARE', 'Upload enough information and start immediately, like a job ad + résumé. GEORGE will use that material to prepare you for the room.'],
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

      <footer className="bg-[#030405] px-6 py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <span>BRANESx by R. Block Share Holdings, LLC</span>
          <span>© 2026 R. Block Share Holdings, LLC. All rights reserved.</span>
        </div>
      </footer>

    </main>
  )
}
