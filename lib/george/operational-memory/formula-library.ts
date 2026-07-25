import type {
  FormulaRetrievalContext,
  OperationalFormula,
  RetrievedOperationalFormula,
} from './types'

export type OperationalFormulaLibrary = {
  retrieve(context: FormulaRetrievalContext): Promise<RetrievedOperationalFormula[]>
  getById(id: string): Promise<OperationalFormula | null>
  save(formula: OperationalFormula): Promise<void>
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function includesOrUnrestricted(values: string[], value?: string) {
  return values.length === 0 || (!!value && values.includes(value))
}

export function scoreOperationalFormula(
  formula: OperationalFormula,
  context: FormulaRetrievalContext
): RetrievedOperationalFormula | null {
  const reasons: string[] = []

  if (formula.scope === 'personal' && formula.ownerId !== context.userId) {
    return null
  }

  if (
    formula.scope === 'organization' &&
    (!context.organizationId || formula.ownerId !== context.organizationId)
  ) {
    return null
  }

  if (!includesOrUnrestricted(formula.roomTypes, context.roomType)) {
    return null
  }

  if (!includesOrUnrestricted(formula.objectiveTypes, context.objectiveType)) {
    return null
  }

  let score = formula.confidence * 0.5
  reasons.push(`confidence:${formula.confidence.toFixed(2)}`)

  if (formula.scope === 'personal') {
    score += 0.3
    reasons.push('personal')
  } else if (formula.scope === 'organization') {
    score += 0.2
    reasons.push('organization')
  } else {
    score += 0.1
    reasons.push('general')
  }

  if (context.roomType && formula.roomTypes.includes(context.roomType)) {
    score += 0.08
    reasons.push('room')
  }

  if (
    context.objectiveType &&
    formula.objectiveTypes.includes(context.objectiveType)
  ) {
    score += 0.08
    reasons.push('objective')
  }

  const requiredSignals = formula.prerequisites
  const matchedSignals = requiredSignals.filter((signalType) =>
    context.observedSignalTypes.includes(signalType)
  )

  if (requiredSignals.length > 0) {
    const prerequisiteMatch = matchedSignals.length / requiredSignals.length
    score += prerequisiteMatch * 0.14
    reasons.push(`prerequisites:${matchedSignals.length}/${requiredSignals.length}`)
  }

  return {
    formula,
    score: clamp01(score),
    reasons,
  }
}

export function rankOperationalFormulas(
  formulas: OperationalFormula[],
  context: FormulaRetrievalContext
) {
  const limit = Math.max(1, context.limit ?? 5)

  return formulas
    .map((formula) => scoreOperationalFormula(formula, context))
    .filter((result): result is RetrievedOperationalFormula => result !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}
