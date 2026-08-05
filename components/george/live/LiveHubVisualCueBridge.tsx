'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveHubDeliveryBridge } from './LiveHubDeliveryBridge'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import { subscribeGeorgeApprovedDeliveryReplay } from '@/lib/george/live-runtime/approved-delivery-history'
import {
  resolveGeorgeVisualPresentationPlan,
  type GeorgeVisualPresentationPlan,
} from '@/lib/george/live-delivery/visual-presentation-policy'
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

type VisualCueSource = Pick<
  GeorgeDeliveryCue,
  'turnId' | 'priority' | 'confidence' | 'source'
>

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
  const sequenceTimerRef = useRef<number | null>(null)
  const sequenceTokenRef = useRef(0)
  const activeRef = useRef(active)

  const cancelVisualSequence = useCallback(() => {
    sequenceTokenRef.current += 1

    if (sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current)
      sequenceTimerRef.current = null
    }
  }, [])

  const executeVisualPresentationPlan = useCallback(
    (cue: VisualCueSource, plan: GeorgeVisualPresentationPlan) => {
      if (
        plan.decision.action !== 'present' ||
        plan.stages.length === 0
      ) {
        return
      }

      cancelVisualSequence()
      const sequenceToken = sequenceTokenRef.current

      lastCueRef.current = plan.decision.text
      currentPriorityRef.current = plan.priority
      lastRenderedAtRef.current = plan.decision.now

      markRuntimeEvent(
        cue.turnId || plan.decision.text,
        'visual_cue_received'
      )

      const renderStage = (stageIndex: number) => {
        if (
          !activeRef.current ||
          sequenceTokenRef.current !== sequenceToken
        ) {
          return
        }

        const stage = plan.stages[stageIndex]
        if (!stage) return
        const renderedAt =
          stageIndex === 0 ? plan.decision.now : Date.now()

        lastRenderedAtRef.current = renderedAt

        setVisualCue({
          turnId: cue.turnId,
          text: stage.text,
          priority: cue.priority,
          confidence: cue.confidence,
          source: cue.source,
          at: renderedAt,
        })

        const isFinalStage = stageIndex === plan.stages.length - 1

        if (stage.durationMs <= 0) {
          if (!isFinalStage) renderStage(stageIndex + 1)
          return
        }

        sequenceTimerRef.current = window.setTimeout(() => {
          sequenceTimerRef.current = null

          if (
            !activeRef.current ||
            sequenceTokenRef.current !== sequenceToken
          ) {
            return
          }

          if (!isFinalStage) {
            renderStage(stageIndex + 1)
            return
          }

          currentPriorityRef.current = 0
          setVisualCue(null)
        }, stage.durationMs)
      }

      renderStage(0)
    },
    [cancelVisualSequence]
  )

  const handleVisualCue = useCallback(
    (cue: GeorgeDeliveryCue) => {
      const plan = resolveGeorgeVisualPresentationPlan({
        fallbackText: cue.text,
        operationalAssessment: cue.operationalAssessment,
        candidatePriority: cue.priority,
        receiverProfile,
        currentText: lastCueRef.current,
        currentPriority: currentPriorityRef.current,
        hasCurrentCue: Boolean(visualCue),
        lastRenderedAt: lastRenderedAtRef.current,
      })

      console.info('[LIVE][visual-bridge][candidate]', {
        clean: plan.decision.text,
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
        presentationAction: plan.decision.action,
        presentationReason: plan.decision.reason,
        presentationStageCount: plan.stages.length,
      })

      if (plan.decision.action === 'suppress') {
        console.info(
          '[LIVE][visual-bridge][blocked]',
          plan.decision.reason
        )
        return
      }

      executeVisualPresentationPlan(cue, plan)
    },
    [executeVisualPresentationPlan, receiverProfile, visualCue, voiceEnabled]
  )

  const handleVoiceCue = useCallback(
    (cue: GeorgeDeliveryCue) => {
      const clean = String(cue.text || '')
        .trim()
        .replace(/^[“”"'’]+|[“”"'’]+$/g, '')

      if (!clean) return

      markRuntimeEvent(
        cue.turnId || clean,
        'voice_cue_requested'
      )
      onSpeakCue?.(clean, cue.turnId)
    },
    [onSpeakCue]
  )

  useEffect(() => {
    activeRef.current = active

    if (!active) {
      cancelVisualSequence()
      lastCueRef.current = ''
      currentPriorityRef.current = 0
      lastRenderedAtRef.current = 0
      setVisualCue(null)
    }
  }, [active, cancelVisualSequence])

  useEffect(
    () => () => {
      activeRef.current = false
      cancelVisualSequence()
    },
    [cancelVisualSequence]
  )

  useEffect(() => {
    if (!active) return

    return subscribeGeorgeApprovedDeliveryReplay(({ delivery }) => {
      if (receiverProfile === 'audio_only') return

      const plan = resolveGeorgeVisualPresentationPlan({
        fallbackText: delivery.text,
        candidatePriority: delivery.priority,
        receiverProfile,
        currentText: '',
        currentPriority: 0,
        hasCurrentCue: false,
        lastRenderedAt: 0,
      })

      executeVisualPresentationPlan(delivery, plan)
    })
  }, [active, executeVisualPresentationPlan, receiverProfile])

  useEffect(() => {
    if (!visualCue) return

    markRuntimeEvent(
      visualCue.turnId || visualCue.text,
      'visual_cue_rendered'
    )
  }, [visualCue])

  return (
    <>
      <LiveHubDeliveryBridge
        active={active}
        context={context}
        deliveryStyle={context.deliveryStyle as any}
        receiverProfile={receiverProfile}
        voiceEnabled={voiceEnabled}
        onVisualCue={handleVisualCue}
        onVoiceCue={handleVoiceCue}
      />

      {active &&
        visualCue &&
        receiverProfile !== 'audio_only' && (
          <div className="pointer-events-none fixed bottom-[236px] left-6 right-6 z-[9999] md:left-8 md:right-auto md:w-[440px]">
            <div className="rounded-2xl border border-[#8FB6C9]/20 bg-[color:var(--surface-4)]/96 px-5 py-4 shadow-2xl shadow-[#8FB6C9]/20 backdrop-blur-xl">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--steel-300)]/42">
                GEORGE
              </div>

              <div className="whitespace-pre-line break-words text-sm leading-snug text-[color:var(--steel-100)]/90">
                {visualCue.text}
              </div>
            </div>
          </div>
        )}
    </>
  )
}
