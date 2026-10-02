import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import type { GeorgeActionCue, GeorgeLiveHubContext } from './types'
import { createGeorgeLiveHubWebSocketTransport } from './websocket-transport'
import type { GeorgeLiveHubTransport } from './transport'
import { finalizeGeorgeActionCueAuthority } from '@/lib/george/core/verification/action-cue-authority'
import type {
  GeorgeRuntimeAuthoritySnapshot,
} from '@/lib/george/runtime/runtime-pipeline'

export type GeorgeLiveHubRuntimeEvent =
  | ({ type: 'ACTION_CUE' } & GeorgeActionCue)
  | { type: 'STATUS'; status: 'idle' | 'connecting' | 'connected' | 'error'; at: number }
  | { type: 'ERROR'; error: string; at: number }

export type GeorgeLiveHubRuntimeListener = (event: GeorgeLiveHubRuntimeEvent) => void

export type GeorgeLiveHubRuntimeAdapter = {
  connect: (context?: GeorgeLiveHubContext) => void
  syncContext: (context?: GeorgeLiveHubContext) => void
  disconnect: () => void
  sendTranscript: (text: string, isFinal?: boolean, turnId?: string, deliveryStyle?: GeorgeLiveHubContext['deliveryStyle']) => void
  publishActionCue: (actionCue: GeorgeActionCue) => void
  subscribe: (listener: GeorgeLiveHubRuntimeListener) => () => void
}

type CurrentTurnResponseAuthority = Readonly<{
  source?: unknown
  realization?: unknown
  executionAccepted?: unknown
  preAcceptanceProviderTextUsed?: unknown
}>

export function buildGeorgeCurrentTurnOperationalActionCue(input: {
  turnId: string
  transcript: string
  cue: string
  generatedAt: number
  deliveryStyle?: GeorgeLiveHubContext['deliveryStyle']
  runtimeSnapshot: GeorgeRuntimeAuthoritySnapshot | null
  responseAuthority?: CurrentTurnResponseAuthority | null
}): GeorgeActionCue | null {
  const turnId = String(input.turnId || '').trim()
  const transcript = String(input.transcript || '').trim()
  const cue = String(input.cue || '').trim()
  const authority = input.responseAuthority
  const runtimeSnapshot = input.runtimeSnapshot
  const acceptedRealization =
    authority?.realization === 'canonical_presentation' ||
    (
      authority?.realization === 'provider_execution' &&
      authority.executionAccepted === true
    )

  if (
    !turnId ||
    !transcript ||
    !cue ||
    runtimeSnapshot?.source !== 'runtime_pipeline' ||
    runtimeSnapshot.operationalJudgment?.source !== 'operational_judgment' ||
    authority?.source !== 'operational_judgment' ||
    !acceptedRealization ||
    authority.preAcceptanceProviderTextUsed !== false
  ) {
    return null
  }

  const judgment = runtimeSnapshot.operationalJudgment
  const strategy = runtimeSnapshot.conversationStrategy
  const confidence = Math.max(0, Math.min(1, judgment.confidence || 0))

  return Object.freeze({
    turnId,
    cue,
    reason: 'Accepted by canonical Operational Judgment for the current LIVE turn.',
    operationalAssessment: Object.freeze({
      action: cue,
      outcomeImpact: judgment.outcomeState?.immediateOutcome,
      confidence,
    }),
    source: 'operational_judgment' as const,
    localCue: '',
    evidence: Object.freeze({
      transcript,
      recentTranscript: transcript,
      objective: judgment.outcomeState?.primaryOutcome,
      deliveryStyle: input.deliveryStyle,
      runtimeSnapshot,
    }),
    category: `${judgment.action}:${strategy.move}`,
    confidence,
    priority: Math.round(confidence * 100),
    at: input.generatedAt,
  })
}

