import type { LiveOutcomeObservation } from '@/lib/george/live-runtime/live-outcome-review'

export type LiveConversationRecord = {
  id: string
  kind: 'live_conversation_record'
  createdAt: string
  title: string
  room: string
  chair: string
  observedProgress: LiveOutcomeObservation['observedProgress']
  confidence: number
  currentState: string
  observedChange: string
  availablePaths: string[]
  bestAvailablePath: string
  assistanceOptions: string[]
  operationalMemory: string
  evidenceSummary: string
  transcriptEvidenceAvailable: boolean
}

function normalizeText(value: unknown, fallback: string) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim()
  return clean || fallback
}

function normalizeList(value: unknown, fallback: string[]) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item, '')).filter(Boolean)
    : fallback
}

function buildRecordId(createdAt: string, title: string) {
  const slug = normalizeText(title, 'live-conversation')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'live-conversation'

  return `live-record-${createdAt.replace(/[^0-9]/g, '').slice(0, 14)}-${slug}`
}

export function buildLiveConversationRecord({
  outcomeObservation,
  room,
  chair,
  transcript,
  createdAt = new Date().toISOString(),
}: {
  outcomeObservation: LiveOutcomeObservation
  room?: string | null
  chair?: string | null
  transcript?: string | null
  createdAt?: string
}): LiveConversationRecord {
  const title = normalizeText(outcomeObservation.desiredOutcome, 'LIVE Conversation')
  const evidenceSummary = normalizeText(
    outcomeObservation.notes || outcomeObservation.observedChange,
    'Outcome Review completed. No additional evidence summary was available.'
  )
  const currentState = normalizeText(outcomeObservation.currentState, 'Outcome position is unclear.')
  const bestAvailablePath = normalizeText(
    outcomeObservation.bestAvailablePath,
    'Clarify the next available path.'
  )

  return {
    id: buildRecordId(createdAt, title),
    kind: 'live_conversation_record',
    createdAt,
    title,
    room: normalizeText(room, 'LIVE room'),
    chair: normalizeText(chair, 'User'),
    observedProgress: outcomeObservation.observedProgress,
    confidence: Math.max(0, Math.min(100, Math.round(Number(outcomeObservation.confidence) || 0))),
    currentState,
    observedChange: normalizeText(outcomeObservation.observedChange, evidenceSummary),
    availablePaths: normalizeList(outcomeObservation.availablePaths, ['Clarify what happened.', 'Identify the next available path.']),
    bestAvailablePath,
    assistanceOptions: normalizeList(outcomeObservation.assistanceOptions, ['Summarize what happened.', 'Plan the next move.']),
    operationalMemory: `We can ${bestAvailablePath.charAt(0).toLowerCase()}${bestAvailablePath.slice(1)}`,
    evidenceSummary,
    transcriptEvidenceAvailable: normalizeText(transcript, '').length > 0,
  }
}
