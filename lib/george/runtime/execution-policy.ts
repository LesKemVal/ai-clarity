import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { OperationalResourceMonitorState } from '@/lib/george/runtime/operational-resource-monitor'
import type { OperationalJudgment } from '@/lib/george/runtime/operational-judgment'
import type { OutcomeEvolution } from '@/lib/george/runtime/outcome-evolution'
import type { GeorgeConversationMoveDefinition } from '@/lib/george/runtime/conversation-move-library'
import type { GeorgeConversationStrategy } from '@/lib/george/runtime/conversation-strategy'

export type GeorgeExecutionType =
  | 'answer'
  | 'direct_question'
  | 'suggested_line'
  | 'suggested_question'
  | 'observation'
  | 'preparation'
  | 'tactical_reminder'
  | 'live_cue'
  | 'complete_response'
  | 'summary'
  | 'comparison'

export type GeorgeRealizationMode =
  | 'direct'
  | 'suggested'
  | 'observational'
  | 'preparatory'
  | 'tactical'

export type GeorgeExplanationDepth = 'minimal' | 'concise' | 'expanded'

export type GeorgeDeliveryPreference =
  | 'text'
  | 'audio'
  | 'visual'
  | 'audio_visual'

export type GeorgeAssumptionHandling =
  | 'none'
  | 'brief_dependency'
  | 'offer_adaptable_alternative'

export type GeorgeRepetitionPolicy =
  | 'allow'
  | 'avoid_restatement'
  | 'suppress_duplicate_live_recommendation'

export type GeorgeResourceUsage =
  | 'none'
  | 'support_selected_move'
  | 'surface_highest_value'

export type GeorgeExecutionAudience = 'user' | 'room_through_user'

export type GeorgeExecutionPolicy = {
  executionType: GeorgeExecutionType
  audience: GeorgeExecutionAudience
  realizationMode: GeorgeRealizationMode
  explanationDepth: GeorgeExplanationDepth
  deliveryPreference: GeorgeDeliveryPreference
  assumptionHandling: GeorgeAssumptionHandling
  repetitionPolicy: GeorgeRepetitionPolicy
  resourceUsage: GeorgeResourceUsage
  strategyMove: GeorgeConversationStrategy['move']
  purpose: string
  source: 'execution_policy'
}

export type GeorgeExecutionPolicyInput = {
  runtime: CurrentGeorgeRuntime
  voiceMode: boolean
  strategy: GeorgeConversationStrategy
  moveDefinition: GeorgeConversationMoveDefinition
  operationalJudgment: OperationalJudgment
  outcomeEvolution: OutcomeEvolution
  operationalResourceMonitor: OperationalResourceMonitorState
}

export function resolveGeorgeExecutionPolicy(
  input: GeorgeExecutionPolicyInput
): GeorgeExecutionPolicy {
  const live = input.runtime === 'live_george'
  const executionType = resolveExecutionType(input.strategy.move, live)
  const audience: GeorgeExecutionAudience = live ? 'room_through_user' : 'user'
  const realizationMode = resolveRealizationMode(executionType)
  const explanationDepth = resolveExplanationDepth(executionType, live)
  const deliveryPreference = resolveDeliveryPreference(live, input.voiceMode)
  const assumptionHandling = resolveAssumptionHandling(input.moveDefinition)
  const repetitionPolicy =
    input.operationalJudgment.liveSupport.posture === 'recommend'
      ? 'suppress_duplicate_live_recommendation'
      : live || input.strategy.move === 'summarize'
        ? 'avoid_restatement'
        : 'allow'
  const resourceUsage =
    input.operationalResourceMonitor.resources.length === 0
      ? 'none'
      : input.operationalResourceMonitor.resources[0]?.actionableNow
        ? 'surface_highest_value'
        : 'support_selected_move'

  return {
    executionType,
    audience,
    realizationMode,
    explanationDepth,
    deliveryPreference,
    assumptionHandling,
    repetitionPolicy,
    resourceUsage,
    strategyMove: input.strategy.move,
    purpose: input.strategy.purpose,
    source: 'execution_policy',
  }
}

