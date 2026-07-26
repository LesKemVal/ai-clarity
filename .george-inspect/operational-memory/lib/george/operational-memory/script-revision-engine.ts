import type {
  ConversationRecord,
  OperationalScript,
  OperationalScriptExecution,
  OperationalScriptRevisionProposal,
} from './types'

export type OperationalScriptRevisionInput = {
  script: OperationalScript
  conversation: ConversationRecord
  execution: OperationalScriptExecution
}

export type OperationalScriptRevisionEngine = {
  propose(
    input: OperationalScriptRevisionInput
  ): Promise<OperationalScriptRevisionProposal | null>
}
