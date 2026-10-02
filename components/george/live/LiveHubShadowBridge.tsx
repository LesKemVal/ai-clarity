'use client'

import { useEffect, useRef } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import { resolveLiveFinalTranscriptReleaseDelayMs } from '@/lib/george/live-runtime/final-transcript-release-policy'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import {
  normalizeGeorgeLiveSpeakerEvidence,
  UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE,
  type GeorgeLiveSpeakerEvidence,
} from '@/lib/george/core/live-execution'

type LiveHubShadowBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  transcript?: string
  transcriptFinal?: boolean
  speakerEvidence?: unknown
  onFinalTranscriptForwarded?: (input: {
    transcript: string
    turnId: string
    speakerEvidence: GeorgeLiveSpeakerEvidence
  }) => void
}

export function LiveHubShadowBridge({
  active,
  context,
  transcript,
  transcriptFinal = true,
  speakerEvidence,
  onFinalTranscriptForwarded,
}: LiveHubShadowBridgeProps) {
  const lastForwardedTranscriptRef = useRef('')
  const lastTurnIdRef = useRef('')
  const pendingFinalTranscriptRef = useRef('')
  const pendingFinalTurnIdRef = useRef('')
  const pendingFinalSpeakerEvidenceRef = useRef<GeorgeLiveSpeakerEvidence>(
    UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE
  )
  const finalTranscriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deliveryStyleRef = useRef(context.deliveryStyle)
  const onFinalTranscriptForwardedRef = useRef(onFinalTranscriptForwarded)

  const clearFinalTranscriptTimer = () => {
    if (!finalTranscriptTimerRef.current) return

    clearTimeout(finalTranscriptTimerRef.current)
    finalTranscriptTimerRef.current = null
  }

  const resetPendingFinalTranscript = () => {
    clearFinalTranscriptTimer()
    pendingFinalTranscriptRef.current = ''
    pendingFinalTurnIdRef.current = ''
    pendingFinalSpeakerEvidenceRef.current =
      UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE
  }

  useEffect(() => {
    deliveryStyleRef.current = context.deliveryStyle
  }, [context.deliveryStyle])

  useEffect(() => {
    onFinalTranscriptForwardedRef.current = onFinalTranscriptForwarded
  }, [onFinalTranscriptForwarded])

  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    return resetPendingFinalTranscript
  }, [active])

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
      existingTurnId?: string,
      finalSpeakerEvidence?: GeorgeLiveSpeakerEvidence
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
        deliveryStyleRef.current
      )
      markRuntimeEvent(turnId, 'hub_transcript_sent')

      if (isFinal) {
        onFinalTranscriptForwardedRef.current?.({
          transcript: text,
          turnId,
          speakerEvidence:
            finalSpeakerEvidence ||
            UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE,
        })
      }
    }

    if (!transcriptFinal) {
      forwardTranscript(clean, false)
      return
    }

    const hadPendingFinalTranscript = Boolean(
      pendingFinalTranscriptRef.current.trim()
    )

    pendingFinalTranscriptRef.current = [pendingFinalTranscriptRef.current, clean]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    const nextSpeakerEvidence = normalizeGeorgeLiveSpeakerEvidence(
      speakerEvidence
    )
    const pendingSpeakerEvidence = pendingFinalSpeakerEvidenceRef.current
    pendingFinalSpeakerEvidenceRef.current =
      !hadPendingFinalTranscript ||
      pendingSpeakerEvidence.speaker === nextSpeakerEvidence.speaker
        ? nextSpeakerEvidence
        : UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE

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

    clearFinalTranscriptTimer()

    const finalTranscriptReleaseDelayMs =
      resolveLiveFinalTranscriptReleaseDelayMs(
        pendingFinalTranscriptRef.current
      )

    finalTranscriptTimerRef.current = setTimeout(() => {
      const finalText = pendingFinalTranscriptRef.current.trim()
      const finalTurnId = pendingFinalTurnIdRef.current
      const finalSpeakerEvidence = pendingFinalSpeakerEvidenceRef.current

      pendingFinalTranscriptRef.current = ''
      pendingFinalTurnIdRef.current = ''
      pendingFinalSpeakerEvidenceRef.current =
        UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE
      finalTranscriptTimerRef.current = null

      if (!finalText || !finalTurnId) return

      markRuntimeEvent(finalTurnId, 'final_transcript_buffer_released')
      forwardTranscript(
        finalText,
        true,
        finalTurnId,
        finalSpeakerEvidence
      )
    }, finalTranscriptReleaseDelayMs)

  }, [active, speakerEvidence, transcript, transcriptFinal])

  return null
}
