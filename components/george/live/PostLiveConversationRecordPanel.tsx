'use client'

import { useState } from 'react'

type ConversationRecordProjection = {
  desiredOutcome?: string
  conversationType?: string
  conversationContext?: string
  formulaSelection?: {
    formulaId?: string
    formulaVersion?: number
    source?: "george" | "user"
  } | null
  summary?: string
  latestOutcome?: {
    observedProgress?: string
    currentState?: string
    observedChange?: string
    bestAvailablePath?: string
  } | null
  latestLearning?: {
    learning?: string
    evidence?: string
  } | null
  futureActions?: string[]
  operationalDebrief?: {
    summary?: string
    observations?: Array<{
      label?: string
      detail?: string
      importance?: number
    }>
  }
  transcriptHighlights?: Array<{
    kind?: 'signal' | 'concern'
    label?: string
    excerpt?: string
    reason?: string
    recommendedUse?: string
  }>
  relevantDocumentation?: unknown[]
  transcriptEvidenceAvailable?: boolean
}

type PostLiveConversationRecordPanelProps = {
  record: ConversationRecordProjection
  onClose?: () => void
  onNextCall?: () => void
}

function label(value: unknown, fallback = 'Not available') {
  const clean = String(value || '').replace(/\s+/g, ' ').trim()
  return clean || fallback
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map((item) => label(item, '')).filter(Boolean) : []
}

