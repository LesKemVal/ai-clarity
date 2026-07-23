'use client'

import { useEffect, useRef } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { routeGeorgeDeliveryCues } from '@/lib/george/live-delivery/delivery-router'
import { evaluateGeorgeDeliveryCommitment } from '@/lib/george/live-delivery/delivery-commitment'
import {
  getRuntimeTurnMetricRecords,
  markRuntimeEvent,
} from '@/lib/george/live-metrics/runtime-metrics'
import { resolveGeorgeLiveDeliveryDeadline } from '@/lib/george/live-metrics/latency-budgets.mjs'
import { resolveGeorgeDeliveryBehavior } from '@/lib/george/live-delivery/delivery-behavior-resolver'
import { commitGeorgeApprovedLiveDelivery } from '@/lib/george/live-runtime/approved-delivery-history'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import type {
  GeorgeDeliveryCue,
  GeorgeLiveDeliveryStyle,
  GeorgeLiveReceiverProfile,
} from '@/lib/george/live-delivery/types'

type LiveHubDeliveryBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  deliveryStyle?: GeorgeLiveDeliveryStyle
  receiverProfile?: GeorgeLiveReceiverProfile
  voiceEnabled?: boolean
  onVisualCue?: (cue: GeorgeDeliveryCue) => void
  onVoiceCue?: (cue: GeorgeDeliveryCue) => void
  onSilentCue?: (cue: GeorgeDeliveryCue) => void
}

export function LiveHubDeliveryBridge({
  active,
  context,
  deliveryStyle = 'advice',
  receiverProfile,
  voiceEnabled = false,
  onVisualCue,
  onVoiceCue,
  onSilentCue,
}: LiveHubDeliveryBridgeProps) {
  const deliveredCueByTurnRef = useRef<Record<string, { text: string; armedAt: number; committed?: boolean; deliveryStarted?: boolean; confidence?: number; priority?: number }>>({})

  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    const adapter = getGeorgeLiveHubRuntimeAdapter()

    const unsubscribe = adapter.subscribe((event) => {
      if (event.type !== 'ACTION_CUE') return

      const behaviorResolution = resolveGeorgeDeliveryBehavior({
        actionCue: event,
        deliveryStyle,
        desiredOutcome: context.objective,
      })

      if (behaviorResolution.fallbackApplied) {
        console.info('[LIVE][hub][delivery][behavior-fallback]', {
          reason: behaviorResolution.behaviorReason,
          actionCue: behaviorResolution.actionCue,
        })
      }

      const resolvedDeliveryCues = routeGeorgeDeliveryCues({
        actionCue: behaviorResolution.actionCue,
        context: {
          voiceEnabled,
          receiverProfile,
          deliveryStyle,
          room: context.room,
          objective: context.objective,
          knownContext: context.knownContext,
        },
      }).map((deliveryCue) => ({
        ...deliveryCue,
        turnId: event.turnId || deliveryCue.turnId,
        reason: behaviorResolution.behaviorReason || deliveryCue.reason,
      }))

      const candidateDeliveryCue =
        resolvedDeliveryCues.find((cue) => cue.mode !== 'silent') ||
        resolvedDeliveryCues[0]

      if (!candidateDeliveryCue) return

      const deliveryKey =
        candidateDeliveryCue.turnId || candidateDeliveryCue.text
      const deliveryDeadline = resolveGeorgeLiveDeliveryDeadline({
        records: getRuntimeTurnMetricRecords(deliveryKey),
        generatedAt: event.at,
        modes: resolvedDeliveryCues.map((cue) => cue.mode),
      })

      if (deliveryDeadline.action === 'suppress') {
        markRuntimeEvent(deliveryKey, 'delivery_deadline_suppressed')
        console.info('[LIVE][hub][delivery][deadline-suppressed]', {
          turnId: deliveryKey,
          ageMs: deliveryDeadline.ageMs,
          reason: deliveryDeadline.reason,
          suppressedModes: deliveryDeadline.suppressedModes,
        })
        return
      }

      const deadlineApprovedCues =
        deliveryDeadline.action === 'compress'
          ? resolvedDeliveryCues.filter((cue) =>
              deliveryDeadline.deliverModes.includes(cue.mode)
            )
          : resolvedDeliveryCues

      if (deliveryDeadline.action === 'compress') {
        markRuntimeEvent(deliveryKey, 'delivery_deadline_compressed')
        console.info('[LIVE][hub][delivery][deadline-compressed]', {
          turnId: deliveryKey,
          ageMs: deliveryDeadline.ageMs,
          reason: deliveryDeadline.reason,
          deliverModes: deliveryDeadline.deliverModes,
          suppressedModes: deliveryDeadline.suppressedModes,
        })
      }

      const resolvedDeliveryCue =
        deadlineApprovedCues.find((cue) => cue.mode !== 'silent') ||
        deadlineApprovedCues[0]

      if (!resolvedDeliveryCue) return
      const previousDelivery = deliveredCueByTurnRef.current[deliveryKey]

      const deliveryDecision = evaluateGeorgeDeliveryCommitment({
        current: previousDelivery,
        candidate: {
          text: resolvedDeliveryCue.text,
          now: Date.now(),
          generatedAt: event.at,
          confidence: resolvedDeliveryCue.confidence,
          priority: resolvedDeliveryCue.priority,
        },
      })

      if (deliveryDecision.action === 'suppress_duplicate') {
        markRuntimeEvent(deliveryKey, 'delivery_duplicate_suppressed')
        return
      }

      if (
        deliveryDecision.action === 'keep_armed' ||
        deliveryDecision.action === 'keep_committed'
      ) {
        markRuntimeEvent(deliveryKey, 'delivery_revision_suppressed')
        return
      }

      if (deliveryDecision.action === 'replace') {
        markRuntimeEvent(deliveryKey, 'delivery_revision')
      }

      deliveredCueByTurnRef.current[deliveryKey] = {
        text: resolvedDeliveryCue.text,
        armedAt: Date.now(),
        committed: true,
        deliveryStarted: resolvedDeliveryCue.mode === 'voice',
        confidence: resolvedDeliveryCue.confidence,
        priority: resolvedDeliveryCue.priority,
      }

      commitGeorgeApprovedLiveDelivery(resolvedDeliveryCue)

      for (const routedCue of deadlineApprovedCues) {
        console.info('[LIVE][hub][delivery] DELIVERY_CUE', routedCue)

        markRuntimeEvent(routedCue.turnId || deliveryKey, 'delivery_cue')

        if (routedCue.mode === 'visual') {
          onVisualCue?.(routedCue)
          continue
        }

        if (routedCue.mode === 'voice') {
          onVoiceCue?.(routedCue)
          continue
        }

        onSilentCue?.(routedCue)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [
    active,
    context.room,
    context.chair,
    context.objective,
    context.knownContext,
    context.userPosition,
    deliveryStyle,
    receiverProfile,
    voiceEnabled,
    onVisualCue,
    onVoiceCue,
    onSilentCue,
  ])

  return null
}
