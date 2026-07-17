'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveHubDeliveryBridge } from './LiveHubDeliveryBridge'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import { subscribeGeorgeApprovedDeliveryReplay } from '@/lib/george/live-runtime/approved-delivery-history'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import type {
  GeorgeDeliveryCue,
  GeorgeLiveReceiverProfile,
} from '@/lib/george/live-delivery/types'

type LiveHubVisualCueBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  voiceEnabled?: boolean
  receiverProfile?: GeorgeLiveReceiverProfile
  onSpeakCue?: (cue: string, turnId?: string) => void
}

type VisualCueState = {
  turnId?: string
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
  receiverProfile = voiceEnabled ? 'audio_visual' : 'visual_only',
  onSpeakCue,
}: LiveHubVisualCueBridgeProps) {
  const [visualCue, setVisualCue] = useState<VisualCueState | null>(null)
  const lastCueRef = useRef('')
  const currentPriorityRef = useRef(0)
  const lastRenderedAtRef = useRef(0)

  const handleVisualCue = useCallback((cue: GeorgeDeliveryCue) => {
    const clean = String(cue.text || '')
      .trim()
      .replace(/^[“”"']+|[“”"']+$/g, '')

    console.info('[LIVE][visual-bridge][candidate]', {
      clean,
      source: cue.source,
      priority: cue.priority,
      confidence: cue.confidence,
      receiverProfile,
      voiceEnabled,
      hasVisualCue: Boolean(visualCue),
      lastCue: lastCueRef.current,
      currentPriority: currentPriorityRef.current,
      ageMs: Date.now() - lastRenderedAtRef.current,
      turnId: cue.turnId,
    })

    if (!clean) {
      console.info('[LIVE][visual-bridge][blocked]', 'empty')
      return
    }

    if (lastCueRef.current === clean) {
      console.info('[LIVE][visual-bridge][blocked]', 'duplicate')
      return
    }

    const now = Date.now()
    const cueAgeMs = now - lastRenderedAtRef.current
    const canInterruptCurrentCue =
      !visualCue ||
      cueAgeMs > 2600 ||
      cue.priority > currentPriorityRef.current + 18

    if (!canInterruptCurrentCue) {
      console.info('[LIVE][visual-bridge][blocked]', 'current cue hold')
      return
    }

    if (visualCue && cue.priority < currentPriorityRef.current) {
      console.info('[LIVE][visual-bridge][blocked]', 'lower priority')
      return
    }

    lastCueRef.current = clean
    currentPriorityRef.current = cue.priority

    markRuntimeEvent(cue.turnId || clean, 'visual_cue_received')

    lastRenderedAtRef.current = now

    setVisualCue({
      turnId: cue.turnId,
      text: clean,
      priority: cue.priority,
      confidence: cue.confidence,
      source: cue.source,
      at: now,
    })

    const shouldSpeakCue =
      receiverProfile !== 'visual_only' &&
      voiceEnabled &&
      cue.source === 'groq'

    if (shouldSpeakCue) {
      markRuntimeEvent(cue.turnId || clean, 'voice_cue_requested')
      onSpeakCue?.(clean, cue.turnId)
    }
  }, [onSpeakCue, receiverProfile, visualCue, voiceEnabled])

  useEffect(() => {
    if (!active) {
      lastCueRef.current = ''
      currentPriorityRef.current = 0
      lastRenderedAtRef.current = 0
      setVisualCue(null)
    }
  }, [active])

  useEffect(() => {
    if (!active) return

    return subscribeGeorgeApprovedDeliveryReplay(({ delivery }) => {
      if (receiverProfile === 'audio_only') return

      const now = Date.now()

      lastCueRef.current = delivery.text
      currentPriorityRef.current = delivery.priority
      lastRenderedAtRef.current = now

      setVisualCue({
        turnId: delivery.turnId,
        text: delivery.text,
        priority: delivery.priority,
        confidence: delivery.confidence,
        source: delivery.source,
        at: now,
      })

      markRuntimeEvent(
        delivery.turnId || delivery.text,
        'visual_cue_received'
      )
    })
  }, [active, receiverProfile])

  useEffect(() => {
    if (!visualCue) return

    markRuntimeEvent(visualCue.turnId || visualCue.text, 'visual_cue_rendered')

    const holdMs =
      receiverProfile === 'audio_only'
        ? 0
        : receiverProfile === 'audio_visual'
          ? 12000
          : 12000

    if (holdMs <= 0) return

    const timeout = window.setTimeout(() => {
      currentPriorityRef.current = 0
      setVisualCue(null)
    }, holdMs)

    return () => window.clearTimeout(timeout)
  }, [receiverProfile, visualCue])

  return (
    <>
      <LiveHubDeliveryBridge
        active={active}
        context={context}
        mode={receiverProfile === 'audio_only' ? 'voice' : 'visual'}
        deliveryStyle={context.deliveryStyle as any}
        receiverProfile={receiverProfile}
        voiceEnabled={voiceEnabled}
        onVisualCue={handleVisualCue}
        onVoiceCue={handleVisualCue}
      />

      {active && visualCue && receiverProfile !== 'audio_only' && (
        <div className="pointer-events-none fixed bottom-[236px] left-6 right-6 z-[9999] md:left-8 md:right-auto md:w-[440px]">
          <div className="rounded-2xl border border-[#8FB6C9]/20 bg-[#0B0D12]/96 px-5 py-4 shadow-2xl shadow-[#8FB6C9]/20 backdrop-blur-xl">
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
