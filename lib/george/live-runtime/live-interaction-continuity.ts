import { buildLiveOutcomeObservation, type LiveOutcomeObservation } from './live-outcome-review'
import {
  createConversationPackage,
  updateAfterLive,
  buildConversationRecord,
} from '../conversation-packages/index.mjs'
import type { OutcomeGovernorSnapshot } from '../live-voice/runtime/outcome-governor'

export function buildLiveOutcomeReview(params: {
  desiredOutcome: string
  transcript: string
  supportSummary?: string
  outcomeGovernor?: OutcomeGovernorSnapshot | null
}) {
  return buildLiveOutcomeObservation({
    desiredOutcome: params.desiredOutcome,
    transcript: params.transcript,
    supportSummary: params.supportSummary || '',
    outcomeGovernor: params.outcomeGovernor || null,
  })
}

export function buildLiveInteractionContinuity(params: {
  desiredOutcome: string
  conversationContext: string
  transcript: string
  transcriptEvidenceCount: number
  supportSummary?: string
  outcomeGovernor?: OutcomeGovernorSnapshot | null
  outcomeReview?: LiveOutcomeObservation | null
}) {
  const outcomeReview =
    params.outcomeReview ||
    buildLiveOutcomeReview({
      desiredOutcome: params.desiredOutcome,
      transcript: params.transcript,
      supportSummary: params.supportSummary || '',
      outcomeGovernor: params.outcomeGovernor || null,
    })

  const pkg = createConversationPackage({
    desiredOutcome: outcomeReview.desiredOutcome,
    conversationType: 'LIVE',
    conversationContext: params.conversationContext,
    conversations: params.transcriptEvidenceCount
      ? [{ type: 'live_transcript_evidence', count: params.transcriptEvidenceCount }]
      : [],
  })

  const updatedPackage = updateAfterLive(pkg, {
    summary: params.supportSummary
      ? {
          id: 'last-live-summary',
          type: 'live_summary',
          summary: params.supportSummary,
          suggestedNextAction: outcomeReview.bestAvailablePath || '',
        }
      : undefined,
    outcomeReview,
  })

  return {
    outcomeReview,
    conversationPackage: updatedPackage,
    conversationRecord: buildConversationRecord(updatedPackage),
  }
}
