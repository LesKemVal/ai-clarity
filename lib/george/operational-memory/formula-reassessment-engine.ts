import type {
  ConversationRecord,
  OperationalFormula,
  OperationalFormulaReassessment,
  OperationalScriptExecution,
} from './types'

export type OperationalFormulaReassessmentInput = {
  formula: OperationalFormula
  conversation: ConversationRecord
  scriptExecution?: OperationalScriptExecution
}

export type OperationalFormulaReassessmentEngine = {
  reassess(
    input: OperationalFormulaReassessmentInput
  ): Promise<OperationalFormulaReassessment>
}
