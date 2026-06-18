'use client'

import { useEffect } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import { routeGeorgeDeliveryCue } from '@/lib/george/live-delivery/delivery-router'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import type { GeorgeDeliveryMode } from '@/lib/george/live-delivery/types'

type LiveHubDeliveryBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
  mode?: GeorgeDeliveryMode
  onVisualCue?: (cue: string) => void
  onVoiceCue?: (cue: string) => void
  onSilentCue?: (cue: string) => void
}

export function LiveHubDeliveryBridge({
  active,
  context,
  mode = 'visual',
  onVisualCue,
  onVoiceCue,
  onSilentCue,
}: LiveHubDeliveryBridgeProps) {
  useEffect(() => {
    if (!active) return
    if (!isGeorgeLiveHubEnabled()) return

    const adapter = getGeorgeLiveHubRuntimeAdapter()

    const unsubscribe = adapter.subscribe((event) => {
      if (event.type !== 'ACTION_CUE') return

      const deliveryCue = routeGeorgeDeliveryCue({
        actionCue: event,
      })

      const resolvedDeliveryCue = {
        ...deliveryCue,
        mode,
      }

      console.info('[LIVE][hub][delivery] DELIVERY_CUE', resolvedDeliveryCue)

      markRuntimeEvent(resolvedDeliveryCue.text, 'delivery_cue')

      if (resolvedDeliveryCue.mode === 'visual') {
        onVisualCue?.(resolvedDeliveryCue.text)
        return
      }

      if (resolvedDeliveryCue.mode === 'voice') {
        onVoiceCue?.(resolvedDeliveryCue.text)
        return
      }

      onSilentCue?.(resolvedDeliveryCue.text)
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
    onVisualCue,
    onVoiceCue,
    onSilentCue,
  ])

  return null
}
