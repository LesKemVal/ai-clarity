import type {
  OperationalScriptDecision,
  OperationalScriptRevisionProposal,
} from './types'

export type OperationalScriptDecisionInput = {
  userId: string
  scriptId: string
  conversationId: string
  disposition: OperationalScriptDecision['disposition']
  revisionProposal?: OperationalScriptRevisionProposal
  decidedAt?: number
}

export type OperationalScriptDecisionService = {
  apply(
    input: OperationalScriptDecisionInput
  ): Promise<OperationalScriptDecision>
}
