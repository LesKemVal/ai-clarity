'use client'

import { useEffect, useRef } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { routeGeorgeDeliveryCue } from '@/lib/george/live-delivery/delivery-router'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
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
  const deliveredCueByTurnRef = useRef<Record<string, string>>({})

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
        mode,
      }

      const deliveryKey = event.turnId || resolvedDeliveryCue.text
      const previousText = deliveredCueByTurnRef.current[deliveryKey]

      if (previousText && previousText === resolvedDeliveryCue.text) {
        markRuntimeEvent(deliveryKey, 'delivery_duplicate_suppressed')
        return
      }

      if (previousText && previousText !== resolvedDeliveryCue.text) {
        markRuntimeEvent(deliveryKey, 'delivery_revision')
      }

      deliveredCueByTurnRef.current[deliveryKey] = resolvedDeliveryCue.text

      console.info('[LIVE][hub][delivery] DELIVERY_CUE', resolvedDeliveryCue)

      markRuntimeEvent(deliveryKey, 'delivery_cue')

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
