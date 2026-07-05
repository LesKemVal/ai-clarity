export type GeorgeOperationalUnderstandingInput = {
  transcript?: string
  objective?: string
  room?: string
  knownContext?: string
  briefingKnowledge?: string
  userPosition?: string
  persistentSignals?: string[]
}

export type GeorgeOperationalUnderstanding = {
  context: string
  synthesizedObjective: string
  synthesizedRole: string
  operationalObjective: string
  objectiveSource: 'explicit' | 'inferred' | 'default'
  hasStrategicCommercializationSignal: boolean
  persistentSignals: string[]
  persistentSignalSummary: string
}

function clean(value?: string) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function buildGeorgeOperationalUnderstanding(
  input: GeorgeOperationalUnderstandingInput
): GeorgeOperationalUnderstanding {
  const objective = clean(input.objective)
  const room = clean(input.room)
  const knownContext = clean(input.knownContext)
  const briefingKnowledge = clean(input.briefingKnowledge)
  const userPosition = clean(input.userPosition)
  const persistentSignals = Array.from(new Set(input.persistentSignals || []))
    .map(clean)
    .filter(Boolean)
    .slice(0, 6)

  const context = [objective, room, knownContext, briefingKnowledge, userPosition, persistentSignals.join(' ')]
    .filter(Boolean)
    .join(' ')

  const hasCommercialAudienceSignal =
    /\b(strategic partner|investor|investment|licensing|partnership|due diligence|commercialization|enterprise)\b/i.test(context)

  const hasCommercialEvidenceSignal =
    /\b(proof|evidence|pilot|customer|revenue|deployment|integration|scale|security|privacy|risk|concern|objection|confidence)\b/i.test(context)

  const hasStrategicCommercializationSignal =
    hasCommercialAudienceSignal && hasCommercialEvidenceSignal

  const synthesizedObjective = hasStrategicCommercializationSignal
    ? 'create enough confidence in GEORGE as operational intelligence that the conversation advances toward partnership, licensing, investment, or continued due diligence'
    : objective
      ? objective.replace(/^secure\s+/i, '').replace(/\.$/, '')
      : 'move this conversation toward the desired outcome using the strongest available evidence, timing, and communication strategy'

  const roleEvidence = [userPosition, room, knownContext, briefingKnowledge]
    .filter(Boolean)
    .join(' ')

  const roles = [
    /\bfounder\b/i.test(roleEvidence) ? 'Founder' : '',
    /\bceo\b/i.test(roleEvidence) ? 'CEO' : '',
    /lead negotiator|negotiator/i.test(roleEvidence) ? 'lead negotiator' : '',
    /presenter/i.test(roleEvidence) ? 'presenter' : '',
    /decision maker|decision-maker/i.test(roleEvidence) ? 'decision maker' : '',
  ].filter(Boolean)

  const synthesizedRole = roles.length
    ? roles.join(', ')
    : 'the person responsible for advancing the conversation toward the desired outcome'

  const objectiveSource: GeorgeOperationalUnderstanding['objectiveSource'] =
    objective
      ? 'explicit'
      : hasStrategicCommercializationSignal
        ? 'inferred'
        : 'default'

  const operationalObjective =
    objectiveSource === 'default'
      ? "observe the conversation, preserve credibility and optionality, and support the user while the objective becomes clear through accumulating signals"
      : synthesizedObjective

  const persistentSignalSummary = persistentSignals.length
    ? `Persistent conversation signals: ${persistentSignals.join(', ')}.`
    : ''

  return {
    context,
    synthesizedObjective,
    synthesizedRole,
    operationalObjective,
    objectiveSource,
    hasStrategicCommercializationSignal,
    persistentSignals,
    persistentSignalSummary,
  }
}
