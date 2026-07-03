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
  let lastTranscriptRef = ''
  let lastTurnIdRef = ''
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
      console.info('[LIVE][hub][adapter][connect-context]', currentContext)
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
            const fallbackEvidence = {
              transcript: lastTranscriptRef,
              room: currentContext.room,
              objective: currentContext.objective,
              knownContext: currentContext.knownContext,
              briefingKnowledge: currentContext.briefingKnowledge,
              secondaryOutcome: currentContext.secondaryOutcome,
              secondaryObjective: currentContext.secondaryObjective,
              intangibleObjective: currentContext.intangibleObjective,
              userPosition: currentContext.userPosition,
              deliveryStyle: currentContext.deliveryStyle,
            }
            if (!cleanCue) {
              console.info('[LIVE][hub][adapter] dropped empty ACTION_CUE', event)
              return
            }

            console.info('[LIVE][hub][adapter][raw-action-cue]', {
              turnId: event.turnId || lastTurnIdRef,
              cue: event.cue,
              source: event.source,
              hasEvidence: Boolean(event.evidence),
              evidence: event.evidence || fallbackEvidence,
            })

            const finalizedEvent = finalizeGeorgeActionCueAuthority({
              actionCue: {
                ...event,
                turnId: event.turnId || lastTurnIdRef,
                evidence: event.evidence || fallbackEvidence,
                cue: cleanCue,
              } as GeorgeActionCue,
              context: currentContext,
            })

            const resolvedEvent = {
              ...event,
              ...finalizedEvent,
              turnId: finalizedEvent.turnId || event.turnId || lastTurnIdRef,
              evidence: finalizedEvent.evidence || event.evidence || fallbackEvidence,
              cue: finalizedEvent.cue,
            } as ({ type: 'ACTION_CUE' } & GeorgeActionCue)

            const isResponseModeLocalCue =
              currentContext.deliveryStyle === 'response' &&
              resolvedEvent.source === 'local'

            if (isResponseModeLocalCue) {
              console.info('[LIVE][hub][adapter][local-action-cue-suppressed]', {
                turnId: resolvedEvent.turnId,
                cue: resolvedEvent.cue,
                source: resolvedEvent.source,
                deliveryStyle: currentContext.deliveryStyle,
              })
              return
            }

            console.info('[LIVE][hub][adapter][final-action-cue]', {
              turnId: resolvedEvent.turnId,
              cue: resolvedEvent.cue,
              source: resolvedEvent.source,
              hasEvidence: Boolean(resolvedEvent.evidence),
              evidence: resolvedEvent.evidence,
            })

            emit(resolvedEvent)
          },
        },
      })

      transport.connect(context)
    },

    syncContext(context?: GeorgeLiveHubContext) {
      currentContext = context || {}
      console.info('[LIVE][hub][adapter][sync-context]', currentContext)
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

      lastTranscriptRef = clean
      lastTurnIdRef = turnId || lastTurnIdRef

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
      console.info('[LIVE][hub][adapter][send-transcript-context]', currentContext)

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
