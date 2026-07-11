export type ActiveOutcomeInput = {
  desiredOutcome?: string
  room?: string
  transcript?: string
  userPosition?: string
  knownContext?: string
}

export type GeorgeOutcomePhase =
  | 'preparation'
  | 'execution'
  | 'recovery'
  | 'closing'
  | 'complete'
  | 'unknown'

export type GeorgeOutcomeState = {
  primaryOutcome: string
  immediateOutcome: string
  supportingOutcomes: string[]
  confidence: number
  phase: GeorgeOutcomePhase
  constraints?: string[]
  preferences?: string[]
  stability?: number
  source: 'active_outcome'
}

export type GeorgeOutcomeStateInput = ActiveOutcomeInput & {
  objectiveKnown?: boolean
  signalUsable?: boolean
  executionImminent?: boolean
}

function text(value: unknown) {
  return String(value || '').toLowerCase().trim()
}

function sentence(value: unknown) {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ')
  if (!normalized) return ''
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`
}

function includesAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term))
}

function deriveImmediateOutcome(input: ActiveOutcomeInput) {
  const desiredOutcome = text(input.desiredOutcome)
  const room = text(input.room)
  const transcript = text(input.transcript)
  const userPosition = text(input.userPosition)
  const knownContext = text(input.knownContext)
  const combined = [desiredOutcome, room, transcript, userPosition, knownContext].join(' ')

  if (!combined.trim()) {
    return 'Establish the active outcome without over-collecting information.'
  }

  if (includesAny(combined, ['leadership', 'manage', 'managed', 'team', 'led ', 'supervisor'])) {
    return 'Demonstrate leadership credibility.'
  }

  if (includesAny(combined, ['why did you leave', 'left your last', 'fired', 'termination', 'gap'])) {
    return 'Reduce concern and protect reliability.'
  }

  if (includesAny(combined, ['salary', 'compensation', 'offer', 'counter', 'terms'])) {
    return 'Protect leverage while keeping the opportunity alive.'
  }

  if (includesAny(combined, ['numbers', 'forecast', 'projection', 'variance', 'assumption', 'methodology'])) {
    return 'Protect credibility by clarifying the basis of the claim.'
  }

  if (includesAny(combined, ['objection', 'pushback', 'challenged', 'concern', 'hesitation'])) {
    return 'Identify the concern and protect the desired outcome.'
  }

  if (includesAny(room, ['interview']) || includesAny(desiredOutcome, ['job', 'hired', 'offer'])) {
    return 'Convert the current question into evidence the user deserves the role.'
  }

  if (includesAny(room, ['negotiation']) || includesAny(userPosition, ['negotiating'])) {
    return 'Preserve leverage while moving toward agreement.'
  }

  if (includesAny(room, ['board', 'meeting', 'executive'])) {
    return 'Preserve credibility and move the room toward a decision.'
  }

  return 'Advance the desired outcome through the current room signal.'
}

function derivePrimaryOutcome(combined: string, desiredOutcome: string, immediateOutcome: string) {
  if (desiredOutcome) return sentence(desiredOutcome)
  if (/investor|investment|venture|vc|fundrais|capital|term sheet/.test(combined)) {
    return 'Advance the financing outcome while protecting long-term control and leverage.'
  }
  if (/interview|candidate|job offer|hiring/.test(combined)) {
    return 'Earn the opportunity by establishing fit, judgment, and execution credibility.'
  }
  if (/negotiat|counteroffer|salary|compensation|terms|price/.test(combined)) {
    return 'Reach a stronger agreement without giving away unnecessary leverage.'
  }
  if (/learn|understand|explain|research|what is|how does/.test(combined)) {
    return 'Build accurate understanding that the user can apply.'
  }
  return immediateOutcome
}

function deriveSupportingOutcomes(combined: string) {
  const outcomes: string[] = []
  if (/investor|investment|venture|vc|fundrais|capital|term sheet/.test(combined)) {
    outcomes.push(
      'Strengthen confidence in execution.',
      'Preserve strategic leverage.',
      'Secure a clear commitment or next step.'
    )
  }
  if (/interview|candidate|job offer|hiring/.test(combined)) {
    outcomes.push(
      'Demonstrate role-relevant evidence.',
      'Reduce uncertainty about fit.',
      'Move toward an offer or clear next step.'
    )
  }
  if (/negotiat|counteroffer|salary|compensation|terms|price/.test(combined)) {
    outcomes.push(
      'Clarify the real tradeoff.',
      'Protect non-negotiables.',
      'Keep agreement possible.'
    )
  }
  return Array.from(new Set(outcomes)).slice(0, 4)
}

function derivePhase(combined: string, executionImminent: boolean): GeorgeOutcomePhase {
  if (/completed|done|closed|signed|accepted|finished/.test(combined)) return 'complete'
  if (/recover|bring me back|interrupted|lost my place/.test(combined)) return 'recovery'
  if (/close|final decision|commitment|sign today/.test(combined)) return 'closing'
  if (executionImminent || /right now|starts? in|begins? in|walking into|in the room|on the call/.test(combined)) {
    return 'execution'
  }
  if (combined.trim()) return 'preparation'
  return 'unknown'
}

export function resolveGeorgeOutcomeState(input: GeorgeOutcomeStateInput): GeorgeOutcomeState {
  const desiredOutcome = String(input.desiredOutcome || '').trim()
  const combined = [
    desiredOutcome,
    input.room,
    input.transcript,
    input.userPosition,
    input.knownContext,
  ]
    .map((value) => text(value))
    .join(' ')

  const immediateOutcome = deriveImmediateOutcome(input)
  const confidence = Math.max(
    0.2,
    Math.min(
      0.95,
      (input.objectiveKnown ? 0.48 : 0.2) +
        (input.signalUsable ? 0.24 : 0) +
        (desiredOutcome ? 0.18 : 0)
    )
  )

  return {
    primaryOutcome: derivePrimaryOutcome(combined, desiredOutcome, immediateOutcome),
    immediateOutcome,
    supportingOutcomes: deriveSupportingOutcomes(combined),
    confidence,
    phase: derivePhase(combined, Boolean(input.executionImminent)),
    constraints: [],
    preferences: [],
    stability: confidence,
    source: 'active_outcome',
  }
}

export function deriveActiveOutcome(input: ActiveOutcomeInput) {
  return resolveGeorgeOutcomeState(input).immediateOutcome
}
