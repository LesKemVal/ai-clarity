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
  ])

  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    const clean = String(transcript || '').trim()
    if (!clean) return
    if (lastForwardedTranscriptRef.current === clean) return

    lastForwardedTranscriptRef.current = clean

    console.info('[LIVE][hub][shadow] forwarding transcript', {
      text: clean,
      isFinal: transcriptFinal,
    })

    const turnId = `live-hub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    lastTurnIdRef.current = turnId

    markRuntimeEvent(turnId, 'transcript_input')

    getGeorgeLiveHubRuntimeAdapter().sendTranscript(clean, transcriptFinal, turnId)
    markRuntimeEvent(turnId, 'hub_transcript_sent')
  }, [active, transcript, transcriptFinal])

  return null
}
