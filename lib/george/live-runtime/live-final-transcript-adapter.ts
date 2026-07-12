import { resolveGeorgeCoreLiveExecution } from '@/lib/george/core/live-execution'
import type { LastLiveFinalTranscript } from '@/lib/george/live-runtime/transcript-routing'

export type LiveFinalTranscriptAdapterInput = {
  transcript: string
  lastFinalTranscript: LastLiveFinalTranscript | null
  isThinking: boolean
  isSpeaking: boolean
  liveMode: boolean
  buyTimeUntil: number
  lastSpokenLine: string
  overlapDetected: boolean
  desiredOutcome: string
  persistentSignals?: string[]
  deliveryStyle?: string
}

export function resolveLiveFinalTranscriptAction(input: LiveFinalTranscriptAdapterInput) {
  const transcript = String(input.transcript || '').trim()

  if (!transcript) return null

  const execution = resolveGeorgeCoreLiveExecution({
    transcript,
    lastFinalTranscript: input.lastFinalTranscript,
    routingContext: {
      isThinking: input.isThinking,
      isSpeaking: input.isSpeaking,
      liveMode: input.liveMode,
      buyTimeUntil: input.buyTimeUntil,
    },
    lastSpokenLine: input.lastSpokenLine,
    isGeorgeSpeaking: input.isSpeaking,
    isThinking: input.isThinking,
    overlapDetected: input.overlapDetected,
    overlapRequiresAttention: false,
    desiredOutcome: input.desiredOutcome,
    persistentSignals: input.persistentSignals,
  })

  const shouldForwardToHub =
    execution.authority.verdict === 'allow' &&
    execution.authority.action.type !== 'ignore'

  const hubTranscript =
    shouldForwardToHub && execution.authority.action.type === 'send'
      ? execution.authority.action.text
      : shouldForwardToHub
        ? transcript
        : ''

  const shouldSuppressLegacy =
    input.liveMode &&
    (input.deliveryStyle === 'continue' || input.deliveryStyle === 'response')

  return {
    ...execution,
    routing: {
      shouldForwardToHub,
      hubTranscript,
      shouldSuppressLegacy,
      shouldApplyLegacy: !shouldSuppressLegacy && execution.authority.action.type !== 'ignore',
      suppressedLegacyActionType: execution.authority.action.type,
      holdReason: shouldForwardToHub ? '' : execution.authority.reason,
    },
  }
}


export type LiveFinalTranscriptExecutionApplication = {
  shouldLogIgnored: boolean
  shouldStartBuyTime: boolean
  buyTimeDurationMs: number
  shouldSpeak: boolean
  speechText: string
  shouldSend: boolean
  sendText: string
  debugReason?: string
  debugVerdict?: string
  debugAction?: unknown
}

export function applyLiveFinalTranscriptExecution(execution: ReturnType<typeof resolveLiveFinalTranscriptAction>): LiveFinalTranscriptExecutionApplication {
  const authority = execution?.authority

  if (!execution || !authority || execution.routing.shouldSuppressLegacy) {
    return {
      shouldLogIgnored: false,
      shouldStartBuyTime: false,
      buyTimeDurationMs: 0,
      shouldSpeak: false,
      speechText: '',
      shouldSend: false,
      sendText: '',
    }
  }

  if (authority.action.type === 'ignore') {
    return {
      shouldLogIgnored: true,
      shouldStartBuyTime: false,
      buyTimeDurationMs: 0,
      shouldSpeak: false,
      speechText: '',
      shouldSend: false,
      sendText: '',
      debugReason: authority.reason,
      debugVerdict: authority.verdict,
      debugAction: authority.action,
    }
  }

  if (authority.action.type === 'start_buy_time') {
    return {
      shouldLogIgnored: false,
      shouldStartBuyTime: true,
      buyTimeDurationMs: authority.action.durationMs,
      shouldSpeak: false,
      speechText: '',
      shouldSend: false,
      sendText: '',
    }
  }

  if (
    authority.action.type === 'repeat' ||
    authority.action.type === 'recovery' ||
    authority.action.type === 'speak'
  ) {
    return {
      shouldLogIgnored: false,
      shouldStartBuyTime: false,
      buyTimeDurationMs: 0,
      shouldSpeak: true,
      speechText: authority.action.text,
      shouldSend: false,
      sendText: '',
    }
  }

  if (authority.action.type === 'send') {
    return {
      shouldLogIgnored: false,
      shouldStartBuyTime: false,
      buyTimeDurationMs: 0,
      shouldSpeak: false,
      speechText: '',
      shouldSend: true,
      sendText: authority.action.text,
    }
  }

  return {
    shouldLogIgnored: false,
    shouldStartBuyTime: false,
    buyTimeDurationMs: 0,
    shouldSpeak: false,
    speechText: '',
    shouldSend: false,
    sendText: '',
  }
}
