export type OperationalMemoryScope = 'personal' | 'organization' | 'general'

export type OperationalFormulaVisibility = 'public' | 'private' | 'organization'

export type OperationalFormulaStatus =
  | 'candidate'
  | 'validated'
  | 'contested'
  | 'retired'

export type OperationalParticipantRole =
  | 'user'
  | 'counterparty'
  | 'decision_maker'
  | 'advisor'
  | 'observer'
  | 'unknown'

export type OperationalParticipant = {
  id: string
  role: OperationalParticipantRole
  label?: string
  organizationId?: string
}

export type OperationalSignal = {
  id: string
  type: string
  participantId?: string
  at: number
  confidence: number
  evidence?: string
}

export type OperationalIntervention = {
  id: string
  behavior: string
  at: number
  targetParticipantId?: string
  accepted?: boolean
}

export type OperationalOutcome = {
  type: string
  achieved: boolean
  confidence: number
  at?: number
}

export type ConversationRecord = {
  id: string
  userId: string
  organizationId?: string
  roomType?: string
  objective?: string
  startedAt: number
  endedAt?: number
  participants: OperationalParticipant[]
  signals: OperationalSignal[]
  interventions: OperationalIntervention[]
  outcomes: OperationalOutcome[]
}

export type OperationalFormulaStep = {
  signalType: string
  actionType?: string
  expectedTransition?: string
}

export type OperationalFormulaEvidenceResult =
  | 'success'
  | 'failure'
  | 'unknown'

export type OperationalFormulaEvidence = {
  conversationId: string
  outcomeType: string
  result: OperationalFormulaEvidenceResult
  confidence: number
  observedAt: number
}

export type OperationalFormulaVerification = {
  authority: 'BRANESX'
  verified: boolean
  verifiedAt?: number
  verificationVersion?: string
}

export type OperationalFormulaPublication = {
  author?: string
  publisher?: string
  marketplaceReady?: boolean
  provenBy?: string[]
  alternatives?: string[]
}

export type OperationalFormula = {
  id: string
  version: number
  scope: OperationalMemoryScope
  ownerId?: string
  name?: string
  publisher?: string
  visibility?: OperationalFormulaVisibility
  status?: OperationalFormulaStatus
  bestUsedFor?: string[]
  uses?: number
  verifiedByBranesx?: boolean
  verification?: OperationalFormulaVerification
  publication?: OperationalFormulaPublication
  roomTypes: string[]
  objectiveTypes: string[]
  prerequisites: string[]
  steps: OperationalFormulaStep[]
  failureConditions: string[]
  confidence: number
  sampleCount: number
  successCount: number
  contradictionCount: number
  unknownCount: number
  reuseCount: number
  evidence: OperationalFormulaEvidence[]
  createdAt: number
  updatedAt: number
}

export type FormulaRetrievalContext = {
  userId: string
  organizationId?: string
  roomType?: string
  objectiveType?: string
  observedSignalTypes: string[]
  limit?: number
}

export type RetrievedOperationalFormula = {
  formula: OperationalFormula
  score: number
  reasons: string[]
}

export type OperationalScriptStatus =
  | 'draft'
  | 'active'
  | 'archived'
  | 'deleted'

export type OperationalScriptDisposition =
  | 'keep'
  | 'replace'
  | 'save_both'
  | 'delete'

export type OperationalScriptLine = {
  id: string
  order: number
  text: string
  purpose?: string
}

export type OperationalScript = {
  id: string
  version: number
  ownerId: string
  organizationId?: string
  formulaId: string
  formulaVersion: number
  name?: string
  status: OperationalScriptStatus
  lines: OperationalScriptLine[]
  createdAt: number
  updatedAt: number
}

export type OperationalScriptDeviation = {
  id: string
  scriptLineId?: string
  at: number
  originalText?: string
  actualText?: string
  reason?: string
  confidence: number
}

export type OperationalScriptExecution = {
  id: string
  conversationId: string
  userId: string
  organizationId?: string
  scriptId: string
  scriptVersion: number
  formulaId: string
  formulaVersion: number
  startedAt: number
  endedAt?: number
  deviations: OperationalScriptDeviation[]
  outcomes: OperationalOutcome[]
  createdAt: number
}

export type OperationalScriptRevisionChange = {
  scriptLineId?: string
  kind: 'add' | 'replace' | 'remove' | 'reorder'
  before?: string
  after?: string
  reason: string
}

export type OperationalScriptRevisionProposal = {
  id: string
  scriptId: string
  sourceVersion: number
  proposedVersion: number
  conversationId: string
  proposedLines: OperationalScriptLine[]
  changes: OperationalScriptRevisionChange[]
  createdAt: number
}

export type OperationalScriptDecision = {
  id: string
  userId: string
  scriptId: string
  conversationId: string
  disposition: OperationalScriptDisposition
  acceptedRevisionProposalId?: string
  decidedAt: number
}

export type OperationalFormulaReassessmentDecision =
  | 'confirm'
  | 'weaken'
  | 'contest'
  | 'retire'
  | 'evolve'
  | 'insufficient_evidence'

export type OperationalFormulaReassessment = {
  id: string
  formulaId: string
  formulaVersion: number
  conversationId: string
  scriptExecutionId?: string
  decision: OperationalFormulaReassessmentDecision
  confidenceBefore: number
  confidenceAfter: number
  evidence: OperationalFormulaEvidence[]
  reasons: string[]
  assessedAt: number
}

export type OperationalFormulaEvolutionKind =
  | 'derived'
  | 'replacement'
  | 'merge'
  | 'retirement'

export type OperationalFormulaLineage = {
  id: string
  kind: OperationalFormulaEvolutionKind
  parentFormulaIds: string[]
  childFormulaId?: string
  conversationId: string
  reassessmentId: string
  reasons: string[]
  createdAt: number
}

