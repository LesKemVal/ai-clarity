import type { GeorgeOutcomePhase, GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'
import type { GeorgeConversationStrategy } from '@/lib/george/runtime/conversation-strategy'

export type OutcomeEvolutionKind =
  | 'initial'
  | 'confirmed'
  | 'refined'
  | 'phase_transition'
  | 'supporting_outcome_added'
  | 'constraint_added'
  | 'preference_added'
  | 'contradiction_detected'
  | 'primary_replaced'

export type OutcomeEvolution = {
  state: GeorgeOutcomeState
  kind: OutcomeEvolutionKind
  reason: string
  confidenceDelta: number
  stability: number
  phaseTransition?: { from: GeorgeOutcomePhase; to: GeorgeOutcomePhase }
  contradiction?: string
  source: 'outcome_evolution'
}

export type OutcomeEvolutionInput = {
  previousState?: GeorgeOutcomeState | null
  inferredState: GeorgeOutcomeState
  latestUserText: string
  previousUserText?: string
  conversationStrategy?: GeorgeConversationStrategy | null
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const sentence = (value: string) => {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ')
  if (!normalized) return ''
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(sentence).filter(Boolean)))
}

function extractConstraints(text: string) {
  const matches = String(text || '').match(/(?:do not|don't|cannot|can't|must not|without|non-negotiable|unwilling to|not willing to)\s+[^.!?]+/gi) || []
  return unique(matches.slice(0, 4))
}

function extractPreferences(text: string) {
  const matches = String(text || '').match(/(?:prefer|would rather|ideally|my preference is|i want to)\s+[^.!?]+/gi) || []
  return unique(matches.slice(0, 4))
}

function explicitPrimaryReplacement(text: string) {
  return /\b(my goal is now|the goal is now|actually,? i (?:want|need)|instead,? i (?:want|need)|i no longer want|change(?:d)? the objective|new objective)\b/i.test(text)
}

function contradictionSignal(text: string) {
  return /\b(but|however|although|except|on the other hand|that conflicts|contradict|trade-?off)\b/i.test(text)
}

export function evolveGeorgeOutcomeState(input: OutcomeEvolutionInput): OutcomeEvolution {
  const previous = input.previousState || null
  const inferred = input.inferredState
  const latestText = String(input.latestUserText || '')
  const constraints = unique([...(previous?.constraints || []), ...extractConstraints(latestText)])
  const preferences = unique([...(previous?.preferences || []), ...extractPreferences(latestText)])

  if (!previous) {
    const stability = clamp01(inferred.stability ?? inferred.confidence)
    return {
      state: { ...inferred, constraints, preferences, stability },
      kind: 'initial',
      reason: 'No prior canonical outcome state was available.',
      confidenceDelta: 0,
      stability,
      source: 'outcome_evolution',
    }
  }

  const replacementAllowed = explicitPrimaryReplacement(latestText)
  const primaryOutcome = replacementAllowed
    ? inferred.primaryOutcome
    : previous.primaryOutcome || inferred.primaryOutcome
  const phaseChanged = previous.phase !== inferred.phase
  const newSupporting = inferred.supportingOutcomes.filter(
    (item) => !previous.supportingOutcomes.includes(item)
  )
  const contradiction = contradictionSignal(latestText)
    ? 'The latest user signal may conflict with an established outcome, constraint, or preference.'
    : undefined

  const supportingOutcomes = unique([
    ...previous.supportingOutcomes,
    ...inferred.supportingOutcomes,
  ]).slice(0, 6)

  let stability = clamp01(previous.stability ?? previous.confidence)
  if (replacementAllowed) stability = clamp01(inferred.confidence * 0.8)
  else if (contradiction) stability = clamp01(stability - 0.12)
  else stability = clamp01(stability + 0.04)

  const confidence = clamp01(
    replacementAllowed
      ? inferred.confidence
      : Math.max(previous.confidence, inferred.confidence * 0.92)
  )

  const state: GeorgeOutcomeState = {
    ...inferred,
    primaryOutcome,
    immediateOutcome: inferred.immediateOutcome || previous.immediateOutcome,
    supportingOutcomes,
    confidence,
    constraints,
    preferences,
    stability,
  }

  let kind: OutcomeEvolutionKind = 'confirmed'
  let reason = 'The latest signal confirms the active outcome.'

  if (replacementAllowed && inferred.primaryOutcome !== previous.primaryOutcome) {
    kind = 'primary_replaced'
    reason = 'The user explicitly signaled a new governing objective.'
  } else if (contradiction) {
    kind = 'contradiction_detected'
    reason = 'The latest signal may conflict with the active outcome or its constraints.'
  } else if (constraints.length > (previous.constraints || []).length) {
    kind = 'constraint_added'
    reason = 'A user-stated constraint was added without replacing the primary outcome.'
  } else if (preferences.length > (previous.preferences || []).length) {
    kind = 'preference_added'
    reason = 'A user preference was added without replacing the primary outcome.'
  } else if (phaseChanged) {
    kind = 'phase_transition'
    reason = `The outcome remains stable while execution moves from ${previous.phase} to ${inferred.phase}.`
  } else if (newSupporting.length > 0) {
    kind = 'supporting_outcome_added'
    reason = 'The latest signal adds a supporting outcome while preserving the primary outcome.'
  } else if (inferred.immediateOutcome !== previous.immediateOutcome) {
    kind = 'refined'
    reason = 'The immediate objective was refined while the primary outcome remained stable.'
  }

  return {
    state,
    kind,
    reason,
    confidenceDelta: confidence - previous.confidence,
    stability,
    phaseTransition: phaseChanged ? { from: previous.phase, to: inferred.phase } : undefined,
    contradiction,
    source: 'outcome_evolution',
  }
}

export function buildOutcomeEvolutionNote(evolution: OutcomeEvolution) {
  return `
OUTCOME EVOLUTION
- Kind: ${evolution.kind}
- Reason: ${evolution.reason}
- Primary outcome: ${evolution.state.primaryOutcome}
- Immediate outcome: ${evolution.state.immediateOutcome}
- Phase: ${evolution.state.phase}
- Stability: ${evolution.stability.toFixed(2)}
- Constraints: ${evolution.state.constraints?.join('; ') || 'none known'}
- Preferences: ${evolution.state.preferences?.join('; ') || 'none known'}
- Do not replace a user-stated primary outcome without explicit or sufficiently strong evidence.
`.trim()
}
