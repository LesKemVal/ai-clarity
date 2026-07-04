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
import { classifyLiveSpeakerIntent } from '@/lib/george/core/live-speaker-intent'
import type { LiveTranscriptControllerAction } from '@/lib/george/live-runtime/live-transcript-controller'
import type { LiveTranscriptDecision } from '@/lib/george/live-runtime/transcript-routing'
import { buildGeorgeOperationalUnderstanding } from '@/lib/george/core/operational-understanding'

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

function makeIgnoredLiveAuthority(params: {
  decision: LiveTranscriptDecision
  action: LiveTranscriptControllerAction
  reason: string
  confidence: number
}): LiveActionAuthorityResult {
  return {
    verdict: 'block',
    action: params.action,
    maySpeak: false,
    shouldSend: false,
    shouldHold: false,
    reason: params.reason,
    confidence: params.confidence,
    telemetry: {
      source: 'live_action_authority',
      verdict: 'block',
      actionType: params.action.type,
      decisionType: params.decision.type,
      reason: params.reason,
      confidence: params.confidence,
    },
  }
}

function isEnvironmentalOrSocialTranscript(transcript: string) {
  const text = String(transcript || '').trim().toLowerCase()

  if (!text) return false

  return /\b(turn on the lights|turn off the lights|lights on|lights off|too hot|hotter down here|too cold|thermostat|temperature|coffee|bathroom|pee is clear|bathroom break|i'll be back|be right back|food is here|parking|weather outside)\b/i.test(text)
}

function isOutcomeRelevantTranscript(transcript: string, desiredOutcome?: string) {
  const text = String(transcript || '').trim().toLowerCase()
  const outcome = String(desiredOutcome || '').trim().toLowerCase()

  if (!text) return false

  if (/\b(george|branesx|enterprise|adopt|adoption|deploy|deployment|pilot|roi|business value|productivity|privacy|security|integration|scale|scalability|investment|partnership|licensing|objection|concern|risk|proof|evidence|metrics|outcome|decision)\b/i.test(text)) {
    return true
  }

  if (outcome && text.split(/\s+/).some((token) => token.length > 5 && outcome.includes(token))) {
    return true
  }

  return false
}

export function resolveGeorgeCoreLiveExecution(
  input: GeorgeCoreLiveExecutionInput
): GeorgeCoreLiveExecutionResult {
  const understanding = buildGeorgeOperationalUnderstanding({
    transcript: input.transcript,
    objective: input.desiredOutcome,
  })

  const speakerIntent = classifyLiveSpeakerIntent({
    transcript: input.transcript,
    knownUserSpeaking: false,
    objective: understanding.operationalObjective || null,
  })

  const environmentalOrSocial = isEnvironmentalOrSocialTranscript(input.transcript)
  const outcomeRelevant = isOutcomeRelevantTranscript(input.transcript, understanding.operationalObjective)

  if (
    environmentalOrSocial &&
    !outcomeRelevant &&
    speakerIntent.intent !== 'addressed_to_george'
  ) {
    const decision: LiveTranscriptDecision = {
      type: 'ignore',
      reason: 'environmental_or_social_transcript_not_outcome_relevant',
    }
    const action: LiveTranscriptControllerAction = { type: 'ignore' }

    return {
      nextFinalTranscript: input.lastFinalTranscript,
      authority: makeIgnoredLiveAuthority({
        decision,
        action,
        reason: 'Transcript appears environmental or social and does not advance the LIVE outcome.',
        confidence: 0.88,
      }),
    }
  }

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
    desiredOutcome: understanding.operationalObjective,
  })

  return {
    nextFinalTranscript: routed.nextFinalTranscript,
    authority,
  }
}
