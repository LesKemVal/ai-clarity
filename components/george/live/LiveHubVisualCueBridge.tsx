'use client'

import { useCallback, useEffect, useState } from 'react'
import { LiveHubDeliveryBridge } from './LiveHubDeliveryBridge'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'

type LiveHubVisualCueBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
}

type VisualCueState = {
  text: string
  at: number
}

export function LiveHubVisualCueBridge({
  active,
  context,
}: LiveHubVisualCueBridgeProps) {
  const [visualCue, setVisualCue] = useState<VisualCueState | null>(null)

  const handleVisualCue = useCallback((cue: string) => {
    const clean = String(cue || '').trim()
    if (!clean) return

    setVisualCue({
      text: clean,
      at: Date.now(),
    })
  }, [])

  useEffect(() => {
    if (!visualCue) return

    const timeout = window.setTimeout(() => {
      setVisualCue(null)
    }, 8000)

    return () => window.clearTimeout(timeout)
  }, [visualCue])

  return (
    <>
      <LiveHubDeliveryBridge
        active={active}
        context={context}
        mode="visual"
        onVisualCue={handleVisualCue}
      />

      {active && visualCue && (
        <div className="pointer-events-none fixed bottom-[108px] left-4 right-4 z-[70] md:left-auto md:right-6 md:w-[380px]">
          <div className="rounded-2xl border border-white/12 bg-[#0B0D12]/92 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
              GEORGE
            </div>
            <div className="text-sm leading-snug text-white/90">
              {visualCue.text}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