export function PostLiveConversationRecordPanel({
  record,
  onClose,
  onNextCall,
}: PostLiveConversationRecordPanelProps) {
  const [showWhy, setShowWhy] = useState(false)
  const [showExecutionReview, setShowExecutionReview] = useState(false)
  const [showTranscriptEvidence, setShowTranscriptEvidence] = useState(false)

  const futureActions = list(record.futureActions)
  const debriefObservations = Array.isArray(record.operationalDebrief?.observations)
    ? record.operationalDebrief.observations
    : []
  const transcriptHighlights = Array.isArray(record.transcriptHighlights)
    ? record.transcriptHighlights
    : []
  const documentationCount = Array.isArray(record.relevantDocumentation)
    ? record.relevantDocumentation.length
    : 0

  const formulaId = label(record.formulaSelection?.formulaId, "")
  const formulaVersion =
    typeof record.formulaSelection?.formulaVersion === "number"
      ? record.formulaSelection.formulaVersion
      : null
  const formulaSource = record.formulaSelection?.source
  const formulaExecutionAvailable = Boolean(
    formulaId && formulaVersion !== null && formulaSource,
  )

  const reviewText = [
    record.summary,
    record.latestOutcome?.observedProgress,
    record.latestOutcome?.currentState,
    record.latestOutcome?.observedChange,
    record.latestOutcome?.bestAvailablePath,
    record.operationalDebrief?.summary,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const result = /\b(win|won|success|successful|achieved|secured|booked|closed|converted)\b/.test(reviewText)
    ? { mark: 'W', label: 'Win', tone: 'border-[#8FD6B2]/20 bg-[#8FD6B2]/[0.055] text-[#AEE8C8]' }
    : /\b(loss|lost|unsuccessful|failed|declined|rejected|no sale|not achieved)\b/.test(reviewText)
      ? { mark: 'L', label: 'Loss', tone: 'border-[#FFB4B4]/20 bg-[#FFB4B4]/[0.055] text-[#FFCBCB]' }
      : /\b(follow[- ]?up|callback|call back|next meeting|pending)\b/.test(reviewText)
        ? { mark: '↺', label: 'Follow-up', tone: 'border-[#BFD9FF]/20 bg-[#BFD9FF]/[0.05] text-[#D4E5FF]' }
        : { mark: '—', label: 'No decision', tone: 'border-white/10 bg-white/[0.025] text-[color:var(--steel-200)]/74' }

  const adjustmentText = [
    record.latestOutcome?.bestAvailablePath,
    ...futureActions,
    ...debriefObservations.map((item) => item.detail),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const strategyAdjustmentSuggested = /\b(change|adjust|different|alternate|new opening|revise|switch|replace|modify|weaken)\b/.test(adjustmentText)
  const strategyStatus = strategyAdjustmentSuggested
    ? 'GEORGE suggests an adjustment before the next conversation.'
    : 'Current Formula and Script remain appropriate for the next conversation.'

  const whyText = label(
    record.latestOutcome?.bestAvailablePath ||
      record.operationalDebrief?.summary ||
      record.summary,
    strategyAdjustmentSuggested
      ? 'The available evidence suggests a different execution approach may improve the next conversation.'
      : 'The available evidence does not justify changing the current operational strategy yet.',
  )

  return (
    <section className="pointer-events-auto max-h-[calc(100vh-32px)] w-full max-w-[620px] overflow-y-auto rounded-[1.25rem] border border-[var(--border-subtle)] bg-[color:var(--surface-2)]/94 p-4 text-[color:var(--steel-200)]/72 shadow-[0_24px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8FB6C9]/72">
            Conversation Complete
          </p>
          <h2 className="mt-1 text-[15px] font-medium text-[color:var(--steel-100)]/88">
            Decide what changes before the next conversation.
          </h2>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border-default)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--steel-300)]/48 transition hover:border-white/[0.16] hover:text-[color:var(--steel-300)]/72"
          >
            Close
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[88px_1fr] gap-3">
        <div className={`flex min-h-[88px] flex-col items-center justify-center rounded-[0.95rem] border ${result.tone}`}>
          <span className="text-[32px] font-semibold leading-none">{result.mark}</span>
          <span className="mt-2 text-[9px] uppercase tracking-[0.18em]">{result.label}</span>
        </div>

        <div className="rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/72 p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/42">Strategy status</p>
          <p className="mt-2 text-[13px] leading-5 text-[color:var(--steel-100)]/82">{strategyStatus}</p>
          <button
            type="button"
            onClick={() => setShowWhy((current) => !current)}
            className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#BFD9FF]/62 transition hover:text-[#DCE9FF]"
          >
            {showWhy ? 'Hide why' : 'Why?'}
          </button>
        </div>
      </div>

      {showWhy && (
        <div className="mt-3 rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.04] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">Why</p>
          <p className="mt-2 text-[12px] leading-5 text-[color:var(--steel-200)]/76">{whyText}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {strategyAdjustmentSuggested ? (
          <>
            <button
              type="button"
              className="rounded-[0.75rem] border border-white/12 px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-white/66 transition hover:border-white/24 hover:text-white"
            >
              Keep Current
            </button>
            <button
              type="button"
              className="rounded-[0.75rem] border border-[#8FB6C9]/25 bg-[#8FB6C9]/[0.07] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#D9ECF6]/82 transition hover:border-[#8FB6C9]/45 hover:bg-[#8FB6C9]/[0.11]"
            >
              Adopt Adjustment
            </button>
          </>
        ) : null}

        {onNextCall && (
          <button
            type="button"
            onClick={onNextCall}
            className="ml-auto rounded-[0.75rem] border border-[#BFD9FF]/28 bg-[#BFD9FF]/[0.08] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/90 transition hover:border-[#DCE9FF]/48 hover:bg-[#BFD9FF]/[0.13]"
          >
            Next Call
          </button>
        )}
      </div>

      <div className="mt-4 border-t border-white/[0.07] pt-3">
        <button
          type="button"
          onClick={() => setShowExecutionReview((current) => !current)}
          className="text-[10px] uppercase tracking-[0.17em] text-white/44 transition hover:text-white/72"
        >
          {showExecutionReview ? 'Hide execution review' : 'Execution review'}
        </button>

        {showExecutionReview && (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/70 p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Goal</p>
                <p className="mt-1 text-[12px] leading-5 text-[color:var(--steel-200)]/72">{label(record.desiredOutcome)}</p>
              </div>
              <div className="rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/70 p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Conversation</p>
                <p className="mt-1 text-[12px] leading-5 text-[color:var(--steel-200)]/72">
                  {label(record.conversationType, 'Conversation')} · {label(record.conversationContext, 'Context pending')}
                </p>
              </div>
            </div>

            {formulaExecutionAvailable && (
              <div className="rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.035] p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/40">
                  Executed Formula
                </p>
                <div className="mt-2 inline-flex max-w-full items-center rounded-[10px] border border-white/[0.11] bg-white/[0.025] px-3 py-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.11em] text-white/72">
                    {formulaId} · v{formulaVersion} · {formulaSource}
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/70 p-3">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">GEORGE analysis</p>
              <p className="mt-1 text-[12px] leading-5 text-[color:var(--steel-200)]/72">{label(record.summary)}</p>
            </div>

            {debriefObservations.length > 0 && (
              <div className="rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.04] p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">Operational observations</p>
                <ul className="mt-2 space-y-1 text-[11px] leading-5 text-[color:var(--steel-200)]/56">
                  {debriefObservations.map((item) => (
                    <li key={`${item.label}-${item.detail}`}>
                      <span className="text-[#BFD9FF]/72">{label(item.label, 'Observation')}:</span> {label(item.detail, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {futureActions.length > 0 && (
              <div className="rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/70 p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Possible next moves</p>
                <ul className="mt-2 space-y-1 text-[12px] leading-5 text-[color:var(--steel-200)]/72">
                  {futureActions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-white/[0.07] pt-3">
        <button
          type="button"
          onClick={() => setShowTranscriptEvidence((current) => !current)}
          className="text-[10px] uppercase tracking-[0.17em] text-white/38 transition hover:text-white/68"
        >
          {showTranscriptEvidence ? 'Hide transcript evidence' : 'Transcript evidence'}
        </button>

        {showTranscriptEvidence && (
          <div className="mt-3 rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/70 p-3">
            {transcriptHighlights.length > 0 ? (
              <div className="space-y-2">
                {transcriptHighlights.map((item) => (
                  <div key={`${item.kind}-${item.label}-${item.excerpt}`} className="rounded-[0.8rem] border border-white/[0.07] bg-black/10 p-2">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#BFD9FF]/58">{label(item.label, 'Operational moment')}</p>
                    <p className="mt-1 text-[12px] leading-5 text-[color:var(--steel-100)]/76">“{label(item.excerpt, 'Transcript evidence pending')}”</p>
                    <p className="mt-1 text-[11px] leading-5 text-[color:var(--steel-200)]/48">{label(item.reason, '')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] leading-5 text-[color:var(--steel-200)]/48">
                {record.transcriptEvidenceAvailable ? 'Transcript evidence is available on request.' : 'Transcript evidence was not attached to this record.'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.15em] text-[color:var(--steel-300)]/30">
        <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1">Documents: {documentationCount}</span>
        <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1">
          Evidence: {record.transcriptEvidenceAvailable ? 'Preserved' : 'Summary only'}
        </span>
      </div>
    </section>
  )
}
