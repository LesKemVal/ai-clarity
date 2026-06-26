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

function words(value: string) {
  return compact(value, 500).split(/\s+/).filter(Boolean)
}

function premiseStrength(input: ContinuationReplacementInput) {
  const count = words(input.transcript || '').length

  if (count >= 10) return 'strong'
  if (count >= 5) return 'developing'
  if (count >= 2) return 'thin'
  return 'minimal'
}

function hasContinuationRuntime(input: ContinuationReplacementInput) {
  return /\b(continue|continue_thought|presentation_continuation)\b/i.test(
    [input.shadowMap, input.lastFiveSeconds].join(' ')
  )
}

function hasPremiseStarter(value: string) {
  return /\b(because|reason|why|what matters|matters most|the point|the opportunity|what i want|what we need|if we|when we|before we|the concern|the issue|the risk|the value|the decision)\b/i.test(value)
}

function preservesSeparationProposition(value: string) {
  return (
    /\b(separate|separately|distinguish|split|divide)\b/i.test(value) &&
    /\b(timeline|timing|cost|price|budget|terms|scope|risk|concern|issue)\b/i.test(value)
  )
}

function preservesConcernProposition(value: string) {
  return /\b(concern|issue|risk|objection)\b/i.test(value)
}

function preservesCentralIdeaProposition(value: string) {
  return /\b(what i want|what we need|understand|the point|what matters|matters most)\b/i.test(value)
}

function preservesConditionProposition(value: string) {
  return /\b(if we|when we|before we|once we|unless we)\b/i.test(value)
}

function preservesCauseProposition(value: string) {
  return /\b(because|the reason|why)\b/i.test(value)
}

function containsUnsupportedRiskTerms(value: string) {
  return /\b(investment|investor|partnership|valuation|equity|stake|acquisition|merger|lawsuit|diagnosis|guarantee|guaranteed)\b/i.test(value)
}

function safeFallbackPreservesTrajectory(fallback: string) {
  if (!fallback.startsWith('...')) return false
  if (fallback.length > 180) return false
  if (containsUnsupportedRiskTerms(fallback)) return false
  if (/\b(has to|must|guarantee|certainly|definitely)\b/i.test(fallback)) return false

  return true
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
  const fallback = compact(input.fallback)
  const evidence = compact(
    [
      input.transcript,
      input.lastFiveSeconds,
      input.shadowMap,
      input.desiredOutcome,
      input.activeOutcome,
    ].join(' '),
    800
  )
  const lower = transcript.toLowerCase()
  const strength = premiseStrength(input)
  const continuationRuntime = hasContinuationRuntime(input)
  const premiseStarted = hasPremiseStarter(lower)

  console.info('[GEORGE][continuation][replacement-context]', {
    transcript,
    fallback,
    desiredOutcome: input.desiredOutcome,
    activeOutcome: input.activeOutcome,
    lastFiveSeconds: input.lastFiveSeconds,
    shadowMap: input.shadowMap,
    evidence,
    premiseStrength: strength,
    continuationRuntime,
    premiseStarted,
    proposition: {
      separation: preservesSeparationProposition(lower),
      concern: preservesConcernProposition(lower),
      centralIdea: preservesCentralIdeaProposition(lower),
      condition: preservesConditionProposition(lower),
      cause: preservesCauseProposition(lower),
    },
  })

  if (preservesSeparationProposition(lower)) {
    return '...so we can address each issue clearly instead of combining them too early.'
  }

  if (preservesConcernProposition(lower)) {
    return '...is something we should address directly without letting it take over the whole conversation.'
  }

  if (preservesCentralIdeaProposition(lower)) {
    return '...is the central point I want to keep in front of us.'
  }

  if (preservesConditionProposition(lower)) {
    return '...then we should be clear about what changes and what stays the same.'
  }

  if (preservesCauseProposition(lower)) {
    return '...because that is the part that explains the decision.'
  }

  if (safeFallbackPreservesTrajectory(fallback)) {
    return fallback
  }

  if (continuationRuntime || premiseStarted || strength !== 'minimal') {
    return '...so the next point follows from what I was saying.'
  }

  return '...so the thought stays connected.'
}
