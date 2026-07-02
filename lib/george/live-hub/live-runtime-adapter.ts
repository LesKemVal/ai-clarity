import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import type { GeorgeActionCue, GeorgeLiveHubContext } from './types'
import { createGeorgeLiveHubWebSocketTransport } from './websocket-transport'
import type { GeorgeLiveHubTransport } from './transport'
import { finalizeGeorgeActionCueAuthority } from '@/lib/george/core/verification/action-cue-authority'

export type GeorgeLiveHubRuntimeEvent =
  | ({ type: 'ACTION_CUE' } & GeorgeActionCue)
  | { type: 'STATUS'; status: 'idle' | 'connecting' | 'connected' | 'error'; at: number }
  | { type: 'ERROR'; error: string; at: number }

export type GeorgeLiveHubRuntimeListener = (event: GeorgeLiveHubRuntimeEvent) => void

export type GeorgeLiveHubRuntimeAdapter = {
  connect: (context?: GeorgeLiveHubContext) => void
  syncContext: (context?: GeorgeLiveHubContext) => void
  disconnect: () => void
  sendTranscript: (text: string, isFinal?: boolean, turnId?: string) => void
  subscribe: (listener: GeorgeLiveHubRuntimeListener) => () => void
}

export function createGeorgeLiveHubRuntimeAdapter(params?: {
  url?: string
}): GeorgeLiveHubRuntimeAdapter {
  const listeners = new Set<GeorgeLiveHubRuntimeListener>()
  let transport: GeorgeLiveHubTransport | null = null
  let connected = false
  let currentContext: GeorgeLiveHubContext = {}
  const pendingTranscripts: Array<{ text: string; isFinal: boolean; turnId?: string }> = []

  const flushPendingTranscripts = () => {
    if (!connected) return
    while (pendingTranscripts.length) {
      const next = pendingTranscripts.shift()
      if (!next) continue

      console.info('[LIVE][hub][adapter] flush transcript', {
        text: next.text,
        isFinal: next.isFinal,
      })

      if (next.turnId) {
        markRuntimeEvent(next.turnId, 'hub_transcript_flushed')
      }

      transport?.sendJson?.({
        type: 'TRANSCRIPT_INPUT',
        text: next.text,
        isFinal: next.isFinal,
        turnId: next.turnId,
        deliveryStyle: currentContext.deliveryStyle,
      })
    }
  }

  const emit = (event: GeorgeLiveHubRuntimeEvent) => {
    listeners.forEach((listener) => listener(event))
  }

  return {
    connect(context?: GeorgeLiveHubContext) {
      currentContext = context || {}
      const url =
        params?.url ||
        process.env.NEXT_PUBLIC_LIVE_HUB_URL ||
        'ws://localhost:8080'

      emit({ type: 'STATUS', status: 'connecting', at: Date.now() })

      connected = false
      transport?.close()

      transport = createGeorgeLiveHubWebSocketTransport({
        url,
        handlers: {
          onOpen: () => {
            connected = true
            emit({ type: 'STATUS', status: 'connected', at: Date.now() })
            flushPendingTranscripts()
          },
          onClose: () => {
            connected = false
            emit({ type: 'STATUS', status: 'idle', at: Date.now() })
          },
          onError: (error) => {
            connected = false
            emit({ type: 'ERROR', error, at: Date.now() })
            emit({ type: 'STATUS', status: 'error', at: Date.now() })
          },
          onEvent: (event) => {
            if (event?.type !== 'ACTION_CUE') return

            const cleanCue = String(event?.cue || '').trim()
            if (!cleanCue) {
              console.info('[LIVE][hub][adapter] dropped empty ACTION_CUE', event)
              return
            }

            const finalizedEvent = finalizeGeorgeActionCueAuthority({
              actionCue: {
                ...event,
                cue: cleanCue,
              } as GeorgeActionCue,
              context: currentContext,
            })

            emit({
              ...event,
              ...finalizedEvent,
              turnId: finalizedEvent.turnId || event.turnId,
              evidence: finalizedEvent.evidence || event.evidence,
              cue: finalizedEvent.cue,
            } as GeorgeLiveHubRuntimeEvent)
          },
        },
      })

      transport.connect(context)
    },

    syncContext(context?: GeorgeLiveHubContext) {
      currentContext = context || {}
      if (!connected) return
      transport?.syncContext?.(currentContext)
    },

    disconnect() {
      connected = false
      pendingTranscripts.length = 0
      transport?.close()
      transport = null
      emit({ type: 'STATUS', status: 'idle', at: Date.now() })
    },

    sendTranscript(text: string, isFinal = true, turnId?: string) {
      const clean = String(text || '').trim()
      if (!clean) return

      if (!connected) {
        console.info('[LIVE][hub][adapter] queue transcript', {
        text: clean,
        isFinal,
        deliveryStyle: currentContext.deliveryStyle,
      })
        if (turnId) {
          markRuntimeEvent(turnId, 'hub_transcript_queued')
        }
        pendingTranscripts.push({ text: clean, isFinal, turnId })
        return
      }

      console.info('[LIVE][hub][adapter] send transcript', {
        text: clean,
        isFinal,
        deliveryStyle: currentContext.deliveryStyle,
      })

      transport?.sendJson?.({
        type: 'TRANSCRIPT_INPUT',
        text: clean,
        isFinal,
        turnId,
        deliveryStyle: currentContext.deliveryStyle,
      })
    },

    subscribe(listener: GeorgeLiveHubRuntimeListener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}


let singletonAdapter: GeorgeLiveHubRuntimeAdapter | null = null

export function getGeorgeLiveHubRuntimeAdapter() {
  if (!singletonAdapter) {
    singletonAdapter = createGeorgeLiveHubRuntimeAdapter()
  }

  return singletonAdapter
}
