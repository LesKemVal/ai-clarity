import type { LiveTranscriptControllerAction } from './live-transcript-controller'
import type { LiveTranscriptDecision } from './transcript-routing'
import { georgeLiveRuntimeEvents } from '../live-voice/runtime/runtime-events'

export type LiveActionAuthorityVerdict =
  | 'allow'
  | 'hold'
  | 'block'
  | 'downgrade'

export type LiveActionAuthorityResult = {
  verdict: LiveActionAuthorityVerdict
  action: LiveTranscriptControllerAction
  maySpeak: boolean
  shouldSend: boolean
  shouldHold: boolean
  reason: string
  confidence: number
  telemetry: {
    source: 'live_action_authority'
    verdict: LiveActionAuthorityVerdict
    actionType: LiveTranscriptControllerAction['type']
    decisionType: LiveTranscriptDecision['type']
    reason: string
    confidence: number
  }
}

export function authorizeLiveTranscriptAction(params: {
  transcript: string
  decision: LiveTranscriptDecision
  action: LiveTranscriptControllerAction
  isGeorgeSpeaking: boolean
  isThinking: boolean
  overlapDetected?: boolean
  overlapRequiresAttention?: boolean
  lastSpokenLine?: string
  desiredOutcome?: string
}): LiveActionAuthorityResult {
  const transcript = String(params.transcript || '').trim()
  const action = params.action

  const make = (
    verdict: LiveActionAuthorityVerdict,
    nextAction: LiveTranscriptControllerAction,
    reason: string,
    confidence: number
  ): LiveActionAuthorityResult => ({
    verdict,
    action: nextAction,
    maySpeak: nextAction.type === 'speak',
    shouldSend: nextAction.type === 'send',
    shouldHold: verdict === 'hold',
    reason,
    confidence,
    telemetry: {
      source: 'live_action_authority',
      verdict,
      actionType: nextAction.type,
      decisionType: params.decision.type,
      reason,
      confidence,
    },
  })

  const emit = (result: LiveActionAuthorityResult) => {
    georgeLiveRuntimeEvents.emit(
      result.shouldHold || result.verdict === 'block'
        ? 'silence_required'
        : result.shouldSend
          ? 'cue_ready'
          : 'hold_floor',
      {
        reason: result.reason,
        confidence: result.confidence,
        intervention: result.verdict,
        nextMove: result.action.type,
      }
    )

    return result
  }

  if (!transcript && action.type !== 'ignore') {
    return emit(make('block', { type: 'ignore' }, 'No transcript available for LIVE action authority.', 0.9))
  }

  if (action.type === 'ignore') {
    return emit(make('allow', action, 'Controller already ignored this LIVE transcript.', 0.96))
  }

  if (params.isGeorgeSpeaking && action.type === 'send') {
    return emit(make('hold', { type: 'ignore' }, 'GEORGE is speaking; hold send action to avoid self-overlap.', 0.82))
  }

  if (params.isThinking && action.type === 'send') {
    return emit(make('hold', { type: 'ignore' }, 'GEORGE is already thinking; hold duplicate send action.', 0.84))
  }

  if (
    params.overlapDetected &&
    params.overlapRequiresAttention &&
    action.type === 'send'
  ) {
    return emit(make('hold', { type: 'ignore' }, 'Overlap detected; hold send action until room context is clearer.', 0.78))
  }

  if (
    action.type === 'speak' &&
    !String(params.lastSpokenLine || '').trim()
  ) {
    return emit(make('block', { type: 'ignore' }, 'Speak action requires a remembered last spoken line.', 0.86))
  }

  if (action.type === 'start_buy_time') {
    return emit(make('allow', action, 'Local buy-time action approved.', 0.9))
  }

  if (action.type === 'speak') {
    return emit(make('allow', action, 'Local repeat/compress action approved.', 0.84))
  }

  if (action.type === 'send') {
    return emit(make(
      'allow',
      action,
      params.desiredOutcome
        ? 'Send action approved with desired outcome context.'
        : 'Send action approved without desired outcome context.',
      params.desiredOutcome ? 0.78 : 0.68
    ))
  }

  return emit(make('block', { type: 'ignore' }, 'Unknown LIVE action authority state.', 0.72))
}
