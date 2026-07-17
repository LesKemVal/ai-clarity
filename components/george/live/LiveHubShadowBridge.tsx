'use client'

import { useEffect, useRef } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'

type LiveHubShadowBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  transcript?: string
  transcriptFinal?: boolean
}

export function LiveHubShadowBridge({
  active,
  context,
  transcript,
  transcriptFinal = true,
}: LiveHubShadowBridgeProps) {
  const lastForwardedTranscriptRef = useRef('')
  const lastTurnIdRef = useRef('')
  const pendingFinalTranscriptRef = useRef('')
  const pendingFinalTurnIdRef = useRef('')
  const finalTranscriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    const adapter = getGeorgeLiveHubRuntimeAdapter()

    const unsubscribe = adapter.subscribe((event) => {
      if (event.type !== 'ACTION_CUE') return

      console.info('[LIVE][hub][shadow] ACTION_CUE', {
        cue: event.cue,
        source: event.source,
        category: event.category,
        confidence: event.confidence,
        priority: event.priority,
      })

      markRuntimeEvent(event.turnId || lastTurnIdRef.current || event.cue, 'hub_action_cue_received')
    })

    adapter.connect(context)

    return () => {
      unsubscribe()
      adapter.disconnect()
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    getGeorgeLiveHubRuntimeAdapter().syncContext(context)
  }, [
    active,
    context.room,
    context.chair,
    context.objective,
    context.knownContext,
    context.userPosition,
    context.secondaryOutcome,
    context.secondaryObjective,
    context.intangibleObjective,
    context.deliveryStyle,
    context.runtimeSnapshot,
  ])

  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    const clean = String(transcript || '').trim()
    if (!clean) return

    const forwardTranscript = (
      text: string,
      isFinal: boolean,
      existingTurnId?: string
    ) => {
      if (!text) return
      if (lastForwardedTranscriptRef.current === text) return

      lastForwardedTranscriptRef.current = text

      console.info('[LIVE][hub][shadow] forwarding transcript', {
        text,
        isFinal,
      })

      const turnId =
        existingTurnId ||
        `live-hub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      lastTurnIdRef.current = turnId

      markRuntimeEvent(turnId, 'transcript_input')

      getGeorgeLiveHubRuntimeAdapter().sendTranscript(
        text,
        isFinal,
        turnId,
        context.deliveryStyle
      )
      markRuntimeEvent(turnId, 'hub_transcript_sent')
    }

    if (!transcriptFinal) {
      forwardTranscript(clean, false)
      return
    }

    pendingFinalTranscriptRef.current = [pendingFinalTranscriptRef.current, clean]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!pendingFinalTurnIdRef.current) {
      pendingFinalTurnIdRef.current =
        `live-hub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      markRuntimeEvent(
        pendingFinalTurnIdRef.current,
        'final_transcript_buffer_started'
      )
    } else {
      markRuntimeEvent(
        pendingFinalTurnIdRef.current,
        'final_transcript_buffer_extended'
      )
    }

    if (finalTranscriptTimerRef.current) {
      clearTimeout(finalTranscriptTimerRef.current)
    }

    finalTranscriptTimerRef.current = setTimeout(() => {
      const finalText = pendingFinalTranscriptRef.current.trim()
      const finalTurnId = pendingFinalTurnIdRef.current

      pendingFinalTranscriptRef.current = ''
      pendingFinalTurnIdRef.current = ''
      finalTranscriptTimerRef.current = null

      markRuntimeEvent(finalTurnId, 'final_transcript_buffer_released')
      forwardTranscript(finalText, true, finalTurnId)
    }, 275)

    return () => {
      if (finalTranscriptTimerRef.current) {
        clearTimeout(finalTranscriptTimerRef.current)
        finalTranscriptTimerRef.current = null
      }
    }
  }, [active, transcript, transcriptFinal, context.deliveryStyle])

  return null
}
