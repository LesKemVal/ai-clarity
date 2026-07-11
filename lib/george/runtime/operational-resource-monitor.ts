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

export type OperationalResource = {
  type: OperationalResourceType
  title: string
  value: string
  reason: string
  confidence: number
  actionableNow: boolean
  expiresWithContext: boolean
}

export type OperationalResourceMonitorState = {
  headline: string
  priority: string
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

  return {
    headline: ranked[0]?.title || 'LIVE readiness',
    priority: input.outcomeState.immediateOutcome,
    resources: ranked,
    source: 'operational_resource_monitor',
  }
}
