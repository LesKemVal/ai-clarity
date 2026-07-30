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

          const now = Date.now()
          const childFormulaId = crypto.randomUUID()

          const evolvedFormula: OperationalFormula = {
            ...input.formula,
            id: childFormulaId,
            version: 1,
            origin: 'derived',
            parentFormulaId: input.formula.id,
            confidence: reassessment.confidenceAfter,
            evidence: [...reassessment.evidence],
            createdAt: now,
            updatedAt: now,
          }

          const lineage: OperationalFormulaLineage = {
            id: crypto.randomUUID(),
            kind: 'derived',
            source: 'operational_learning',
            parentFormulaIds: [input.formula.id],
            childFormulaId,
            conversationId: input.conversation.id,
            reassessmentId: reassessment.id,
            reasons: reassessment.reasons,
            createdAt: now,
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
            source: 'operational_learning',
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
