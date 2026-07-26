import type {
  ConversationRecord,
  OperationalFormula,
  OperationalFormulaLineage,
  OperationalFormulaReassessment,
  OperationalScriptExecution,
} from './types'

export type OperationalFormulaEvolutionInput = {
  formula: OperationalFormula
  conversation: ConversationRecord
  reassessment: OperationalFormulaReassessment
  scriptExecution?: OperationalScriptExecution
}

export type OperationalFormulaEvolutionResult = {
  formula?: OperationalFormula
  lineage?: OperationalFormulaLineage
}

export type OperationalFormulaEvolutionEngine = {
  evolve(
    input: OperationalFormulaEvolutionInput
  ): Promise<OperationalFormulaEvolutionResult>
}
