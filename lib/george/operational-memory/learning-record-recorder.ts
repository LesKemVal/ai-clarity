import type {
  OperationalFormulaLineage,
  OperationalFormulaReassessment,
} from './types'

export type OperationalLearningRecordRecorder = {
  saveReassessment(
    reassessment: OperationalFormulaReassessment
  ): Promise<void>
  saveLineage(lineage: OperationalFormulaLineage): Promise<void>
  listReassessmentsByConversation(
    conversationId: string
  ): Promise<OperationalFormulaReassessment[]>
  listReassessmentsByFormula(
    formulaId: string
  ): Promise<OperationalFormulaReassessment[]>
  listLineagesByConversation(
    conversationId: string
  ): Promise<OperationalFormulaLineage[]>
  listLineagesByFormula(
    formulaId: string
  ): Promise<OperationalFormulaLineage[]>
}
