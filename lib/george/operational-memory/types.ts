export type OperationalMemoryScope = 'personal' | 'organization' | 'general'

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

export type OperationalFormulaEvidence = {
  conversationId: string
  outcomeType: string
  successful: boolean
  observedAt: number
}

export type OperationalFormula = {
  id: string
  version: number
  scope: OperationalMemoryScope
  ownerId?: string
  roomTypes: string[]
  objectiveTypes: string[]
  prerequisites: string[]
  steps: OperationalFormulaStep[]
  failureConditions: string[]
  confidence: number
  sampleCount: number
  successCount: number
  contradictionCount: number
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
