import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'
import type { JudgmentSurfaceState } from '@/lib/george/runtime/judgment-surface'
import type { TrajectoryAssessment } from '@/lib/george/runtime/trajectory-engine'
import { resolveConversationMoveDefinition, type GeorgeConversationMoveDefinition } from '@/lib/george/runtime/conversation-move-library'

export type GeorgeConversationMove =
  | 'answer'
  | 'ask'
  | 'clarify'
  | 'anchor'
  | 'reframe'
  | 'summarize'
  | 'validate'
  | 'challenge'
  | 'redirect'
  | 'slow'
  | 'close'
  | 'explore'
  | 'probe'
  | 'confirm'
  | 'pause'

export type GeorgeConversationStrategy = {
  move: GeorgeConversationMove
  purpose: string
  confidence: number
  assumptions: string[]
  userDiscretionRequired: true
  definition: GeorgeConversationMoveDefinition
  source: 'conversation_strategy'
}

export type GeorgeConversationStrategyInput = {
  action:
    | 'warn_and_move'
    | 'restore_continuity'
    | 'acquire_smallest_signal'
    | 'protect_objective'
    | 'execute_live_move'
    | 'advance_outcome'
    | 'clarify_direction'
  currentRuntime: CurrentGeorgeRuntime
  latestUserText: string
  judgmentSurface: JudgmentSurfaceState
  trajectory: TrajectoryAssessment
  outcomeState: GeorgeOutcomeState
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export function resolveGeorgeConversationStrategy(
  input: GeorgeConversationStrategyInput
): GeorgeConversationStrategy {
  const text = String(input.latestUserText || '').toLowerCase()
  const assumption =
    'The user may know room facts, prior statements, relationships, or constraints GEORGE cannot observe.'

  let move: GeorgeConversationMove = 'answer'
  let purpose = 'Complete the immediate request while advancing the active outcome.'
  let confidence = input.trajectory.confidence

  if (input.action === 'acquire_smallest_signal') {
    move = 'ask'
    purpose = 'Acquire only the missing signal that materially changes the next useful move.'
    confidence = Math.max(confidence, 0.82)
  } else if (input.action === 'restore_continuity') {
    move = 'summarize'
    purpose = 'Reconnect the current turn to the active outcome without restarting the conversation.'
    confidence = Math.max(confidence, 0.78)
  } else if (input.action === 'protect_objective') {
    move = 'anchor'
    purpose = 'Keep the conversation aligned with the user’s active outcome and stated constraints.'
    confidence = Math.max(confidence, 0.8)
  } else if (/already answered|as i said|we covered|they know|they already know/.test(text)) {
    move = 'confirm'
    purpose = 'Confirm the established fact and avoid asking the room to repeat known information.'
    confidence = Math.max(confidence, 0.84)
  } else if (/unclear|what do they mean|which part|what exactly|specific concern/.test(text)) {
    move = 'clarify'
    purpose = 'Narrow the issue before the user commits to an answer or concession.'
    confidence = Math.max(confidence, 0.76)
  } else if (/objection|pushback|concern|hesitation|valuation|too high|too low/.test(text)) {
    move = 'probe'
    purpose = 'Use a context-sensitive move to expose the operative concern before defending or conceding.'
    confidence = Math.max(confidence, 0.7)
  } else if (/actually|not the point|wrong frame|that is not/.test(text)) {
    move = 'reframe'
    purpose = 'Reset the conversation around the governing issue without abandoning the active outcome.'
    confidence = Math.max(confidence, 0.74)
  } else if (/agree|sounds good|ready|next step|move forward|commit/.test(text)) {
    move = 'close'
    purpose = 'Convert positive movement into a clear commitment or next step.'
    confidence = Math.max(confidence, 0.72)
  } else if (
    input.currentRuntime === 'live_george' &&
    /pause|slow down|rushing|talking fast|interrupted|overwhelmed/.test(text)
  ) {
    move = 'slow'
    purpose = 'Protect execution quality by reducing pace before the next substantive move.'
    confidence = Math.max(confidence, 0.75)
  } else if (input.action === 'clarify_direction') {
    move = 'explore'
    purpose = 'Help the user define the direction without inventing an outcome.'
    confidence = Math.max(confidence, 0.64)
  } else if (input.currentRuntime === 'live_george') {
    move = 'answer'
    purpose = 'Provide the minimum useful move that advances the active outcome in the current room.'
  }

  return {
    move,
    purpose,
    confidence: clamp01(confidence),
    assumptions: [assumption],
    userDiscretionRequired: true,
    definition: resolveConversationMoveDefinition(move),
    source: 'conversation_strategy',
  }
}

export function buildConversationStrategyNote(
  strategy: GeorgeConversationStrategy
) {
  return `
CONVERSATION STRATEGY
- Selected move: ${strategy.move}
- Operational purpose: ${strategy.purpose}
- Strategy confidence: ${strategy.confidence.toFixed(2)}
- Select language that realizes this move in the current conversation; do not replace it with a different move.
- A question is a tactic only when asking it improves the interaction or resolves material ambiguity.
- This strategy does not replace the active outcome, Operational Judgment, support style, or delivery policy.
`.trim()
}
