import type {
  OperationalFormula,
  OperationalFormulaStep,
  OperationalScript,
  OperationalScriptLine,
} from './types'

export type OperationalScriptGenerationOptions = {
  now?: number
  name?: string
}

export type OperationalScriptGenerator = {
  generate(
    formula: OperationalFormula,
    options?: OperationalScriptGenerationOptions
  ): Promise<OperationalScript>
}

function buildId(formula: OperationalFormula) {
  return [
    formula.ownerId ?? 'system',
    formula.id,
    formula.version,
  ].join(':')
}

function buildLine(
  step: OperationalFormulaStep,
  order: number
): OperationalScriptLine {
  const text = [
    step.signalType && `When ${step.signalType.replace(/_/g,' ')}`,
    step.actionType && step.actionType.replace(/_/g,' '),
    step.expectedTransition &&
      `until ${step.expectedTransition.replace(/_/g,' ')}`,
  ].filter(Boolean).join(', ')

  return {
    id: String(order),
    order,
    text,
    purpose: step.signalType,
  }
}

export function createOperationalScriptGenerator(): OperationalScriptGenerator {
  return {
    async generate(formula, options = {}) {
      const now = options.now ?? Date.now()

      return {
        id: buildId(formula),
        version: formula.version,
        ownerId: formula.ownerId ?? 'system',
        organizationId: undefined,
        formulaId: formula.id,
        formulaVersion: formula.version,
        name:
          options.name ??
          formula.objectiveTypes[0] ??
          'Operational Script',
        status: 'draft',
        lines: formula.steps.map((s, i) => buildLine(s, i + 1)),
        createdAt: now,
        updatedAt: now,
      }
    },
  }
}
