export type AdaptiveConfidence = number

export type AdaptiveUserProfile = {
  conciseDeliveryPreference: AdaptiveConfidence
  repeatableLineAffinity: AdaptiveConfidence
  abstractReasoningTolerance: AdaptiveConfidence
  calmPressurePreference: AdaptiveConfidence
  leverageProtectionPreference: AdaptiveConfidence
  tacticalCueRetention: AdaptiveConfidence
  layeredExplanationTolerance: AdaptiveConfidence
}

export const DEFAULT_ADAPTIVE_USER_PROFILE: AdaptiveUserProfile = {
  conciseDeliveryPreference: 0.5,
  repeatableLineAffinity: 0.5,
  abstractReasoningTolerance: 0.5,
  calmPressurePreference: 0.5,
  leverageProtectionPreference: 0.5,
  tacticalCueRetention: 0.5,
  layeredExplanationTolerance: 0.5,
}

function adjust(
  current: number,
  direction: 'up' | 'down',
  weight = 0.06
) {
  const delta = direction === 'up' ? weight : -weight
  return Math.max(0, Math.min(1, current + delta))
}

export function adaptUserProfile(
  current: AdaptiveUserProfile,
  input: {
    userText: string
    earbudActive?: boolean
    pressureHigh?: boolean
  }
): AdaptiveUserProfile {
  const text = input.userText.toLowerCase()

  const next = { ...current }

  const shortInput = text.split(/\s+/).length <= 10

  if (shortInput) {
    next.conciseDeliveryPreference = adjust(
      next.conciseDeliveryPreference,
      'up'
    )
  }

  if (
    /\bsay:|tell him|tell her|repeat|exact words|what do i say\b/.test(text)
  ) {
    next.repeatableLineAffinity = adjust(
      next.repeatableLineAffinity,
      'up',
      0.08
    )
  }

  if (
    /\bwhy|explain|break down|reasoning|logic|walk me through\b/.test(text)
  ) {
    next.abstractReasoningTolerance = adjust(
      next.abstractReasoningTolerance,
      'up',
      0.08
    )
  }

  if (
    /\bcalm|steady|measured|don't escalate|careful\b/.test(text)
  ) {
    next.calmPressurePreference = adjust(
      next.calmPressurePreference,
      'up'
    )
  }

  if (
    /\bleverage|position|concession|terms|frame|approval\b/.test(text)
  ) {
    next.leverageProtectionPreference = adjust(
      next.leverageProtectionPreference,
      'up'
    )
  }

  if (input.earbudActive) {
    next.tacticalCueRetention = adjust(
      next.tacticalCueRetention,
      'up',
      0.07
    )

    next.layeredExplanationTolerance = adjust(
      next.layeredExplanationTolerance,
      'down',
      0.05
    )
  }

  if (input.pressureHigh) {
    next.calmPressurePreference = adjust(
      next.calmPressurePreference,
      'up',
      0.05
    )
  }

  return next
}

export function buildAdaptiveUserProfileNote(
  profile: AdaptiveUserProfile
) {
  return `
ADAPTIVE USER PROFILE
- Treat these as probabilistic tendencies, not permanent truths.
- Recalibrate continuously from runtime evidence.
- Do not patronize the user.
- Do not permanently simplify intelligence because of temporary overload.

Observed confidence tendencies:
- concise delivery preference: ${profile.conciseDeliveryPreference.toFixed(2)}
- repeatable line affinity: ${profile.repeatableLineAffinity.toFixed(2)}
- abstract reasoning tolerance: ${profile.abstractReasoningTolerance.toFixed(2)}
- calm pressure preference: ${profile.calmPressurePreference.toFixed(2)}
- leverage protection preference: ${profile.leverageProtectionPreference.toFixed(2)}
- tactical cue retention: ${profile.tacticalCueRetention.toFixed(2)}
- layered explanation tolerance: ${profile.layeredExplanationTolerance.toFixed(2)}

Use these to shape:
- pacing
- density
- tactical depth
- explanation style
- cue structure
- pressure handling
- conversational rhythm
`.trim()
}
