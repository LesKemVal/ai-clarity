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

function trimTerminal(value: string) {
  return value.replace(/[.!?;:\s]+$/, '').trim()
}

function lowerFirst(value: string) {
  if (!value) return value
  return value.charAt(0).toLowerCase() + value.slice(1)
}

function words(value: string) {
  return compact(value, 500).split(/\s+/).filter(Boolean)
}

function objectivePhrase(input: ContinuationReplacementInput) {
  const objective = trimTerminal(
    compact(input.activeOutcome || input.desiredOutcome, 220)
  )

  if (!objective) return ''

  const normalized = lowerFirst(objective)

  if (/^(to|whether|why|how|what|when|where|who|that|if|because)\b/i.test(normalized)) {
    return normalized
  }

  if (/^(secure|evaluate|protect|build|clarify|decide|determine|negotiate|explain|present|answer|gather|resolve|teach|learn|show|move|leave)\b/i.test(normalized)) {
    return `to ${normalized}`
  }

  return normalized
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
  const objective = objectivePhrase(input)
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
  })

  if (objective && /\b(because|reason|why)\b/i.test(lower)) {
    return `...because the conversation has to stay tied ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (objective && /\b(what matters|matters most|the point)\b/i.test(lower)) {
    return `...whether this moves us closer ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (objective && /\b(if we|when we|before we)\b/i.test(lower)) {
    return `...we should keep the next step tied ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (objective && /\b(the concern|the issue|the risk)\b/i.test(lower)) {
    return `...is whether that affects our ability ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (objective && /\b(the value|the opportunity)\b/i.test(lower)) {
    return `...is in how clearly it supports our ability ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (objective && /\b(what i want|what we need|understand)\b/i.test(lower)) {
    return `...is why this needs to stay connected ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (objective && (continuationRuntime || premiseStarted || strength !== 'minimal')) {
    return `...so the next words should stay tied ${objective.startsWith('to ') ? objective : `to ${objective}`}.`
  }

  if (fallback.startsWith('...') && fallback.length <= 180) {
    return fallback
  }

  return '...so the next point stays tied to the outcome.'
}
