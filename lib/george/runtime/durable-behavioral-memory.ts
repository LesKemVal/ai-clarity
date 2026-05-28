import type { AdaptiveUserProfile } from '@/lib/george/runtime/adaptive-user-profile'

export type DurableBehavioralMemoryKind =
  | 'temporary_state'
  | 'session_state'
  | 'durable_user_pattern'
  | 'critical_continuity_fact'
  | 'operational_preference'
  | 'high_risk_memory'
  | 'relationship_memory'

export type DurableBehavioralMemoryCandidate = {
  kind: DurableBehavioralMemoryKind
  confidence: number
  shouldPersist: boolean
  reason: string
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export function evaluateDurableBehavioralMemory(input: {
  latestUserText: string
  adaptiveProfile: AdaptiveUserProfile
  pressureHigh?: boolean
  earbudActive?: boolean
}) {
  const text = input.latestUserText.toLowerCase()

  const candidates: DurableBehavioralMemoryCandidate[] = [
    {
      kind: 'operational_preference',
      confidence: clamp01(
        input.adaptiveProfile.conciseDeliveryPreference +
          (input.earbudActive ? 0.18 : 0) +
          (/\b(shorter|concise|quick|brief|less words|earbud|in my ear)\b/.test(text) ? 0.22 : 0)
      ),
      shouldPersist: false,
      reason: 'User may perform better with concise tactical delivery, but persistence requires repeated signal.',
    },
    {
      kind: 'operational_preference',
      confidence: clamp01(
        input.adaptiveProfile.repeatableLineAffinity +
          (/\b(exact words|say:|what do i say|repeatable line|tell him|tell her)\b/.test(text) ? 0.25 : 0)
      ),
      shouldPersist: false,
      reason: 'User may prefer repeatable lines over abstract cues when pressure rises.',
    },
    {
      kind: 'durable_user_pattern',
      confidence: clamp01(
        input.adaptiveProfile.leverageProtectionPreference +
          (/\b(leverage|position|concession|terms|deal|approval)\b/.test(text) ? 0.2 : 0)
      ),
      shouldPersist: false,
      reason: 'User often values leverage preservation; confirm through repeated outcomes before durable persistence.',
    },
    {
      kind: 'temporary_state',
      confidence: clamp01(input.pressureHigh ? 0.78 : 0.35),
      shouldPersist: false,
      reason: 'Pressure state may affect current delivery, but should not become a permanent assumption.',
    },
    {
      kind: 'high_risk_memory',
      confidence: clamp01(/\b(police|court|lawsuit|doctor|medical|fired|violence|unsafe|arrest)\b/.test(text) ? 0.86 : 0.2),
      shouldPersist: /\b(police|court|lawsuit|doctor|medical|fired|violence|unsafe|arrest)\b/.test(text),
      reason: 'High-risk continuity may deserve stronger session preservation and careful future restoration.',
    },
  ]

  const selected = candidates
    .filter((candidate) => candidate.confidence >= 0.68)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)

  return {
    active: selected.length > 0,
    selected,
    note: buildDurableBehavioralMemoryNote(selected),
  }
}

export function buildDurableBehavioralMemoryNote(
  selected: DurableBehavioralMemoryCandidate[]
) {
  if (!selected.length) return ''

  return `
DURABLE BEHAVIORAL MEMORY EVALUATION
- Treat this as a persistence gate, not automatic memory.
- Do not convert one moment into a permanent user trait.
- Temporary pressure does not equal permanent limitation.
- Persist only repeated, useful, user-serving patterns.
- Recalibrate when future behavior contradicts the pattern.
- Current likely memory candidates:
${selected.map((item) => `  - ${item.kind} (${item.confidence.toFixed(2)}): ${item.reason}`).join('\n')}
- Use this to shape response behavior now; durable storage should require explicit product support or repeated signal.
`.trim()
}
