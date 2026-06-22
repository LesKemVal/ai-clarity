'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveHubDeliveryBridge } from './LiveHubDeliveryBridge'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
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
  const lastRenderedAtRef = useRef(0)

  const handleVisualCue = useCallback((cue: GeorgeDeliveryCue) => {
    const clean = String(cue.text || '').trim()
    if (!clean) return
    if (lastCueRef.current === clean) return

    const now = Date.now()
    const cueAgeMs = now - lastRenderedAtRef.current
    const canInterruptCurrentCue =
      !visualCue ||
      cueAgeMs > 2600 ||
      cue.priority > currentPriorityRef.current + 18

    if (!canInterruptCurrentCue) return
    if (visualCue && cue.priority < currentPriorityRef.current) return

    lastCueRef.current = clean
    currentPriorityRef.current = cue.priority

    markRuntimeEvent(clean, 'visual_cue_received')

    lastRenderedAtRef.current = now

    setVisualCue({
      text: clean,
      priority: cue.priority,
      confidence: cue.confidence,
      source: cue.source,
      at: now,
    })

    if (voiceEnabled && cue.source === 'groq') {
      markRuntimeEvent(clean, 'voice_cue_requested')
      onSpeakCue?.(clean)
    }
  }, [onSpeakCue, visualCue, voiceEnabled])

  useEffect(() => {
    if (!active) {
      lastCueRef.current = ''
      currentPriorityRef.current = 0
      lastRenderedAtRef.current = 0
      setVisualCue(null)
    }
  }, [active])

  useEffect(() => {
    if (!visualCue) return

    markRuntimeEvent(visualCue.text, 'visual_cue_rendered')

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
        deliveryStyle={context.deliveryStyle as any}
        onVisualCue={handleVisualCue}
      />

      {active && visualCue && (
        <div className="pointer-events-none fixed bottom-[184px] left-6 right-6 z-[120] md:left-8 md:right-auto md:w-[440px]">
          <div className="rounded-2xl border border-emerald-300/20 bg-[#0B0D12]/96 px-5 py-4 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
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
