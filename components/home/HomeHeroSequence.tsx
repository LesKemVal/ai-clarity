'use client'

import { useEffect, useRef, useState } from 'react'
import { requestFreshNormalBrowserSession } from '@/lib/george/session/store'

const heroSequences = [
  {
    title: ['GEORGE'],
    lines: [
      'Operational intelligence for conversations that matter.',
      'GEORGE helps you accomplish objectives, not simply answer questions.',
    ],
  },
  {
    title: ['PREPARE'],
    lines: [
      'Before the conversation.',
      'Understand the room, organize what matters, identify risks, and practice the moments that may determine the outcome.',
    ],
  },
  {
    title: ['LIVE SUPPORT'],
    lines: [
      'During the conversation.',
      'GEORGE recognizes meaningful signals and provides discreet guidance while the conversation is still unfolding and outcomes can still change.',
    ],
  },
  {
    title: ['CONVERSATION', 'REVIEW'],
    lines: [
      'After the conversation.',
      'Review what happened, understand why it mattered, preserve the evidence, and improve the next conversation.',
    ],
  },
]

type HeroFlipState = {
  front: number
  back: number
  flipped: boolean
  detailsIndex: number
  detailsVisible: boolean
  transitionEnabled: boolean
}

export function HomeHeroSequence() {
  const [flipState, setFlipState] = useState<HeroFlipState>({
    front: 0,
    back: 1,
    flipped: false,
    detailsIndex: 0,
    detailsVisible: true,
    transitionEnabled: true,
  })
  const [typedExplanation, setTypedExplanation] = useState('')
  const typewriterTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload()
        return
      }

      setFlipState({
        front: 0,
        back: 1,
        flipped: false,
        detailsIndex: 0,
        detailsVisible: true,
        transitionEnabled: true,
      })
    }

    window.addEventListener('pageshow', handlePageShow)

    let flipTimer: number | undefined
    let settleTimer: number | undefined
    let resetTimer: number | undefined

    const timer = window.setInterval(() => {
      setFlipState((current) => ({
        ...current,
        detailsVisible: false,
      }))

      flipTimer = window.setTimeout(() => {
        setFlipState((current) => ({
          ...current,
          flipped: true,
          transitionEnabled: true,
        }))
      }, 320)

      settleTimer = window.setTimeout(() => {
        setFlipState((current) => {
          const nextFront = current.back

          return {
            front: nextFront,
            back: (nextFront + 1) % heroSequences.length,
            flipped: false,
            detailsIndex: nextFront,
            detailsVisible: false,
            transitionEnabled: false,
          }
        })

        resetTimer = window.setTimeout(() => {
          setFlipState((current) => ({
            ...current,
            detailsVisible: true,
            transitionEnabled: true,
          }))
        }, 40)
      }, 1320)
    }, 8800)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.clearInterval(timer)

      if (flipTimer) window.clearTimeout(flipTimer)
      if (settleTimer) window.clearTimeout(settleTimer)
      if (resetTimer) window.clearTimeout(resetTimer)
    }
  }, [])

  useEffect(() => {
    if (!flipState.detailsVisible) {
      setTypedExplanation('')
      return
    }

    const explanation =
      heroSequences[flipState.detailsIndex]?.lines?.[1] || ''

    setTypedExplanation('')

    let characterIndex = 0

    const startTimer = window.setTimeout(() => {
      const typingTimer = window.setInterval(() => {
        characterIndex += 1
        setTypedExplanation(explanation.slice(0, characterIndex))

        if (characterIndex >= explanation.length) {
          window.clearInterval(typingTimer)
        }
      }, 22)

      typewriterTimerRef.current = typingTimer
    }, 520)

    return () => {
      window.clearTimeout(startTimer)

      if (typewriterTimerRef.current) {
        window.clearInterval(typewriterTimerRef.current)
        typewriterTimerRef.current = null
      }
    }
  }, [flipState.detailsIndex, flipState.detailsVisible])

  const startNormal = () => {
    requestFreshNormalBrowserSession()
    window.location.href = '/george'
  }

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    window.location.href = '/george/live-entry?source=start'
  }

  const renderHeroFace = (sequenceIndex: number) => {
    const sequence = heroSequences[sequenceIndex]

    return (
      <div className="flex flex-col items-start justify-center text-left">
        <div className="font-mono text-[38px] font-black uppercase leading-[0.92] tracking-[-0.07em] text-white sm:text-[66px] md:text-[82px]">
          {sequence.title.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    )
  }

  const detailSequence = heroSequences[flipState.detailsIndex]

  const getHeroFaceWidth = (sequenceIndex: number) => {
    const longestLine = Math.max(
      ...heroSequences[sequenceIndex].title.map((line) => line.length)
    )

    return Math.max(9, longestLine + 1.6)
  }

  const visibleHeroFaceWidth = flipState.flipped
    ? getHeroFaceWidth(flipState.back)
    : getHeroFaceWidth(flipState.front)

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_32%,rgba(55,183,255,0.09),transparent_30%),linear-gradient(180deg,#050607_0%,#000_100%)]" />

      <button
        type="button"
        onClick={startNormal}
        className="absolute left-5 top-5 z-40 flex h-[58px] w-[58px] items-center justify-center"
        aria-label="Open GEORGE"
      >
        <img
          src="/logofav.png"
          alt="Bx"
          className="h-[52px] w-[52px] object-contain opacity-95"
        />
      </button>

      <div className="relative z-10 mx-auto h-[100dvh] w-full max-w-[1500px]">
        <div className="absolute left-[6.5%] right-[5%] top-[15%] z-30 max-w-[1120px] [perspective:1600px]">
          <div className="inline-flex w-fit items-center rounded-full border border-[#7EA1FF]/32 bg-[#4E7CFF] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_8px_24px_rgba(20,61,168,0.18)]">
            GEORGE
          </div>

          <div
            className={`relative mt-6 grid max-w-full [transform-style:preserve-3d] ${
              flipState.transitionEnabled
                ? 'transition-[transform,width] duration-[900ms] ease-[cubic-bezier(0.22,0.72,0.18,1)]'
                : ''
            }`}
            style={{
              width: `min(calc(100vw - 48px), ${visibleHeroFaceWidth}ch)`,
              transform: flipState.flipped
                ? 'rotateX(180deg)'
                : 'rotateX(0deg)',
            }}
          >
            <div className="col-start-1 row-start-1 w-fit max-w-[calc(100vw-48px)] [backface-visibility:hidden]">
              {renderHeroFace(flipState.front)}
            </div>

            <div className="col-start-1 row-start-1 w-fit max-w-[calc(100vw-48px)] [backface-visibility:hidden] [transform:rotateX(180deg)]">
              {renderHeroFace(flipState.back)}
            </div>
          </div>

          <div
            className={`mt-5 grid w-full max-w-[820px] justify-items-start gap-3.5 pr-4 text-left transition-all duration-300 sm:pr-8 ${
              flipState.detailsVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-3 opacity-0'
            }`}
          >
            <div
              key={`${detailSequence.title.join('-')}-tagline`}
              className={`max-w-[820px] text-left font-mono text-[20px] font-semibold uppercase leading-[1.18] tracking-[0.085em] text-white/92 transition-all duration-300 sm:text-[30px] md:text-[36px] ${
                flipState.detailsVisible
                  ? 'translate-y-0 opacity-100 blur-0'
                  : '-translate-y-2 opacity-0 blur-[2px]'
              }`}
            >
              {detailSequence.lines[0]}
            </div>

            <div
              key={`${detailSequence.title.join('-')}-explanation`}
              className={`mt-2 max-w-[760px] pr-2 text-left font-mono text-[16px] font-medium normal-case leading-7 tracking-[0.01em] text-white/68 transition-opacity duration-300 sm:text-[19px] sm:leading-8 md:text-[21px] md:leading-9 ${
                flipState.detailsVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {typedExplanation}

              {flipState.detailsVisible &&
                typedExplanation.length <
                  (detailSequence.lines[1]?.length || 0) && (
                  <span className="ml-1 inline-block h-[0.9em] w-px animate-pulse bg-white/52 align-middle" />
                )}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 z-40">
          <div className="mx-auto max-w-[1040px] rounded-[26px] border border-white/12 bg-black/42 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={startNormal}
                className="group flex h-[56px] w-full items-center justify-between rounded-[17px] bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-black transition hover:-translate-y-[1px]"
              >
                <span>
                  Ask GEORGE{' '}
                  <span className="text-black/45">(Prepare)</span>
                </span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[56px] w-full items-center justify-between rounded-[17px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(20,61,168,0.22)] transition hover:-translate-y-[1px] hover:bg-[#5B86FF]"
              >
                <span>
                  LIVE Support{' '}
                  <span className="text-white/70">(Execute)</span>
                </span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/help'
                }}
                className="group flex h-[56px] w-full items-center justify-between rounded-[17px] border border-white/14 bg-black px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:-translate-y-[1px] hover:border-white/24 hover:bg-white/[0.03]"
              >
                <span>
                  Help{' '}
                  <span className="text-white/42">
                    (How to use GEORGE)
                  </span>
                </span>
                <span className="text-[18px] text-white/66 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