function resolveExecutionType(
  move: GeorgeConversationStrategy['move'],
  live: boolean
): GeorgeExecutionType {
  if (!live) {
    if (move === 'ask' || move === 'clarify' || move === 'probe') {
      return 'direct_question'
    }
    if (move === 'summarize') return 'summary'
    if (move === 'explore') return 'preparation'
    if (move === 'slow' || move === 'pause') return 'tactical_reminder'
    return 'answer'
  }

  if (move === 'ask' || move === 'clarify' || move === 'probe') {
    return 'suggested_question'
  }

  if (
    move === 'anchor' ||
    move === 'reframe' ||
    move === 'validate' ||
    move === 'challenge' ||
    move === 'redirect' ||
    move === 'confirm' ||
    move === 'close'
  ) {
    return 'suggested_line'
  }

  if (move === 'summarize') return 'summary'
  if (move === 'explore') return 'preparation'
  if (move === 'slow' || move === 'pause') return 'tactical_reminder'
  return 'live_cue'
}

function resolveRealizationMode(
  executionType: GeorgeExecutionType
): GeorgeRealizationMode {
  if (executionType === 'suggested_line' || executionType === 'suggested_question') {
    return 'suggested'
  }
  if (executionType === 'observation') return 'observational'
  if (executionType === 'preparation') return 'preparatory'
  if (executionType === 'tactical_reminder' || executionType === 'live_cue') {
    return 'tactical'
  }
  return 'direct'
}

function resolveExplanationDepth(
  executionType: GeorgeExecutionType,
  live: boolean
): GeorgeExplanationDepth {
  if (live || executionType === 'live_cue' || executionType === 'tactical_reminder') {
    return 'minimal'
  }
  if (executionType === 'preparation' || executionType === 'comparison') {
    return 'expanded'
  }
  return 'concise'
}

function resolveDeliveryPreference(
  live: boolean,
  voiceMode: boolean
): GeorgeDeliveryPreference {
  if (!live) return 'text'
  return voiceMode ? 'audio_visual' : 'visual'
}

function resolveAssumptionHandling(
  definition: GeorgeConversationMoveDefinition
): GeorgeAssumptionHandling {
  if (definition.assumptionSensitivity === 'high') {
    return 'offer_adaptable_alternative'
  }
  if (definition.assumptionSensitivity === 'medium') {
    return 'brief_dependency'
  }
  return 'none'
}

export function buildExecutionPolicyNote(policy: GeorgeExecutionPolicy) {
  return `
EXECUTION POLICY
- Execution type: ${policy.executionType}
- Audience: ${policy.audience}
- Realization mode: ${policy.realizationMode}
- Explanation depth: ${policy.explanationDepth}
- Delivery preference: ${policy.deliveryPreference}
- Assumption handling: ${policy.assumptionHandling}
- Repetition policy: ${policy.repetitionPolicy}
- Operational resource usage: ${policy.resourceUsage}
- Selected conversational move: ${policy.strategyMove}
- Purpose: ${policy.purpose}
- Realize the selected move contextually. Do not replace it with a different strategy.
- When audience is user, speak directly with the user in a natural Normal GEORGE conversation. Ask direct questions when the move is ask, clarify, or probe; do not turn them into room scripts.
- When audience is room_through_user, provide room-executable support for the user to carry into the room. Keep it brief, adaptable, and appropriate to the receiver profile.
- Suggested language is optional and adaptable; never present a generated line as mandatory.
- When assumptions are material, expose the dependency briefly or offer an adaptable alternative.
- Do not repeat a LIVE recommendation that is already visible in the response or readiness surface.
- Preserve the active outcome, current support style, and delivery policy.
`.trim()
}
