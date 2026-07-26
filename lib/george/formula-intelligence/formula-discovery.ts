import { MINIMUM_VALIDATION_USES } from './validation-statistics'

export type FormulaDiscoveryStage =
  | 'hypothesis'
  | 'candidate'
  | 'ready_for_validation'
  | 'rejected'

export type FormulaDiscoveryEvidence = {
  observedUseCount: number
  supportingUseCount: number
  contradictingUseCount: number
  knownOutcomeCount: number
}

export type FormulaDiscoveryAssessment = {
  stage: FormulaDiscoveryStage
  observedUseCount: number
  knownOutcomeCount: number
  supportPercentage: number | null
  contradictionPercentage: number | null
  outcomeCoveragePercentage: number
  usesUntilValidation: number
  isValidationEligible: boolean
}

export type FormulaDiscoveryThresholds = {
  minimumCandidateSupportPercentage: number
  minimumValidationSupportPercentage: number
  rejectionContradictionPercentage: number
  minimumOutcomeCoveragePercentage: number
}

export const DEFAULT_FORMULA_DISCOVERY_THRESHOLDS: FormulaDiscoveryThresholds = {
  minimumCandidateSupportPercentage: 60,
  minimumValidationSupportPercentage: 70,
  rejectionContradictionPercentage: 60,
  minimumOutcomeCoveragePercentage: 50,
}

function normalizeCount(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.trunc(value))
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function percentage(numerator: number, denominator: number) {
  if (denominator <= 0) return null
  return clampPercentage((numerator / denominator) * 100)
}

export function assessFormulaDiscovery(
  evidence: FormulaDiscoveryEvidence,
  thresholds: FormulaDiscoveryThresholds = DEFAULT_FORMULA_DISCOVERY_THRESHOLDS
): FormulaDiscoveryAssessment {
  const observedUseCount = normalizeCount(evidence.observedUseCount)
  const knownOutcomeCount = Math.min(
    observedUseCount,
    normalizeCount(evidence.knownOutcomeCount)
  )
  const supportingUseCount = Math.min(
    knownOutcomeCount,
    normalizeCount(evidence.supportingUseCount)
  )
  const contradictingUseCount = Math.min(
    knownOutcomeCount - supportingUseCount,
    normalizeCount(evidence.contradictingUseCount)
  )
  const supportPercentage = percentage(
    supportingUseCount,
    knownOutcomeCount
  )
  const contradictionPercentage = percentage(
    contradictingUseCount,
    knownOutcomeCount
  )
  const outcomeCoveragePercentage =
    percentage(knownOutcomeCount, observedUseCount) ?? 0
  const usesUntilValidation = Math.max(
    0,
    MINIMUM_VALIDATION_USES - observedUseCount
  )
  const isValidationEligible =
    observedUseCount >= MINIMUM_VALIDATION_USES

  let stage: FormulaDiscoveryStage = 'hypothesis'

  if (
    contradictionPercentage !== null &&
    contradictionPercentage >=
      clampPercentage(thresholds.rejectionContradictionPercentage)
  ) {
    stage = 'rejected'
  } else if (
    isValidationEligible &&
    outcomeCoveragePercentage >=
      clampPercentage(thresholds.minimumOutcomeCoveragePercentage) &&
    supportPercentage !== null &&
    supportPercentage >=
      clampPercentage(thresholds.minimumValidationSupportPercentage)
  ) {
    stage = 'ready_for_validation'
  } else if (
    supportPercentage !== null &&
    supportPercentage >=
      clampPercentage(thresholds.minimumCandidateSupportPercentage)
  ) {
    stage = 'candidate'
  }

  return {
    stage,
    observedUseCount,
    knownOutcomeCount,
    supportPercentage,
    contradictionPercentage,
    outcomeCoveragePercentage,
    usesUntilValidation,
    isValidationEligible,
  }
}

export function formatFormulaDiscoveryAssessment(
  assessment: FormulaDiscoveryAssessment
) {
  if (assessment.stage === 'rejected') {
    return 'Hypothesis rejected by contradictory evidence'
  }

  if (assessment.stage === 'ready_for_validation') {
    return `${Math.round(
      assessment.supportPercentage ?? 0
    )}% supported and ready for validation`
  }

  if (assessment.stage === 'candidate') {
    if (!assessment.isValidationEligible) {
      return `${Math.round(
        assessment.supportPercentage ?? 0
      )}% supported; ${assessment.usesUntilValidation.toLocaleString(
        'en-US'
      )} more uses required before validation`
    }

    return `${Math.round(
      assessment.supportPercentage ?? 0
    )}% supported; more outcome evidence required`
  }

  return 'Hypothesis remains under observation'
}
