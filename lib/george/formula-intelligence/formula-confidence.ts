import {
  MINIMUM_VALIDATION_USES,
  type ValidationStatistics,
} from './validation-statistics'

export type FormulaConfidenceAssessment = {
  usedCount: number
  knownOutcomeCount: number
  minimumValidationUses: number
  isValidationEligible: boolean
  usesUntilValidation: number
  successPercentage: number | null
  outcomeCoveragePercentage: number
  validatedPercentage: number | null
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function toPercentage(value: number) {
  return clampPercentage(value * 100)
}

export function assessFormulaConfidence(
  statistics: ValidationStatistics
): FormulaConfidenceAssessment {
  const usedCount = Math.max(0, Math.trunc(statistics.usedCount))
  const knownOutcomeCount = Math.min(
    usedCount,
    Math.max(0, Math.trunc(statistics.knownOutcomeCount))
  )
  const isValidationEligible = usedCount >= MINIMUM_VALIDATION_USES
  const usesUntilValidation = Math.max(
    0,
    MINIMUM_VALIDATION_USES - usedCount
  )
  const successPercentage =
    statistics.successRate === null
      ? null
      : toPercentage(statistics.successRate)
  const outcomeCoveragePercentage =
    usedCount === 0 ? 0 : toPercentage(knownOutcomeCount / usedCount)

  return {
    usedCount,
    knownOutcomeCount,
    minimumValidationUses: MINIMUM_VALIDATION_USES,
    isValidationEligible,
    usesUntilValidation,
    successPercentage,
    outcomeCoveragePercentage,
    validatedPercentage:
      isValidationEligible && successPercentage !== null
        ? successPercentage
        : null,
  }
}

export function formatFormulaConfidencePercentage(
  assessment: FormulaConfidenceAssessment
) {
  if (!assessment.isValidationEligible) {
    return `${assessment.usesUntilValidation.toLocaleString(
      'en-US'
    )} more uses required before validation`
  }

  if (assessment.validatedPercentage === null) {
    return 'Validation percentage unavailable until outcomes are known'
  }

  return `${Math.round(assessment.validatedPercentage)}% validated`
}

export function formatOutcomeCoveragePercentage(
  assessment: FormulaConfidenceAssessment
) {
  return `${Math.round(
    assessment.outcomeCoveragePercentage
  )}% of uses have known outcomes`
}
