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
      holdReason: shouldForwardToHub ? '' : execution.authority.reason,
    },
  }
}
