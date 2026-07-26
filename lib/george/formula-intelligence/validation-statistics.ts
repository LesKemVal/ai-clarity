export type ValidationOutcome =
  | 'success'
  | 'partial_success'
  | 'failure'
  | 'unknown'

export type ValidationUsageRecord = {
  outcome: ValidationOutcome
  occurredAt?: string
}

export type ValidationStatistics = {
  usedCount: number
  successfulUseCount: number
  partiallySuccessfulUseCount: number
  unsuccessfulUseCount: number
  knownOutcomeCount: number
  unknownOutcomeCount: number
  successRate: number | null
}

export type PublicValidationSummary = {
  usedLabel: string
  successLabel: string
  successRateLabel: string | null
  usedCount: number
  successfulUseCount: number
  successRate: number | null
}

function normalizeCount(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.trunc(value))
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

export function calculateValidationStatistics(
  records: readonly ValidationUsageRecord[]
): ValidationStatistics {
  let successfulUseCount = 0
  let partiallySuccessfulUseCount = 0
  let unsuccessfulUseCount = 0
  let unknownOutcomeCount = 0

  for (const record of records) {
    switch (record.outcome) {
      case 'success':
        successfulUseCount += 1
        break
      case 'partial_success':
        partiallySuccessfulUseCount += 1
        break
      case 'failure':
        unsuccessfulUseCount += 1
        break
      case 'unknown':
        unknownOutcomeCount += 1
        break
    }
  }

  const usedCount = records.length
  const knownOutcomeCount =
    successfulUseCount + partiallySuccessfulUseCount + unsuccessfulUseCount

  return {
    usedCount,
    successfulUseCount,
    partiallySuccessfulUseCount,
    unsuccessfulUseCount,
    knownOutcomeCount,
    unknownOutcomeCount,
    successRate:
      knownOutcomeCount === 0
        ? null
        : successfulUseCount / knownOutcomeCount,
  }
}

export function createValidationStatistics(input: {
  usedCount: number
  successfulUseCount: number
  partiallySuccessfulUseCount?: number
  unsuccessfulUseCount?: number
  unknownOutcomeCount?: number
}): ValidationStatistics {
  const usedCount = normalizeCount(input.usedCount)
  const successfulUseCount = Math.min(
    usedCount,
    normalizeCount(input.successfulUseCount)
  )
  const partiallySuccessfulUseCount = Math.min(
    usedCount - successfulUseCount,
    normalizeCount(input.partiallySuccessfulUseCount ?? 0)
  )
  const unsuccessfulUseCount = Math.min(
    usedCount - successfulUseCount - partiallySuccessfulUseCount,
    normalizeCount(input.unsuccessfulUseCount ?? 0)
  )
  const inferredUnknownCount = Math.max(
    0,
    usedCount -
      successfulUseCount -
      partiallySuccessfulUseCount -
      unsuccessfulUseCount
  )
  const unknownOutcomeCount = Math.min(
    inferredUnknownCount,
    normalizeCount(input.unknownOutcomeCount ?? inferredUnknownCount)
  )
  const knownOutcomeCount =
    successfulUseCount + partiallySuccessfulUseCount + unsuccessfulUseCount

  return {
    usedCount,
    successfulUseCount,
    partiallySuccessfulUseCount,
    unsuccessfulUseCount,
    knownOutcomeCount,
    unknownOutcomeCount,
    successRate:
      knownOutcomeCount === 0
        ? null
        : successfulUseCount / knownOutcomeCount,
  }
}

export function buildPublicValidationSummary(
  subject: 'script' | 'formula',
  statistics: ValidationStatistics
): PublicValidationSummary {
  const usedCount = normalizeCount(statistics.usedCount)
  const successfulUseCount = Math.min(
    usedCount,
    normalizeCount(statistics.successfulUseCount)
  )
  const successRate =
    statistics.successRate === null
      ? null
      : Math.min(1, Math.max(0, statistics.successRate))

  return {
    usedCount,
    successfulUseCount,
    successRate,
    usedLabel: `Used ${usedCount.toLocaleString('en-US')} ${pluralize(
      usedCount,
      'time'
    )}`,
    successLabel: `${successfulUseCount.toLocaleString(
      'en-US'
    )} successful ${pluralize(successfulUseCount, 'use')}`,
    successRateLabel:
      successRate === null
        ? null
        : `${Math.round(successRate * 100)}% successful across known outcomes`,
  }
}

export function buildScriptValidationSummary(
  statistics: ValidationStatistics
) {
  return buildPublicValidationSummary('script', statistics)
}

export function buildFormulaValidationSummary(
  statistics: ValidationStatistics
) {
  return buildPublicValidationSummary('formula', statistics)
}
