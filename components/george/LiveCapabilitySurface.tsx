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
    if (phase === 'preparing') return

    const runFlip = () => {
      setFlipped(true)

      window.setTimeout(() => {
        setFlipped(false)
      }, 1200)
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
        className="inline-flex shrink-0 items-center whitespace-nowrap rounded-[0.55rem] border border-[#5678C8]/28 bg-[#172347]/54 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#B9C9F3]/74"
        aria-label="LIVE preparation in progress"
      >
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
      className="group relative inline-grid shrink-0 [perspective:900px]"
      aria-label={
        ready
          ? 'Start the prepared LIVE conversation'
          : 'Prepare LIVE support'
      }
    >
      <span
        className={`col-start-1 row-start-1 grid [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          flipped ? '[transform:rotateX(180deg)]' : ''
        }`}
      >
        <span className="col-start-1 row-start-1 inline-flex items-center justify-center whitespace-nowrap rounded-[0.55rem] border border-white/[0.075] bg-white/[0.018] px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.17em] text-[#D7DBE4]/62 [backface-visibility:hidden] transition group-hover:border-[#6F91DE]/30 group-hover:bg-[#172347]/38 group-hover:text-[#E4EBFF]/88">
          {front}
        </span>

        <span className="col-start-1 row-start-1 inline-flex items-center justify-center whitespace-nowrap rounded-[0.55rem] border border-[#5678C8]/30 bg-[#172347]/58 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.17em] text-[#DCE6FF]/82 [backface-visibility:hidden] [transform:rotateX(180deg)]">
          {back}
        </span>
      </span>
    </button>
  )
}
