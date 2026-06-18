'use client'

import { useEffect } from 'react'
import { isGeorgeLiveHubEnabled } from '@/lib/george/live-hub/feature-flag'
import { getGeorgeLiveHubRuntimeAdapter } from '@/lib/george/live-hub/live-runtime-adapter'
import type { GeorgeLiveHubContext } from '@/lib/george/live-hub/types'

type LiveHubShadowBridgeProps = {
  active: boolean
  context: GeorgeLiveHubContext
}

export function LiveHubShadowBridge({
  active,
  context,
}: LiveHubShadowBridgeProps) {
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
    })

    adapter.connect(context)

    return () => {
      unsubscribe()
      adapter.disconnect()
    }
  }, [
    active,
    context.room,
    context.chair,
    context.objective,
    context.knownContext,
    context.userPosition,
  ])

  return null
}
