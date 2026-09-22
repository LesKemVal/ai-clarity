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

export type AdaptiveSessionEvidence = Readonly<{
  userText: string
  pressureHigh?: boolean
  earbudActive?: boolean
}>

export type AdaptiveSessionEvidenceSummary = Readonly<{
  inspectedTurnCount: number
  concisePositiveSignals: number
  conciseContradictions: number
  independentConciseSignals: number
  broadExplicitConciseDirection: boolean
  conciseSessionTendencyQualified: boolean
  durableConciseCandidateQualified: boolean
}>

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
    learningSignals?: Array<{
      hypothesis?: string
      confidence?: number
    }>
  }
): AdaptiveUserProfile {
  const text = input.userText.toLowerCase()

  const next = { ...current }

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

  if (/\b(?:make|keep|be|stay) (?:it |this |that )?(?:calm|steady|measured)|don't escalate\b/.test(text)) {
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

  // Pressure and receiver constraints shape the current realization. They are
  // deliberately not learned as user identity or preference here.

  for (const signal of input.learningSignals || []) {
    const hypothesis = String(signal.hypothesis || '').toLowerCase()

    if (hypothesis.includes('concise')) {
      next.conciseDeliveryPreference = adjust(
        next.conciseDeliveryPreference,
        'up',
        0.04
      )
    }

    if (hypothesis.includes('completion')) {
      next.repeatableLineAffinity = adjust(
        next.repeatableLineAffinity,
        'up',
        0.04
      )
    }

    if (hypothesis.includes('risk')) {
      next.calmPressurePreference = adjust(
        next.calmPressurePreference,
        'up',
        0.03
      )
    }
  }

  return next
}

function normalizedEvidenceText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function classifyConciseEvidence(evidence: AdaptiveSessionEvidence) {
  const text = evidence.userText.toLowerCase().replace(/\s+/g, ' ').trim()
  const normalized = normalizedEvidenceText(text)
  const wordCount = normalized.split(/\s+/).filter(Boolean).length
  const contradiction =
    /\b(more detail|more context|expand|longer|explain more|too short|too brief|not enough detail|don'?t be so brief)\b/.test(text)
  const explicitConcise =
    /\b(shorter|more concise|be concise|keep it brief|brief cues?|less words?|shorter cues?|short cues?|keep it tight|tighten (?:this|that|it))\b/.test(text)
  const lineScoped =
    /\b(this|that) (line|sentence|wording|response|answer)\b/.test(text)
  const broadExplicit =
    explicitConcise &&
    /\b(always|from now on|throughout|this (?:live )?(?:conversation|room|session)|for the rest|generally|usually)\b/.test(text)
  const inferredTerse =
    !explicitConcise &&
    !contradiction &&
    !evidence.pressureHigh &&
    !evidence.earbudActive &&
    wordCount > 0 &&
    wordCount <= 6

  return {
    normalized,
    contradiction,
    explicitConcise,
    lineScoped,
    broadExplicit,
    inferredTerse,
  }
}

/**
 * Derives bounded current-session tendencies from recent conversation evidence.
 * No new storage is created: callers rebuild this deterministic projection from
 * the existing recent conversation window on each request.
 */
export function deriveAdaptiveUserProfileFromSession(input: {
  turns: readonly AdaptiveSessionEvidence[]
  learningSignals?: Array<{
    hypothesis?: string
    confidence?: number
  }>
}) {
  const turns = input.turns.slice(-8)
  let profile = { ...DEFAULT_ADAPTIVE_USER_PROFILE }
  const conciseSignalIds = new Set<string>()
  let concisePositiveSignals = 0
  let conciseContradictions = 0
  let broadExplicitConciseDirection = false

  turns.forEach((turn, index) => {
    profile = adaptUserProfile(profile, {
      userText: turn.userText,
      learningSignals: index === turns.length - 1 ? input.learningSignals : [],
    })

    const evidence = classifyConciseEvidence(turn)
    const recencyWeight = 0.5 + ((index + 1) / Math.max(1, turns.length)) * 0.5

    if (evidence.contradiction) {
      conciseContradictions += 1
      conciseSignalIds.clear()
      profile.conciseDeliveryPreference = adjust(
        profile.conciseDeliveryPreference,
        'down',
        0.1 * recencyWeight
      )
      return
    }

    if (evidence.broadExplicit) {
      broadExplicitConciseDirection = true
      concisePositiveSignals += 1
      conciseSignalIds.add(evidence.normalized)
      profile.conciseDeliveryPreference = adjust(
        profile.conciseDeliveryPreference,
        'up',
        0.12 * recencyWeight
      )
      return
    }

    if (evidence.explicitConcise && evidence.lineScoped) {
      // This line is governed directly by Operational Judgment. It is not
      // evidence of a broader session preference.
      return
    }

    if (evidence.explicitConcise || evidence.inferredTerse) {
      const before = conciseSignalIds.size
      conciseSignalIds.add(evidence.normalized)
      if (conciseSignalIds.size === before) return

      concisePositiveSignals += 1
      if (conciseSignalIds.size >= 2) {
        profile.conciseDeliveryPreference = adjust(
          profile.conciseDeliveryPreference,
          'up',
          (evidence.explicitConcise ? 0.07 : 0.04) * recencyWeight
        )
      }
    }
  })

  const independentConciseSignals = conciseSignalIds.size
  const conciseSessionTendencyQualified = Boolean(
    broadExplicitConciseDirection || independentConciseSignals >= 2
  )
  const durableConciseCandidateQualified = Boolean(
    independentConciseSignals >= 3 &&
      conciseContradictions === 0 &&
      profile.conciseDeliveryPreference >= 0.64
  )
  const evidence: AdaptiveSessionEvidenceSummary = Object.freeze({
    inspectedTurnCount: turns.length,
    concisePositiveSignals,
    conciseContradictions,
    independentConciseSignals,
    broadExplicitConciseDirection,
    conciseSessionTendencyQualified,
    durableConciseCandidateQualified,
  })

  return Object.freeze({
    profile: Object.freeze(profile),
    evidence,
  })
}

export function buildAdaptiveUserProfileNote(
  profile: AdaptiveUserProfile,
  evidence?: AdaptiveSessionEvidenceSummary
) {
  return `
OPERATIONAL PROFILE EVIDENCE
- Treat these as current-session evidence about how GEORGE may work effectively with this user.
- These are probabilistic tendencies, not permanent truths or immutable constraints.
- Use them to inform reasoning; do not let them replace reasoning.
- Recalibrate continuously from runtime evidence, current objective, room pressure, and explicit user direction.
- Do not patronize the user.
- Do not permanently simplify intelligence because of temporary overload.
- One inferred signal remains line/turn evidence only. A current-session tendency requires repeated independent signals or explicit broader direction.
- Contradictory evidence weakens the tendency. Pressure, fatigue, haste, receiver constraints, and one rewritten sentence are not permanent identity.

Current evidence tendencies:
- concise delivery preference: ${profile.conciseDeliveryPreference.toFixed(2)}
- repeatable line affinity: ${profile.repeatableLineAffinity.toFixed(2)}
- abstract reasoning tolerance: ${profile.abstractReasoningTolerance.toFixed(2)}
- calm pressure preference: ${profile.calmPressurePreference.toFixed(2)}
- leverage protection preference: ${profile.leverageProtectionPreference.toFixed(2)}
- tactical cue retention: ${profile.tacticalCueRetention.toFixed(2)}
- layered explanation tolerance: ${profile.layeredExplanationTolerance.toFixed(2)}
${evidence ? `- concise session tendency qualified: ${evidence.conciseSessionTendencyQualified ? 'yes' : 'no'} (${evidence.independentConciseSignals} independent signals; ${evidence.conciseContradictions} contradictions)\n- durable concise candidate qualified: ${evidence.durableConciseCandidateQualified ? 'yes' : 'no'} (candidate only; persistence not authorized)` : ''}

Use this evidence to shape:
- pacing
- density
- tactical depth
- explanation style
- cue structure
- pressure handling
- conversational rhythm
`.trim()
}
