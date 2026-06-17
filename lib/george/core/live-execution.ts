import {
  routeLiveTranscript,
  type LastLiveFinalTranscript,
  type LiveTranscriptRoutingContext,
} from '@/lib/george/live-runtime/transcript-routing'
import { resolveLiveTranscriptDecision } from '@/lib/george/live-runtime/live-transcript-controller'
import {
  authorizeLiveTranscriptAction,
  type LiveActionAuthorityResult,
} from '@/lib/george/live-runtime/live-action-authority'

export type GeorgeCoreLiveExecutionInput = {
  transcript: string
  lastFinalTranscript: LastLiveFinalTranscript
  routingContext?: LiveTranscriptRoutingContext
  lastSpokenLine?: string
  isGeorgeSpeaking: boolean
  isThinking: boolean
  overlapDetected?: boolean
  overlapRequiresAttention?: boolean
  desiredOutcome?: string
  now?: number
}

export type GeorgeCoreLiveExecutionResult = {
  nextFinalTranscript: LastLiveFinalTranscript
  authority: LiveActionAuthorityResult
}

export function resolveGeorgeCoreLiveExecution(
  input: GeorgeCoreLiveExecutionInput
): GeorgeCoreLiveExecutionResult {
  const routed = routeLiveTranscript({
    text: input.transcript,
    lastFinalTranscript: input.lastFinalTranscript,
    context: input.routingContext,
    now: input.now,
  })

  const action = resolveLiveTranscriptDecision({
    decision: routed.decision,
    transcript: input.transcript,
    lastSpokenLine: input.lastSpokenLine || '',
  })

  const authority = authorizeLiveTranscriptAction({
    transcript: input.transcript,
    decision: routed.decision,
    action,
    isGeorgeSpeaking: input.isGeorgeSpeaking,
    isThinking: input.isThinking,
    overlapDetected: input.overlapDetected,
    overlapRequiresAttention: input.overlapRequiresAttention,
    lastSpokenLine: input.lastSpokenLine || '',
    desiredOutcome: input.desiredOutcome,
  })

  return {
    nextFinalTranscript: routed.nextFinalTranscript,
    authority,
  }
}
