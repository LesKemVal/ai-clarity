import { MINIMUM_VALIDATION_USES } from './validation-statistics'

export type FormulaBoundaryStatus =
  | 'works_well'
  | 'works_poorly'
  | 'unknown'
  | 'requires_more_evidence'

export type FormulaBoundaryEvidence = {
  dimension: string
  value: string
  usedCount: number
  successfulUseCount: number
  knownOutcomeCount: number
}

export type FormulaBoundaryAssessment = {
  dimension: string
  value: string
  usedCount: number
  knownOutcomeCount: number
  usesUntilValidation: number
  isValidationEligible: boolean
  outcomeCoveragePercentage: number
  successPercentage: number | null
  status: FormulaBoundaryStatus
}

export type FormulaBoundaryThresholds = {
  worksWellPercentage: number
  worksPoorlyPercentage: number
  minimumOutcomeCoveragePercentage: number
}

export const DEFAULT_FORMULA_BOUNDARY_THRESHOLDS: FormulaBoundaryThresholds = {
  worksWellPercentage: 70,
  worksPoorlyPercentage: 40,
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
  if (denominator <= 0) return 0
  return clampPercentage((numerator / denominator) * 100)
}

export function assessFormulaBoundary(
  evidence: FormulaBoundaryEvidence,
  thresholds: FormulaBoundaryThresholds = DEFAULT_FORMULA_BOUNDARY_THRESHOLDS
): FormulaBoundaryAssessment {
  const usedCount = normalizeCount(evidence.usedCount)
  const knownOutcomeCount = Math.min(
    usedCount,
    normalizeCount(evidence.knownOutcomeCount)
  )
  const successfulUseCount = Math.min(
    knownOutcomeCount,
    normalizeCount(evidence.successfulUseCount)
  )
  const usesUntilValidation = Math.max(
    0,
    MINIMUM_VALIDATION_USES - usedCount
  )
  const isValidationEligible = usedCount >= MINIMUM_VALIDATION_USES
  const outcomeCoveragePercentage = percentage(
    knownOutcomeCount,
    usedCount
  )
  const successPercentage =
    knownOutcomeCount === 0
      ? null
      : percentage(successfulUseCount, knownOutcomeCount)

  let status: FormulaBoundaryStatus = 'unknown'

  if (!isValidationEligible) {
    status = 'requires_more_evidence'
  } else if (
    outcomeCoveragePercentage <
    clampPercentage(thresholds.minimumOutcomeCoveragePercentage)
  ) {
    status = 'requires_more_evidence'
  } else if (successPercentage === null) {
    status = 'unknown'
  } else if (
    successPercentage >= clampPercentage(thresholds.worksWellPercentage)
  ) {
    status = 'works_well'
  } else if (
    successPercentage <= clampPercentage(thresholds.worksPoorlyPercentage)
  ) {
    status = 'works_poorly'
  }

  return {
    dimension: evidence.dimension,
    value: evidence.value,
    usedCount,
    knownOutcomeCount,
    usesUntilValidation,
    isValidationEligible,
    outcomeCoveragePercentage,
    successPercentage,
    status,
  }
}

export function assessFormulaBoundaries(
  evidence: readonly FormulaBoundaryEvidence[],
  thresholds: FormulaBoundaryThresholds = DEFAULT_FORMULA_BOUNDARY_THRESHOLDS
) {
  return evidence.map((item) => assessFormulaBoundary(item, thresholds))
}

export function formatFormulaBoundaryAssessment(
  assessment: FormulaBoundaryAssessment
) {
  if (assessment.status === 'requires_more_evidence') {
    if (!assessment.isValidationEligible) {
      return `${assessment.usesUntilValidation.toLocaleString(
        'en-US'
      )} more uses required before this boundary can be validated`
    }

    return `${Math.round(
      assessment.outcomeCoveragePercentage
    )}% outcome coverage; more evidence required`
  }

  if (assessment.successPercentage === null) {
    return 'Boundary outcome is unknown'
  }

  const success = `${Math.round(assessment.successPercentage)}% successful`

  if (assessment.status === 'works_well') {
    return `${success} in this context`
  }

  if (assessment.status === 'works_poorly') {
    return `${success} in this context; operational boundary discovered`
  }

  return `${success} in this context; boundary remains inconclusive`
}
