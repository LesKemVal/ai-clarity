import 'server-only'

import type {
  OperationalFormulaEvolutionEngine,
  OperationalFormulaEvolutionResult,
} from './formula-evolution-engine'

import type {
  OperationalFormula,
  OperationalFormulaLineage,
} from './types'

export function createDefaultOperationalFormulaEvolutionEngine():
OperationalFormulaEvolutionEngine {

  return {

    async evolve(input): Promise<OperationalFormulaEvolutionResult> {

      const reassessment = input.reassessment

      switch (reassessment.decision) {

        case 'confirm':
        case 'insufficient_evidence':
          return {}

        case 'weaken':
        case 'contest':
        case 'evolve': {

          const evolvedFormula: OperationalFormula = {
            ...input.formula,
            version: input.formula.version + 1,
            confidence: reassessment.confidenceAfter,
            updatedAt: Date.now(),
          }

          const lineage: OperationalFormulaLineage = {
            id: crypto.randomUUID(),
            kind: 'derived',
            parentFormulaIds: [input.formula.id],
            childFormulaId: evolvedFormula.id,
            conversationId: input.conversation.id,
            reassessmentId: reassessment.id,
            reasons: reassessment.reasons,
            createdAt: Date.now(),
          }

          return {
            formula: evolvedFormula,
            lineage,
          }
        }

        case 'retire': {

          const lineage: OperationalFormulaLineage = {
            id: crypto.randomUUID(),
            kind: 'retirement',
            parentFormulaIds: [input.formula.id],
            conversationId: input.conversation.id,
            reassessmentId: reassessment.id,
            reasons: reassessment.reasons,
            createdAt: Date.now(),
          }

          return {
            lineage,
          }
        }

      }

    },

  }

}
