import type { OperationalFormula, OperationalFormulaEvidence } from './types'

export type OperationalFormulaValidationStatus =
  | 'candidate'
  | 'validated'
  | 'contested'
  | 'retired'

export type OperationalFormulaValidationPolicy = {
  validatedMinimumSamples: number
  validatedMinimumConfidence: number
  contestedContradictionRatio: number
  retiredContradictionRatio: number
  confidenceLearningRate: number
}

export type OperationalFormulaValidationResult = {
  formula: OperationalFormula
  status: OperationalFormulaValidationStatus
  changed: boolean
  reasons: string[]
}

const DEFAULT_POLICY: OperationalFormulaValidationPolicy = {
  validatedMinimumSamples: 3,
  validatedMinimumConfidence: 0.72,
  contestedContradictionRatio: 0.35,
  retiredContradictionRatio: 0.65,
  confidenceLearningRate: 0.25,
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function evidenceKey(evidence: OperationalFormulaEvidence) {
  return [
    evidence.conversationId,
    evidence.outcomeType,
    evidence.result,
    evidence.confidence,
    evidence.observedAt,
  ].join(':')
}

function mergeEvidence(
  existing: OperationalFormulaEvidence[],
  incoming: OperationalFormulaEvidence[]
) {
  const merged = new Map<string, OperationalFormulaEvidence>()

  for (const evidence of [...existing, ...incoming]) {
    merged.set(evidenceKey(evidence), evidence)
  }

  return [...merged.values()].sort((left, right) => left.observedAt - right.observedAt)
}

function sameFormulaIdentity(
  existing: OperationalFormula,
  candidate: OperationalFormula
) {
  return (
    existing.id === candidate.id &&
    existing.scope === candidate.scope &&
    existing.ownerId === candidate.ownerId
  )
}

function resolveStatus(
  formula: OperationalFormula,
  policy: OperationalFormulaValidationPolicy
): OperationalFormulaValidationResult['status'] {
  if (formula.sampleCount === 0) return 'candidate'

  const contradictionRatio = formula.contradictionCount / formula.sampleCount

  if (contradictionRatio >= policy.retiredContradictionRatio) {
    return 'retired'
  }

  if (contradictionRatio >= policy.contestedContradictionRatio) {
    return 'contested'
  }

  if (
    formula.sampleCount >= policy.validatedMinimumSamples &&
    formula.confidence >= policy.validatedMinimumConfidence
  ) {
    return 'validated'
  }

  return 'candidate'
}

function calculateConfidence(
  existing: OperationalFormula,
  candidate: OperationalFormula,
  policy: OperationalFormulaValidationPolicy
) {
  const evidenceWeight = Math.min(1, candidate.sampleCount / 3)
  const learningRate = policy.confidenceLearningRate * evidenceWeight
  const directionalConfidence =
    candidate.successCount >= candidate.contradictionCount
      ? candidate.confidence
      : 1 - candidate.confidence

  return clamp01(
    existing.confidence * (1 - learningRate) + directionalConfidence * learningRate
  )
}

export function validateOperationalFormula(
  existing: OperationalFormula | null,
  candidate: OperationalFormula,
  overrides: Partial<OperationalFormulaValidationPolicy> = {}
): OperationalFormulaValidationResult {
  const policy = { ...DEFAULT_POLICY, ...overrides }
  const reasons: string[] = []

  if (!existing) {
    const status = resolveStatus(candidate, policy)
    reasons.push('new_formula')
    reasons.push(`status:${status}`)

    return {
      formula: {
        ...candidate,
        status,
      },
      status,
      changed: true,
      reasons,
    }
  }

  if (!sameFormulaIdentity(existing, candidate)) {
    return {
      formula: existing,
      status: resolveStatus(existing, policy),
      changed: false,
      reasons: ['identity_mismatch'],
    }
  }

  const evidence = mergeEvidence(existing.evidence, candidate.evidence)
  const existingEvidenceKeys = new Set(existing.evidence.map(evidenceKey))
  const addedEvidence = evidence.filter(
    (item) => !existingEvidenceKeys.has(evidenceKey(item))
  )

  if (addedEvidence.length === 0) {
    return {
      formula: existing,
      status: resolveStatus(existing, policy),
      changed: false,
      reasons: ['duplicate_evidence'],
    }
  }

  const addedSuccesses = addedEvidence.filter(
    (item) => item.result === 'success'
  ).length
  const addedContradictions = addedEvidence.filter(
    (item) => item.result === 'failure'
  ).length
  const addedUnknowns = addedEvidence.filter(
    (item) => item.result === 'unknown'
  ).length
  const sampleCount = existing.sampleCount + addedEvidence.length
  const successCount = existing.successCount + addedSuccesses
  const contradictionCount =
    existing.contradictionCount + addedContradictions
  const unknownCount = (existing.unknownCount ?? 0) + addedUnknowns
  const reuseCount = (existing.reuseCount ?? existing.sampleCount) + addedEvidence.length

  const formula: OperationalFormula = {
    ...existing,
    version: existing.version,
    roomTypes: [...new Set([...existing.roomTypes, ...candidate.roomTypes])],
    objectiveTypes: [
      ...new Set([...existing.objectiveTypes, ...candidate.objectiveTypes]),
    ],
    prerequisites: [
      ...new Set([...existing.prerequisites, ...candidate.prerequisites]),
    ],
    failureConditions: [
      ...new Set([...existing.failureConditions, ...candidate.failureConditions]),
    ],
    confidence: calculateConfidence(existing, candidate, policy),
    sampleCount,
    successCount,
    contradictionCount,
    unknownCount,
    reuseCount,
    evidence,
    updatedAt: Math.max(existing.updatedAt, candidate.updatedAt),
  }

  const status = resolveStatus(formula, policy)

  reasons.push(`evidence_added:${addedEvidence.length}`)
  reasons.push(`successes:${addedSuccesses}`)
  reasons.push(`contradictions:${addedContradictions}`)
  reasons.push(`unknowns:${addedUnknowns}`)
  reasons.push(`reuse_count:${reuseCount}`)
  reasons.push(`status:${status}`)

  return {
    formula: {
      ...formula,
      status,
    },
    status,
    changed: true,
    reasons,
  }
}
