import type { GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'
import type {
  GeorgeConversationStrategy,
  OpportunitySignalNeed,
} from '@/lib/george/runtime/conversation-strategy'
import type { OperationalJudgment } from '@/lib/george/runtime/operational-judgment'
import type { TrajectoryAssessment } from '@/lib/george/runtime/trajectory-engine'
import type { LiveRecommendationPresentation } from '@/lib/george/chat/presentation-authority'

export type OperationalResourceType =
  | 'live_readiness'
  | 'preparation_gap'
  | 'missing_signal'
  | 'strategy_reminder'
  | 'opportunity'
  | 'outcome_conflict'

export type OperationalResource = {
  type: OperationalResourceType
  title: string
  value: string
  reason: string
  confidence: number
  actionableNow: boolean
  expiresWithContext: boolean
}

export type OpportunityReadinessKind =
  | 'live_support'
  | 'pitch_deck'
  | 'brief'

export type OpportunityTapAction =
  | 'continue_preparation'
  | 'open_execution_gateway'

export type OpportunityReadiness = {
  kind: OpportunityReadinessKind
  title: string
  readiness: number
  thresholdMet: boolean
  suggestion: string
  sessionActivation: string
  signalNeed: OpportunitySignalNeed
  executionLabel: string
  tapAction: OpportunityTapAction
}

type OpportunityReadinessInput = {
  outcomeState: GeorgeOutcomeState
  conversationStrategy: GeorgeConversationStrategy
  operationalJudgment: OperationalJudgment
  trajectory: TrajectoryAssessment
  liveRecommendationPresentation: LiveRecommendationPresentation
}

type OpportunityDefinition = {
  kind: OpportunityReadinessKind
  title: string
  applies: (input: OpportunityReadinessInput) => boolean
  confidence: (input: OpportunityReadinessInput) => number
  suggestion: string
  sessionActivation: string
  signalNeed: OpportunitySignalNeed
  executionLabel: string
  tapAction: OpportunityTapAction
  threshold: number
}

export const OPPORTUNITY_READINESS_REGISTRY: readonly OpportunityDefinition[] = [
    {
      kind: 'live_support',
      title: 'LIVE',
      applies: (input) =>
        input.liveRecommendationPresentation.show ||
        input.trajectory.potentialFutureNeeds.includes('live'),
      confidence: (input) =>
        input.liveRecommendationPresentation.show
          ? input.operationalJudgment.liveSupport.strength === 'strong'
            ? 0.92
            : 0.78
          : input.trajectory.confidence,
      suggestion: 'You may be ready for LIVE support.',
      sessionActivation: 'Let’s prepare LIVE support for this session.',
      signalNeed: 'desired_outcome',
      executionLabel: 'Tap to go LIVE',
      tapAction: 'continue_preparation',
      threshold: 0.68,
    },
    {
      kind: 'pitch_deck',
      title: 'Pitch Deck',
      applies: (input) =>
        input.trajectory.potentialFutureNeeds.includes('deck'),
      confidence: (input) =>
        Math.max(
          input.trajectory.confidence,
          input.outcomeState.confidence
        ),
      suggestion: 'You may be ready for a pitch deck.',
      sessionActivation: 'Let’s prepare a pitch deck for this session.',
      signalNeed: 'audience_decision',
      executionLabel: 'Build Pitch Deck',
      tapAction: 'continue_preparation',
      threshold: 0.68,
    },
    {
      kind: 'brief',
      title: 'Brief',
      applies: (input) =>
        input.trajectory.potentialFutureNeeds.includes('brief') &&
        !input.trajectory.potentialFutureNeeds.includes('deck'),
      confidence: (input) =>
        Math.max(
          input.trajectory.confidence,
          input.outcomeState.confidence
        ),
      suggestion: 'You may be ready for a brief.',
      sessionActivation: 'Let’s prepare a brief for this session.',
      signalNeed: 'brief_use',
      executionLabel: 'Build Brief',
      tapAction: 'continue_preparation',
      threshold: 0.68,
    },
  ]

export type OperationalResourceMonitorState = {
  headline: string
  priority: string
  opportunity: OpportunityReadiness | null
  resources: OperationalResource[]
  source: 'operational_resource_monitor'
}

export function resolveOperationalResourceMonitor(
  input: OpportunityReadinessInput
): OperationalResourceMonitorState {
  const resources: OperationalResource[] = []
  const opportunities = OPPORTUNITY_READINESS_REGISTRY
    .filter((definition) => definition.applies(input))
    .map((definition) => {
      const confidence = definition.confidence(input)

      return {
        kind: definition.kind,
        title: definition.title,
        readiness: Math.round(confidence * 100),
        thresholdMet: confidence >= definition.threshold,
        suggestion: definition.suggestion,
        sessionActivation: definition.sessionActivation,
        signalNeed: definition.signalNeed,
        executionLabel: definition.executionLabel,
        tapAction: definition.tapAction,
        confidence,
      }
    })

  if ((input.outcomeState.stability ?? input.outcomeState.confidence) < 0.55 && input.outcomeState.constraints?.length) {
    resources.push({
      type: 'outcome_conflict',
      title: 'Outcome tradeoff needs attention',
      value: input.outcomeState.constraints[0],
      reason: 'The latest signal may conflict with a previously established constraint.',
      confidence: 1 - (input.outcomeState.stability ?? input.outcomeState.confidence),
      actionableNow: true,
      expiresWithContext: true,
    })
  }

  if (input.liveRecommendationPresentation.show) {
    resources.push({
      type: 'live_readiness',
      title: input.liveRecommendationPresentation.title,
      value: input.liveRecommendationPresentation.message,
      reason: 'Execution is imminent and LIVE is operationally viable.',
      confidence: input.operationalJudgment.liveSupport.strength === 'strong' ? 0.92 : 0.78,
      actionableNow: true,
      expiresWithContext: true,
    })
  }

  if (input.operationalJudgment.action === 'acquire_smallest_signal' && input.operationalJudgment.smallestSignal) {
    resources.push({
      type: 'missing_signal',
      title: 'One signal would improve LIVE readiness',
      value: input.operationalJudgment.smallestSignal,
      reason: 'This is the smallest missing signal that materially improves the next move.',
      confidence: input.operationalJudgment.confidence,
      actionableNow: true,
      expiresWithContext: true,
    })
  }

  if (input.outcomeState.phase === 'preparation' && input.trajectory.potentialFutureNeeds.includes('live')) {
    resources.push({
      type: 'preparation_gap',
      title: 'Preparing for LIVE',
      value: input.outcomeState.immediateOutcome,
      reason: 'The current conversation is building signal that can transfer directly into LIVE.',
      confidence: input.outcomeState.confidence,
      actionableNow: false,
      expiresWithContext: true,
    })
  }

  resources.push({
    type: 'strategy_reminder',
    title: 'Current conversational move',
    value: input.conversationStrategy.purpose,
    reason: `Operational Judgment selected ${input.conversationStrategy.move} as the highest-value move.`,
    confidence: input.conversationStrategy.confidence,
    actionableNow: true,
    expiresWithContext: true,
  })

  const ranked = resources
    .sort((a, b) => Number(b.actionableNow) - Number(a.actionableNow) || b.confidence - a.confidence)
    .slice(0, 3)

  const opportunity =
    opportunities
      .sort(
        (a, b) =>
          Number(b.thresholdMet) - Number(a.thresholdMet) ||
          b.confidence - a.confidence
      )[0] || null

  return {
    headline:
      opportunity?.thresholdMet
        ? opportunity.suggestion
        : opportunity
          ? `${opportunity.title} readiness`
          : ranked[0]?.title || 'Opportunity readiness',
    priority: input.outcomeState.immediateOutcome,
    opportunity: opportunity
      ? {
          kind: opportunity.kind,
          title: opportunity.title,
          readiness: opportunity.readiness,
          thresholdMet: opportunity.thresholdMet,
          suggestion: opportunity.suggestion,
          sessionActivation: opportunity.sessionActivation,
          signalNeed: opportunity.signalNeed,
          executionLabel: opportunity.executionLabel,
          tapAction: opportunity.tapAction,
        }
      : null,
    resources: ranked,
    source: 'operational_resource_monitor',
  }
}
