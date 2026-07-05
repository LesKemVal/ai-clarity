import { buildLiveOutcomeObservation, type LiveOutcomeObservation } from './live-outcome-review'
import {
  createConversationPackage,
  updateAfterLive,
  buildConversationRecord,
} from '@/lib/george/conversation-packages/index.mjs'
import type { OutcomeGovernorSnapshot } from '@/lib/george/live-voice/runtime/outcome-governor'

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
    buildLiveOutcomeObservation({
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
