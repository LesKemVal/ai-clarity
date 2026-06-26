export type ContinuationReplacementInput = {
  fallback?: string | null
  transcript?: string | null
  lastFiveSeconds?: string | null
  shadowMap?: string | null
  desiredOutcome?: string | null
  activeOutcome?: string | null
}

function compact(value: unknown, max = 240) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max)
}

export function continuationEvidence(input: ContinuationReplacementInput) {
  return [
    input.transcript,
    input.lastFiveSeconds,
    input.shadowMap,
    input.desiredOutcome,
    input.activeOutcome,
  ].join(' ')
}

export function safeContinuationReplacement(input: ContinuationReplacementInput) {
  const transcript = compact(input.transcript)
  const evidence = compact(
    [
      input.transcript,
      input.lastFiveSeconds,
      input.shadowMap,
      input.desiredOutcome,
      input.activeOutcome,
    ].join(' '),
    600
  )
  const lower = transcript.toLowerCase()
  const evidenceLower = evidence.toLowerCase()

  const stakeTrajectory =
    /\b(stake|equity|ownership|company|deal|valuation|evaluation|\$|billion)\b/i.test(evidenceLower)

  console.info('[GEORGE][continuation][replacement-context]', {
    transcript,
    desiredOutcome: input.desiredOutcome,
    activeOutcome: input.activeOutcome,
    shadowMap: input.shadowMap,
    evidence,
    stakeTrajectory,
  })

  if (/\b(because|reason|why)\b/i.test(lower)) {
    if (stakeTrajectory) {
      return '...because the stake has to make sense on both sides.'
    }

    return '...because that is what has to be made clear.'
  }

  if (/\b(what matters|matters most)\b/i.test(lower)) {
    if (stakeTrajectory) {
      return '...that the terms stay clear on both sides.'
    }

    return '...what has to be decided next.'
  }

  if (/\b(the opportunity|opportunity here)\b/i.test(lower)) {
    if (stakeTrajectory) {
      return '...to make the value and the stake clear enough to evaluate.'
    }

    return '...to explain the value without getting ahead of the evidence.'
  }

  if (/\b(valuation|evaluation|\$|billion|deal|stake)\b/i.test(lower)) {
    if (stakeTrajectory) {
      return '...because the stake has to be supported clearly.'
    }

    return '...because the value has to be supported clearly.'
  }

  if (/\b(what i want|understand)\b/i.test(lower)) {
    if (stakeTrajectory) {
      return '...why the stake matters and what has to be clear next.'
    }

    return '...why this matters and what should happen next.'
  }

  return '...what has to be clear next.'
}
