function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function includesAny(text, terms) {
  const lower = text.toLowerCase()
  return terms.some((term) => lower.includes(term))
}

export function buildOutcomeConsistency(input = {}) {
  const primaryOutcome = clean(input.desiredOutcome) || 'Unspecified desired outcome'
  const secondaryOutcome =
    clean(input.secondaryOutcome) ||
    clean(input.possibleSecondaryOutcome) ||
    ''

  const signal = [
    primaryOutcome,
    secondaryOutcome,
    clean(input.objectiveEvolution),
    clean(input.roomSignal),
  ].filter(Boolean).join(' ').toLowerCase()

  if (!secondaryOutcome) {
    return {
      primaryOutcome,
      secondaryOutcome,
      consistency: 'unknown',
      preserveBothViable: false,
      userAuthorityRequired: false,
      contradiction: '',
      availablePaths: ['Continue pursuing the desired outcome while watching for confirmation or contradiction signals.'],
      bestAvailablePath: 'Preserve the declared desired outcome as authority until the user or room supplies stronger signal.',
      reasoning: 'No secondary outcome was supplied; GEORGE should not invent one.',
    }
  }

  const confidentialityConflict =
    includesAny(primaryOutcome, ['announce', 'public', 'publish', 'share publicly']) &&
    includesAny(secondaryOutcome, ['confidential', 'private', 'do not disclose', 'keep quiet'])

  const pressureTension =
    includesAny(primaryOutcome, ['close today', 'close now', 'get commitment', 'force decision']) &&
    includesAny(secondaryOutcome, ['avoid pressure', 'no pressure', 'preserve trust', 'preserve relationship', 'good terms'])

  const evidenceTension =
    includesAny(primaryOutcome, ['investment', 'funding', 'raise', 'due diligence', 'decision']) &&
    includesAny(secondaryOutcome, ['avoid valuation', 'avoid numbers', 'do not discuss evidence', 'no proof'])

  const impossible = confidentialityConflict
  const tension = pressureTension || evidenceTension
  const contradiction = impossible
    ? 'The declared outcomes may not be executable together in the current form.'
    : tension
      ? 'The secondary outcome may constrain the strongest path toward the primary desired outcome.'
      : ''

  const consistency =
    impossible ? 'impossible_combination' : tension ? 'tension' : 'compatible'

  const preserveBothViable = consistency === 'compatible' || consistency === 'tension'
  const userAuthorityRequired = consistency === 'tension' || consistency === 'contradiction' || consistency === 'impossible_combination'

  const availablePaths =
    consistency === 'compatible'
      ? [
          'Pursue the primary desired outcome while preserving the secondary outcome.',
          'Keep the secondary outcome viable as long as it strengthens the user position.',
        ]
      : consistency === 'tension'
        ? [
            'Surface the tradeoff to the user before stronger execution.',
            'Preserve both outcomes until the user resolves priority.',
            'Choose restraint if pushing one outcome would unnecessarily damage the other.',
          ]
        : [
            'Ask the user to resolve the outcome conflict before executing.',
            'Avoid silently replacing the user desired outcome.',
          ]

  const bestAvailablePath =
    consistency === 'compatible'
      ? 'Advance the desired outcome while keeping the secondary outcome viable.'
      : consistency === 'tension'
        ? 'Preserve both outcomes and ask for user priority before the runtime over-optimizes one path.'
        : 'Pause stronger execution until the user resolves the contradiction.'

  return {
    primaryOutcome,
    secondaryOutcome,
    consistency,
    preserveBothViable,
    userAuthorityRequired,
    contradiction,
    availablePaths,
    bestAvailablePath,
    reasoning:
      consistency === 'compatible'
        ? 'The declared outcomes appear operationally compatible.'
        : consistency === 'tension'
          ? 'The declared outcomes may both remain viable, but execution requires user priority.'
          : 'GEORGE must not silently replace or reconcile conflicting user outcomes.',
  }
}
