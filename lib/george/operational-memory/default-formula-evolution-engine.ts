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
        case 'weaken':
        case 'insufficient_evidence':
          return {}
      }

    },

  }

}
