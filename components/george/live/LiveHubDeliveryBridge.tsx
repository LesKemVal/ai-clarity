'use client'

import { useEffect, useRef } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { routeGeorgeDeliveryCue } from '@/lib/george/live-delivery/delivery-router'
import { evaluateGeorgeDeliveryCommitment } from '@/lib/george/live-delivery/delivery-commitment'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import { composeGeorgeSupportBehavior } from '@/lib/george/live-runtime/support-behavior-composer'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import type { GeorgeDeliveryCue, GeorgeDeliveryMode, GeorgeLiveDeliveryStyle } from '@/lib/george/live-delivery/types'

type LiveHubDeliveryBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  mode?: GeorgeDeliveryMode
  deliveryStyle?: GeorgeLiveDeliveryStyle
  onVisualCue?: (cue: GeorgeDeliveryCue) => void
  onVoiceCue?: (cue: GeorgeDeliveryCue) => void
  onSilentCue?: (cue: GeorgeDeliveryCue) => void
}

export function LiveHubDeliveryBridge({
  active,
  context,
  mode = 'visual',
  deliveryStyle = 'advice',
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

      const deliveryCue = routeGeorgeDeliveryCue({
        actionCue: event,
        context: {
          voiceEnabled: mode === 'voice',
          deliveryStyle,
          room: context.room,
          objective: context.objective,
          knownContext: context.knownContext,
        },
      })

      const resolvedDeliveryCue = {
        ...deliveryCue,
        turnId: event.turnId || deliveryCue.turnId,
        mode,
      }

      const responseModePlaceholder =
        deliveryStyle === 'response' &&
        event.source === 'local' &&
        /^(clarify before answering\.?|ask for clarification\.?|clarify\.?)/i.test(resolvedDeliveryCue.text.trim())

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

        const fallbackCue = {
          ...resolvedDeliveryCue,
          text: fallbackText,
          reason: behaviorDecision.reason,
          category: 'operational_guidance' as const,
          confidence: Math.max(resolvedDeliveryCue.confidence || 0, 0.7),
          priority: Math.max(resolvedDeliveryCue.priority || 0, 7),
        }

        console.info('[LIVE][hub][delivery][behavior-fallback]', {
          operationalResource: behaviorDecision.operationalResource,
          reason: behaviorDecision.reason,
          fallbackCue,
        })

        resolvedDeliveryCue.text = fallbackCue.text
        resolvedDeliveryCue.reason = fallbackCue.reason
        resolvedDeliveryCue.category = fallbackCue.category
        resolvedDeliveryCue.confidence = fallbackCue.confidence
        resolvedDeliveryCue.priority = fallbackCue.priority
      }

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

      console.info('[LIVE][hub][delivery] DELIVERY_CUE', resolvedDeliveryCue)

      markRuntimeEvent(resolvedDeliveryCue.turnId || deliveryKey, 'delivery_cue')

      if (resolvedDeliveryCue.mode === 'visual') {
        onVisualCue?.(resolvedDeliveryCue)
        return
      }

      if (resolvedDeliveryCue.mode === 'voice') {
        onVoiceCue?.(resolvedDeliveryCue)
        return
      }

      onSilentCue?.(resolvedDeliveryCue)
    })

    return () => {
      unsubscribe()
    }
  }, [
    active,
    mode,
    context.room,
    context.chair,
    context.objective,
    context.knownContext,
    context.userPosition,
    deliveryStyle,
    onVisualCue,
    onVoiceCue,
    onSilentCue,
  ])

  return null
}
