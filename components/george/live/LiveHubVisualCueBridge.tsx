'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveHubDeliveryBridge } from './LiveHubDeliveryBridge'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import type { GeorgeDeliveryCue } from '@/lib/george/live-delivery/types'

type LiveHubVisualCueBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  voiceEnabled?: boolean
  onSpeakCue?: (cue: string) => void
}

type VisualCueState = {
  text: string
  priority: number
  confidence: number
  source: GeorgeDeliveryCue['source']
  at: number
}

export function LiveHubVisualCueBridge({
  active,
  context,
  voiceEnabled = false,
  onSpeakCue,
}: LiveHubVisualCueBridgeProps) {
  const [visualCue, setVisualCue] = useState<VisualCueState | null>(null)
  const lastCueRef = useRef('')
  const currentPriorityRef = useRef(0)

  const handleVisualCue = useCallback((cue: GeorgeDeliveryCue) => {
    const clean = String(cue.text || '').trim()
    if (!clean) return
    if (lastCueRef.current === clean) return
    if (visualCue && cue.priority < currentPriorityRef.current) return

    lastCueRef.current = clean
    currentPriorityRef.current = cue.priority

    setVisualCue({
      text: clean,
      priority: cue.priority,
      confidence: cue.confidence,
      source: cue.source,
      at: Date.now(),
    })

    if (voiceEnabled) {
      onSpeakCue?.(clean)
    }
  }, [onSpeakCue, visualCue, voiceEnabled])

  useEffect(() => {
    if (!active) {
      lastCueRef.current = ''
      currentPriorityRef.current = 0
      setVisualCue(null)
    }
  }, [active])

  useEffect(() => {
    if (!visualCue) return

    const timeout = window.setTimeout(() => {
      currentPriorityRef.current = 0
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
