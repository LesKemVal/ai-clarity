import type { OperationalScriptExecution } from './types'

export type OperationalScriptExecutionRecorder = {
  getById(id: string): Promise<OperationalScriptExecution | null>
  save(execution: OperationalScriptExecution): Promise<void>
  listByConversation(
    conversationId: string
  ): Promise<OperationalScriptExecution[]>
}
