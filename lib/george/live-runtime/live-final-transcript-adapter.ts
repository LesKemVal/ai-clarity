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
}

export function resolveLiveFinalTranscriptAction(input: LiveFinalTranscriptAdapterInput) {
  const transcript = String(input.transcript || '').trim()

  if (!transcript) return null

  return resolveGeorgeCoreLiveExecution({
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
}
