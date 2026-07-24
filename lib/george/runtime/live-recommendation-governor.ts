import type { SignalSufficiency } from './judgment-surface'

export type LiveRecommendationEvidenceInput = {
  latestUserText: string
  signalSufficiency: SignalSufficiency
  currentRuntime?: string
  pressureHigh?: boolean
  objectiveKnown?: boolean
}

export type LiveRecommendationEvidence = {
  alreadyLive: boolean
  signalUsable: boolean
  executionImminent: boolean
  conversationPressure: boolean
  trajectorySignal: boolean
  hasConversationOutcome: boolean
  pressureHigh: boolean
}

/**
 * Supplies presentation context for the LIVE capability.
 *
 * This module does not decide whether LIVE is relevant, beneficial, requested,
 * or preferred. The provider reasons about capability benefit from the full
 * conversation, the user's explicit or inferred intent, and the desired or
 * likely desired outcome. Operational judgment may use this evidence only to
 * govern how an available capability is surfaced while preserving user agency.
 */
export function evaluateLiveRecommendationEvidence(
  input: LiveRecommendationEvidenceInput
): LiveRecommendationEvidence {
  const alreadyLive = input.currentRuntime === 'live_george'
  const signalUsable =
    input.signalSufficiency === 'sufficient' ||
    input.signalSufficiency === 'needs-smallest-signal'
  const hasConversationOutcome = Boolean(input.objectiveKnown) && signalUsable

  return {
    alreadyLive,
    signalUsable,
    // Capability relevance must not be inferred from phrase matching here.
    // OpenAI reasons about timing, intent, and likely benefit from full context.
    executionImminent: false,
    conversationPressure: false,
    trajectorySignal: hasConversationOutcome,
    hasConversationOutcome,
    pressureHigh: Boolean(input.pressureHigh),
  }
}
