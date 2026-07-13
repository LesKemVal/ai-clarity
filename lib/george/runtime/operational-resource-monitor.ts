import type { GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'
import type { GeorgeConversationStrategy } from '@/lib/george/runtime/conversation-strategy'
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

export type OpportunityReadiness = {
  kind: OpportunityReadinessKind
  title: string
  readiness: number
  thresholdMet: boolean
  suggestion: string
  preparationQuestion: string
  executionLabel: string
}

export type OperationalResourceMonitorState = {
  headline: string
  priority: string
  opportunity: OpportunityReadiness | null
  resources: OperationalResource[]
  source: 'operational_resource_monitor'
}

export function resolveOperationalResourceMonitor(input: {
  outcomeState: GeorgeOutcomeState
  conversationStrategy: GeorgeConversationStrategy
  operationalJudgment: OperationalJudgment
  trajectory: TrajectoryAssessment
  liveRecommendationPresentation: LiveRecommendationPresentation
}): OperationalResourceMonitorState {
  const resources: OperationalResource[] = []
  const opportunities: Array<OpportunityReadiness & { confidence: number }> = []

  if (
    input.liveRecommendationPresentation.show ||
    input.trajectory.potentialFutureNeeds.includes('live')
  ) {
    const confidence = input.liveRecommendationPresentation.show
      ? input.operationalJudgment.liveSupport.strength === 'strong'
        ? 0.92
        : 0.78
      : input.trajectory.confidence

    opportunities.push({
      kind: 'live_support',
      title: 'LIVE',
      readiness: Math.round(confidence * 100),
      thresholdMet: confidence >= 0.68,
      suggestion: 'You may be ready for LIVE support.',
      preparationQuestion:
        'What outcome matters most in the conversation you are preparing for?',
      executionLabel: 'Tap to go LIVE',
      confidence,
    })
  }

  if (input.trajectory.potentialFutureNeeds.includes('deck')) {
    const confidence = Math.max(
      input.trajectory.confidence,
      input.outcomeState.confidence
    )

    opportunities.push({
      kind: 'pitch_deck',
      title: 'Pitch Deck',
      readiness: Math.round(confidence * 100),
      thresholdMet: confidence >= 0.68,
      suggestion: 'You may be ready for a pitch deck.',
      preparationQuestion:
        'Who is the pitch deck for, and what should it help them decide?',
      executionLabel: 'Build Pitch Deck',
      confidence,
    })
  }

  if (
    input.trajectory.potentialFutureNeeds.includes('brief') &&
    !input.trajectory.potentialFutureNeeds.includes('deck')
  ) {
    const confidence = Math.max(
      input.trajectory.confidence,
      input.outcomeState.confidence
    )

    opportunities.push({
      kind: 'brief',
      title: 'Brief',
      readiness: Math.round(confidence * 100),
      thresholdMet: confidence >= 0.68,
      suggestion: 'You may be ready for a brief.',
      preparationQuestion:
        'Who will use the brief, and what should it help them understand or decide?',
      executionLabel: 'Build Brief',
      confidence,
    })
  }

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
          preparationQuestion: opportunity.preparationQuestion,
          executionLabel: opportunity.executionLabel,
        }
      : null,
    resources: ranked,
    source: 'operational_resource_monitor',
  }
}
