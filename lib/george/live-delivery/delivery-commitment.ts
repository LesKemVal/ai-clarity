export type GeorgeDeliveryCommitmentState = {
  text: string
  armedAt: number
  committed?: boolean
  deliveryStarted?: boolean
  confidence?: number
  priority?: number
}

export type GeorgeDeliveryCandidate = {
  text: string
  now: number
  generatedAt?: number
  deadlineMs?: number
  confidence?: number
  priority?: number
  materiallyBetter?: boolean

  highestPriorityOutcome?: string
  outcomeProbabilityDelta?: number
  outcomeReason?: string
}

export type GeorgeDeliveryCommitmentDecision =
  | { action: 'arm'; text: string; reason: string }
  | { action: 'replace'; text: string; reason: string }
  | { action: 'keep_armed'; text: string; reason: string }
  | { action: 'keep_committed'; text: string; reason: string }
  | { action: 'suppress_duplicate'; text: string; reason: string }

export const GEORGE_OPERATIONAL_BRIDGES = [
  'Say...',
  'Ask why...',
  'Find out...',
  'Clarify...',
  'Confirm...',
  'Did you notice...',
  'Try not to miss...',
] as const

const DEFAULT_DELIVERY_DEADLINE_MS = 1500
const MATERIAL_IMPROVEMENT_DELTA = 0.18

function scoreCandidate(input: {
  confidence?: number
  priority?: number
  outcomeProbabilityDelta?: number
}) {
  const confidence = Number(input.confidence || 0)
  const priority = Number(input.priority || 0)
  const outcome = Number(input.outcomeProbabilityDelta || 0)

  return (
    confidence +
    Math.min(priority,10)/100 +
    outcome
  )
}

export function evaluateGeorgeDeliveryCommitment(input: {
  current?: GeorgeDeliveryCommitmentState | null
  candidate: GeorgeDeliveryCandidate
}): GeorgeDeliveryCommitmentDecision {
  const current = input.current || null
  const candidate = input.candidate
  const text = String(candidate.text || '').trim()

  if (!current) {
    return {
      action: 'arm',
      text,
      reason: 'No armed response exists; candidate may be armed.',
    }
  }

  if (current.text === text) {
    return {
      action: 'suppress_duplicate',
      text: current.text,
      reason: 'Duplicate delivery candidate suppressed.',
    }
  }

  if (current.committed || current.deliveryStarted) {
    return {
      action: 'keep_committed',
      text: current.text,
      reason: 'Delivery has started or committed; do not replace live output.',
    }
  }

  const deadlineMs = candidate.deadlineMs || DEFAULT_DELIVERY_DEADLINE_MS
  const generatedAt = candidate.generatedAt || current.armedAt
  const elapsedMs = Math.max(0, candidate.now - generatedAt)
  const insideWindow = elapsedMs <= deadlineMs

  const currentScore = scoreCandidate({
    confidence: current.confidence,
    priority: current.priority,
  })

  const candidateScore = scoreCandidate(candidate)
  const materiallyBetter =
    Boolean(candidate.materiallyBetter) ||
    candidateScore - currentScore >= MATERIAL_IMPROVEMENT_DELTA

  if (insideWindow && materiallyBetter) {
    return {
      action: 'replace',
      text,
      reason: 'Replacement is materially better and still inside the delivery window.',
    }
  }

  return {
    action: 'keep_armed',
    text: current.text,
    reason: insideWindow
      ? 'Candidate is different but not materially better; preserve timely authenticity.'
      : 'Delivery window closed; preserve timely authenticity.',
  }
}

export function isGeorgeOperationalBridge(text: string) {
  const clean = text.trim().toLowerCase()
  return GEORGE_OPERATIONAL_BRIDGES.some((bridge) => (
    clean === bridge.toLowerCase() ||
    clean.startsWith(bridge.toLowerCase().replace(/\.\.\.$/, ''))
  ))
}


export function improvesHighestPriorityOutcome(input:{
  currentProbability:number
  candidateProbability:number
  minimumGain?:number
}){

  const minimumGain=input.minimumGain ?? 0.05

  return (
    input.candidateProbability-input.currentProbability
  )>=minimumGain
}
