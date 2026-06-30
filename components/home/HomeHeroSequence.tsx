'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const scenarios = [
  {
    room: 'INTERVIEW',
    signals: ['interest present', 'needs proof', 'decision forming'],
    supportLabel: 'Say this:',
    support: 'Start with the result, then explain how you achieved it.',
  },
  {
    room: 'BOARDROOM',
    signals: ['evaluating ROI', 'assessing risk', 'consensus forming'],
    supportLabel: 'Lead with:',
    support: 'Projected impact first, then implementation.',
  },
  {
    room: 'NEGOTIATION',
    signals: ['price resistance', 'testing confidence', 'decision window'],
    supportLabel: 'Cue:',
    support: 'Return to value before discussing price.',
  },
]

const timeline = [
  ['room', 1200],
  ['signals_in', 4800],
  ['signals_out', 2300],
  ['support', 3200],
  ['hold', 1700],
] as const

const totalDuration = timeline.reduce((sum, [, duration]) => sum + duration, 0)

function getStage(tick: number) {
  let cursor = 0
  for (const [stage, duration] of timeline) {
    if (tick >= cursor && tick < cursor + duration) return { stage, stageTick: tick - cursor }
    cursor += duration
  }
  return { stage: 'hold', stageTick: 0 } as const
}

function useTypewriter(active: boolean, text: string) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!active) {
      setValue('')
      return
    }

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setValue(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, 34)

    return () => window.clearInterval(timer)
  }, [active, text])

  return value
}

function AudioMark() {
  return (
    <span className="flex h-[13px] w-[48px] items-center justify-center gap-[3px] opacity-90">
      {[7, 12, 17, 10, 14, 7, 11].map((height, index) => (
        <span
          key={index}
          className="w-[3px] rounded-full bg-[#37B7FF] shadow-[0_0_10px_rgba(55,183,255,0.55)]"
          style={{ height }}
        />
      ))}
    </span>
  )
}

export function HomeHeroSequence() {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const timer = window.setInterval(() => setElapsed(Date.now() - started), 80)
    return () => window.clearInterval(timer)
  }, [])

  const cycle = elapsed % totalDuration
  const scenario = scenarios[Math.floor(elapsed / totalDuration) % scenarios.length]
  const { stage, stageTick } = getStage(cycle)

  const roomTyped = useTypewriter(stage !== 'room' || stageTick > 150, scenario.room)
  const showSupport = stage === 'support' || stage === 'hold'
  const typedSupport = useTypewriter(stage === 'support', scenario.support)
  const renderedSupport = stage === 'hold' ? scenario.support : typedSupport

  const signalStates = useMemo(() => {
    if (stage !== 'signals_in' && stage !== 'signals_out') return []

    return scenario.signals.map((signal, index) => {
      const inAt = index * 820
      const visibleDuringIn = stage === 'signals_in' && stageTick >= inAt
      const outAt = index * 700
      const visibleDuringOut = stage === 'signals_out' && stageTick < outAt

      return {
        signal,
        visible: visibleDuringIn || visibleDuringOut,
        fadingOut: stage === 'signals_out' && stageTick >= outAt - 520 && stageTick < outAt,
      }
    }).filter((item) => item.visible)
  }, [scenario.signals, stage, stageTick])

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george/live-entry?source=start')
  }

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(255,255,255,0.055),transparent_34%),linear-gradient(180deg,#020303_0%,#000_100%)]" />

      <button
        type="button"
        onClick={() => router.push('/george')}
        className="absolute left-5 top-5 z-40 flex h-[58px] w-[58px] items-center justify-center"
        aria-label="Open GEORGE"
      >
        <img src="/logofav.png" alt="Bx" className="h-[52px] w-[52px] object-contain opacity-95" />
      </button>

      <div className="relative z-10 mx-auto h-[100dvh] w-full max-w-[1500px]">
        <div className="absolute left-[9%] top-[13%] z-30 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.34em] text-white/58">
          <span>GEORGE</span>
          <span className="h-px w-8 bg-white/18" />
          <span className="text-[9px] uppercase tracking-[0.28em] text-[#37B7FF]/82">audio</span>
        </div>

        <div className="absolute left-[9%] top-[19%] z-30 font-mono">
          <div className="text-[14px] uppercase tracking-[0.42em] text-[#4A90FF]/82 sm:text-[18px]">
            {roomTyped}
            <span className="ml-1 animate-pulse text-[#4A90FF]">|</span>
          </div>

          <div className="mt-5 flex flex-col items-start gap-3">
            {signalStates.map(({ signal, fadingOut }) => (
              <div
                key={signal}
                className={`transition-all duration-700 ${
                  fadingOut
                    ? 'opacity-0 translate-y-2'
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="text-[8px] uppercase tracking-[0.28em] text-[#E7C47D]/78">
                  thinking
                </div>

                <div className="mt-1 font-mono text-[11px] lowercase tracking-[0.12em] text-white/72">
                  {signal}
                </div>
              </div>
            ))}
          </div>
        </div>

        <img
          src="/hero/glasses21.png"
          alt="Generic AR glasses"
          className="absolute left-1/2 top-[50%] z-10 h-auto w-[112vw] max-w-[1450px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-95 sm:w-[96vw]"
        />

        {showSupport && (
          <div className="absolute left-1/2 bottom-[23%] z-30 w-[78%] max-w-[560px] -translate-x-1/2 text-left">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#E7C47D]/70">
              {scenario.supportLabel}
            </div>
            <div className="border-l border-[#C8A86A]/58 pl-4 font-mono text-[14px] leading-6 text-white/86 sm:text-[16px] sm:leading-7">
              {renderedSupport}
              {stage === 'support' && (
                <span className="ml-1 inline-block h-[1em] w-px translate-y-[3px] animate-pulse bg-white/60" />
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-x-5 bottom-5 z-40">
          <div className="mx-auto max-w-[760px] rounded-[26px] border border-white/12 bg-black/42 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group flex h-[56px] items-center justify-between rounded-[17px] bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-black transition hover:-translate-y-[1px]"
              >
                <span>Ask GEORGE</span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">→</span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[56px] items-center justify-between rounded-[17px] border border-white/18 bg-white/8 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:-translate-y-[1px] hover:bg-white/12"
              >
                <span>LIVE Support</span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
