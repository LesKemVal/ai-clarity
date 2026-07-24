'use client'

import { useEffect, useState } from 'react'

export type LiveCapabilityPhase =
  | 'available'
  | 'preparing'
  | 'ready'

export function LiveCapabilitySurface({
  phase,
  emphasized = false,
  onPrepare,
  onStart,
}: {
  phase: LiveCapabilityPhase
  emphasized?: boolean
  onPrepare: () => void
  onStart: () => void
}) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (phase === 'preparing') {
      setFlipped(false)
      return
    }

    const runFlip = () => {
      setFlipped(true)

      window.setTimeout(() => {
        setFlipped(false)
      }, 1500)
    }

    if (phase === 'ready' || emphasized) {
      runFlip()
    }

    const interval =
      phase === 'ready' || emphasized
        ? window.setInterval(runFlip, 15 * 60 * 1000)
        : null

    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [phase, emphasized])

  if (phase === 'preparing') {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border border-[#4F78D8]/24 bg-[#172347]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BFD0FF]/68"
        aria-label="LIVE preparation in progress"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#75A4FF]/80 shadow-[0_0_12px_rgba(117,164,255,0.58)]" />
        Preparing LIVE
      </div>
    )
  }

  const ready = phase === 'ready'
  const front = ready ? 'START' : 'LIVE'
  const back = ready ? 'LIVE' : '?'

  return (
    <button
      type="button"
      onClick={ready ? onStart : onPrepare}
      className="group relative h-8 min-w-[76px] [perspective:900px]"
      aria-label={
        ready
          ? 'Start the prepared LIVE conversation'
          : 'Prepare LIVE support'
      }
    >
      <span
        className={`absolute inset-0 grid [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          flipped ? '[transform:rotateX(180deg)]' : ''
        }`}
      >
        <span className="col-start-1 row-start-1 inline-flex items-center justify-center rounded-full border border-[#4F78D8]/28 bg-[#172347]/76 px-3 text-[10px] font-semibold tracking-[0.2em] text-[#DDE7FF]/82 shadow-[0_8px_28px_rgba(12,27,68,0.24)] [backface-visibility:hidden] transition group-hover:border-[#75A4FF]/48 group-hover:text-white">
          {front}
        </span>

        <span className="col-start-1 row-start-1 inline-flex items-center justify-center rounded-full border border-[#4F78D8]/34 bg-[#20305E]/82 px-3 text-[10px] font-semibold tracking-[0.2em] text-[#E8EEFF]/88 shadow-[0_8px_28px_rgba(12,27,68,0.30)] [backface-visibility:hidden] [transform:rotateX(180deg)]">
          {back}
        </span>
      </span>
    </button>
  )
}