export function createGeorgeLiveHubRuntimeAdapter(params?: {
  url?: string
}): GeorgeLiveHubRuntimeAdapter {
  const listeners = new Set<GeorgeLiveHubRuntimeListener>()
  let transport: GeorgeLiveHubTransport | null = null
  let connected = false
  let intentionalDisconnect = false
  let reconnectAttempt = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let transportGeneration = 0
  let currentContext: GeorgeLiveHubContext = {}
  let lastTranscriptRef = ''
  let lastTurnIdRef = ''
  type PendingTranscript = {
    text: string
    isFinal: boolean
    turnId?: string
    deliveryStyle?: GeorgeLiveHubContext['deliveryStyle']
  }

  const pendingTranscripts: PendingTranscript[] = []

  const sendTranscriptPacket = (
    transcript: Pick<PendingTranscript, 'text' | 'isFinal' | 'turnId'>,
    deliveryStyle?: GeorgeLiveHubContext['deliveryStyle']
  ) => {
    transport?.sendJson?.({
      type: 'TRANSCRIPT_INPUT',
      text: transcript.text,
      isFinal: transcript.isFinal,
      turnId: transcript.turnId,
      deliveryStyle,
    })
  }

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

      sendTranscriptPacket(next, next.deliveryStyle)
    }
  }

  const emit = (event: GeorgeLiveHubRuntimeEvent) => {
    listeners.forEach((listener) => listener(event))
  }

  const clearReconnectTimer = () => {
    if (!reconnectTimer) return
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  const scheduleReconnect = () => {
    if (intentionalDisconnect || reconnectTimer) return

    const delayMs = Math.min(1000 * (2 ** reconnectAttempt), 8000)
    reconnectAttempt += 1

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      if (intentionalDisconnect) return

      emit({ type: 'STATUS', status: 'connecting', at: Date.now() })
      openTransport()
    }, delayMs)
  }

  const acceptActionCue = (
    event: GeorgeActionCue & { type?: 'ACTION_CUE' }
  ) => {
    const cleanCue = String(event?.cue || '').trim()
    const eventTurnId = String(event?.turnId || '').trim()

    if (!eventTurnId) {
      console.warn('[LIVE][hub][adapter][action-cue-dropped-missing-turn-id]', {
        cue: event?.cue,
        source: event?.source,
      })
      return
    }

    const fallbackEvidence = {
      transcript: lastTranscriptRef,
      recentTranscript: lastTranscriptRef,
      room: currentContext.room,
      objective: currentContext.objective,
      knownContext: currentContext.knownContext,
      briefingKnowledge: currentContext.briefingKnowledge,
      secondaryOutcome: currentContext.secondaryOutcome,
      secondaryObjective: currentContext.secondaryObjective,
      intangibleObjective: currentContext.intangibleObjective,
      userPosition: currentContext.userPosition,
      deliveryStyle: currentContext.deliveryStyle,
      runtimeSnapshot: currentContext.runtimeSnapshot,
    }
    if (!cleanCue) {
      console.info('[LIVE][hub][adapter] dropped empty ACTION_CUE', event)
      return
    }

    console.info('[LIVE][hub][adapter][raw-action-cue]', {
      turnId: eventTurnId,
      cue: event.cue,
      source: event.source,
      hasEvidence: Boolean(event.evidence),
      evidence: event.evidence || fallbackEvidence,
    })

    const finalizedEvent = finalizeGeorgeActionCueAuthority({
      actionCue: {
        ...event,
        turnId: eventTurnId,
        evidence: event.evidence || fallbackEvidence,
        cue: cleanCue,
      } as GeorgeActionCue,
      context: currentContext,
    })

    const resolvedEvent = {
      ...event,
      ...finalizedEvent,
      type: 'ACTION_CUE' as const,
      turnId: finalizedEvent.turnId || eventTurnId,
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
  }

  const openTransport = () => {
    const url =
      params?.url ||
      process.env.NEXT_PUBLIC_LIVE_HUB_URL ||
      'ws://localhost:8080'

    const generation = ++transportGeneration

    transport?.close()
    connected = false

    transport = createGeorgeLiveHubWebSocketTransport({
      url,
      handlers: {
        onOpen: () => {
          if (generation !== transportGeneration || intentionalDisconnect) return

          connected = true
          reconnectAttempt = 0
          clearReconnectTimer()
          emit({ type: 'STATUS', status: 'connected', at: Date.now() })
          flushPendingTranscripts()
        },
        onClose: () => {
          if (generation !== transportGeneration) return

          connected = false
          emit({ type: 'STATUS', status: 'idle', at: Date.now() })
          scheduleReconnect()
        },
        onError: (error) => {
          if (generation !== transportGeneration) return

          connected = false
          emit({ type: 'ERROR', error, at: Date.now() })
          emit({ type: 'STATUS', status: 'error', at: Date.now() })
          scheduleReconnect()
        },
        onEvent: (event) => {
          if (generation !== transportGeneration) return
          if (event?.type !== 'ACTION_CUE') return
          acceptActionCue(
            event as { type: 'ACTION_CUE' } & GeorgeActionCue
          )
        },
      },
    })

    transport.connect(currentContext)
  }

  return {
    connect(context?: GeorgeLiveHubContext) {
      currentContext = context || {}
      intentionalDisconnect = false
      reconnectAttempt = 0
      clearReconnectTimer()

      console.info('[LIVE][hub][adapter][connect-context]', currentContext)
      emit({ type: 'STATUS', status: 'connecting', at: Date.now() })
      openTransport()
    },

    syncContext(context?: GeorgeLiveHubContext) {
      currentContext = context || {}
      console.info('[LIVE][hub][adapter][sync-context]', currentContext)
      if (!connected) return
      transport?.syncContext?.(currentContext)
    },

    disconnect() {
      intentionalDisconnect = true
      connected = false
      reconnectAttempt = 0
      clearReconnectTimer()
      pendingTranscripts.length = 0
      transportGeneration += 1
      transport?.close()
      transport = null
      emit({ type: 'STATUS', status: 'idle', at: Date.now() })
    },

    sendTranscript(text: string, isFinal = true, turnId?: string, deliveryStyle?: GeorgeLiveHubContext['deliveryStyle']) {
      const clean = String(text || '').trim()
      if (!clean) return

      lastTranscriptRef = clean
      lastTurnIdRef = turnId || lastTurnIdRef
      const resolvedDeliveryStyle = deliveryStyle || currentContext.deliveryStyle

      if (!connected) {
        console.info('[LIVE][hub][adapter] queue transcript', {
        text: clean,
        isFinal,
        deliveryStyle: resolvedDeliveryStyle,
      })
        if (turnId) {
          markRuntimeEvent(turnId, 'hub_transcript_queued')
        }
        pendingTranscripts.push({ text: clean, isFinal, turnId, deliveryStyle: resolvedDeliveryStyle })
        return
      }

      console.info('[LIVE][hub][adapter] send transcript', {
        text: clean,
        isFinal,
        deliveryStyle: resolvedDeliveryStyle,
      })
      console.info('[LIVE][hub][adapter][send-transcript-context]', currentContext)

      sendTranscriptPacket(
        {
          text: clean,
          isFinal,
          turnId,
        },
        resolvedDeliveryStyle
      )
    },

    publishActionCue(actionCue: GeorgeActionCue) {
      acceptActionCue({ type: 'ACTION_CUE', ...actionCue })
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
