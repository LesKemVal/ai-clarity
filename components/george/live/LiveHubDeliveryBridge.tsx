'use client'

import { useEffect, useRef } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { routeGeorgeDeliveryCues } from '@/lib/george/live-delivery/delivery-router'
import { evaluateGeorgeDeliveryCommitment } from '@/lib/george/live-delivery/delivery-commitment'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import { composeGeorgeSupportBehavior } from '@/lib/george/live-runtime/support-behavior-composer'
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

      /*
       * Behavior is resolved before receiver routing.
       *
       * The Behavior Composer determines what GEORGE should do. The delivery
       * router then shapes that same behavior independently for each active
       * receiver surface.
       */
      const responseModePlaceholder =
        deliveryStyle === 'response' &&
        event.source === 'local' &&
        /^(clarify before answering\.?|ask for clarification\.?|clarify\.?)/i.test(
          String(event.cue || '').trim()
        )

      let actionCueForDelivery = event
      let behaviorFallbackReason: string | undefined

      if (responseModePlaceholder) {
        const behaviorDecision = composeGeorgeSupportBehavior({
          desiredOutcome: context.objective,
          deliveryStyle,
          hasSafeResponse: false,
        })

        const fallbackText =
          behaviorDecision.operationalResource === 'silence'
            ? ''
            : behaviorDecision.operationalResource === 'cue'
              ? 'Buy a second. Ask them to clarify what they mean.'
              : 'Clarify before answering.'

        behaviorFallbackReason = behaviorDecision.reason
        actionCueForDelivery = {
          ...event,
          cue: fallbackText,
          category: 'operational_guidance',
          confidence: Math.max(event.confidence || 0, 0.7),
          priority: Math.max(event.priority || 0, 7),
        }

        console.info('[LIVE][hub][delivery][behavior-fallback]', {
          operationalResource: behaviorDecision.operationalResource,
          reason: behaviorDecision.reason,
          actionCue: actionCueForDelivery,
        })
      }

      const resolvedDeliveryCues = routeGeorgeDeliveryCues({
        actionCue: actionCueForDelivery,
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
        reason: behaviorFallbackReason || deliveryCue.reason,
      }))

      const resolvedDeliveryCue =
        resolvedDeliveryCues.find((cue) => cue.mode !== 'silent') ||
        resolvedDeliveryCues[0]

      if (!resolvedDeliveryCue) return

      const deliveryKey = resolvedDeliveryCue.turnId || resolvedDeliveryCue.text
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

      for (const routedCue of resolvedDeliveryCues) {
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
