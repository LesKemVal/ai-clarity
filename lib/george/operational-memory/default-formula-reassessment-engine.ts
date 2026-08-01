import 'server-only'

import type {
  OperationalFormulaReassessmentEngine,
} from './formula-reassessment-engine'

import type {
  OperationalFormulaReassessment,
} from './types'

export function createDefaultOperationalFormulaReassessmentEngine():
OperationalFormulaReassessmentEngine {

  return {

    async reassess(input) {

      const execution = input.scriptExecution

      let decision: OperationalFormulaReassessment['decision'] =
        'insufficient_evidence'

      const confidenceBefore = input.formula.confidence

      const confidenceAfter = confidenceBefore

      const reasons: string[] = []

      const formulaExecution = input.conversation.formulaExecution
      const formulaWasExecuted =
        formulaExecution?.formulaId === input.formula.id &&
        formulaExecution.formulaVersion === input.formula.version

      if (!execution && !formulaWasExecuted) {

        reasons.push(
          'No matching formula or script execution available.'
        )

      } else if (
        !execution &&
        formulaWasExecuted &&
        input.conversation.outcomes.length > 0
      ) {

        decision = input.conversation.outcomes.some(
          (outcome) => outcome.achieved
        )
          ? 'confirm'
          : 'weaken'

        reasons.push(
          decision === 'confirm'
            ? 'Recorded outcomes support the executed formula.'
            : 'Recorded outcomes did not support the executed formula.'
        )

      } else if (
        !execution &&
        formulaWasExecuted
      ) {

        reasons.push(
          'Formula execution was recorded without sufficient outcome evidence.'
        )

      } else if (
        execution &&
        execution.outcomes.length === 0 &&
        execution.deviations.length === 0
      ) {

        decision = 'confirm'

        reasons.push(
          'Execution completed without recorded deviations.'
        )

      } else if (
        execution &&
        execution.outcomes.length >=
        execution.deviations.length
      ) {

        decision = 'confirm'

        reasons.push(
          'Observed outcomes outweighed deviations.'
        )

      } else {

        decision = 'weaken'

        reasons.push(
          'Execution contained more deviations than successful outcomes.'
        )

      }

      return {
        id: crypto.randomUUID(),
        formulaId: input.formula.id,
        formulaVersion: input.formula.version,
        conversationId: input.conversation.id,
        scriptExecutionId: execution?.id,
        decision,
        confidenceBefore,
        confidenceAfter,
        evidence: input.formula.evidence,
        reasons,
        assessedAt: Date.now(),
      }

    },

  }

}
