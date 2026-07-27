import type { OperationalFormulaReassessment } from './types'

export type OperationalFormulaReassessmentRecorder = {
  getById(id: string): Promise<OperationalFormulaReassessment | null>
  save(reassessment: OperationalFormulaReassessment): Promise<void>
  listByConversation(
    conversationId: string
  ): Promise<OperationalFormulaReassessment[]>
  listByFormula(
    formulaId: string
  ): Promise<OperationalFormulaReassessment[]>
}
