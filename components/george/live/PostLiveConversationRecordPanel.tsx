'use client'

import { useState } from 'react'

type ConversationRecordProjection = {
  id?: string
  desiredOutcome?: string
  conversationType?: string
  conversationContext?: string
  formulaSelection?: {
    formulaId?: string
    formulaVersion?: number
    source?: "george" | "user"
  } | null
  scriptSelection?: {
    scriptId?: string
    scriptVersion?: number
    formulaId?: string
    formulaVersion?: number
    lineCount?: number
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
  onAskGeorge?: () => void
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
  onAskGeorge,
  onNextCall,
}: PostLiveConversationRecordPanelProps) {
  const [showWhy, setShowWhy] = useState(false)
  const [showReviewConversation, setShowReviewConversation] = useState(false)
  const [showExecutionReview, setShowExecutionReview] = useState(false)
  const [showTranscriptEvidence, setShowTranscriptEvidence] = useState(false)
  const [retentionState, setRetentionState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle")
  const [retentionMessage, setRetentionMessage] = useState("")

  const futureActions = list(record.futureActions)
  const debriefObservations = Array.isArray(record.operationalDebrief?.observations)
    ? record.operationalDebrief.observations
    : []
  const transcriptHighlights = Array.isArray(record.transcriptHighlights)
    ? record.transcriptHighlights
    : []
  const signalCount = transcriptHighlights.length + debriefObservations.length
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

  const scriptId = label(record.scriptSelection?.scriptId, "")
  const scriptVersion =
    typeof record.scriptSelection?.scriptVersion === "number"
      ? record.scriptSelection.scriptVersion
      : null
  const scriptFormulaId = label(record.scriptSelection?.formulaId, "")
  const scriptFormulaVersion =
    typeof record.scriptSelection?.formulaVersion === "number"
      ? record.scriptSelection.formulaVersion
      : null
  const scriptLineCount =
    typeof record.scriptSelection?.lineCount === "number"
      ? record.scriptSelection.lineCount
      : null
  const scriptExecutionAvailable = Boolean(
    scriptId &&
      scriptVersion !== null &&
      scriptFormulaId &&
      scriptFormulaVersion !== null,
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
    ? 'Signals surfaced a possible adjustment. Accumulated signals must produce sufficient evidence before recommending a change to the brief.'
    : 'The signals from this conversation have been retained. As signals accumulate, they strengthen the evidence supporting future recommendations.'

  async function retainExecutedAssets(
    disposition: "formula" | "script" | "both" | "neither",
  ) {
    const conversationId = label(record.id, "")

    if (!conversationId) {
      setRetentionState("error")
      setRetentionMessage("Conversation identity is unavailable.")
      return
    }

    setRetentionState("saving")
    setRetentionMessage("")

    try {
      const response = await fetch(
        "/api/george/operational-memory/retention",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            disposition,
            formulaSelection: record.formulaSelection || null,
            scriptSelection: record.scriptSelection || null,
          }),
        },
      )

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "Unable to retain the selected assets.",
        )
      }

      setRetentionState("saved")
      setRetentionMessage(
        disposition === "neither"
          ? "Nothing retained."
          : disposition === "both"
            ? "Formula and Script retained."
            : disposition === "formula"
              ? "Formula retained."
              : "Script retained.",
      )
    } catch (error) {
      setRetentionState("error")
      setRetentionMessage(
        error instanceof Error
          ? error.message
          : "Unable to retain the selected assets.",
      )
    }
  }

  const whyText = label(
    record.latestOutcome?.bestAvailablePath ||
      record.operationalDebrief?.summary ||
      record.summary,
    strategyAdjustmentSuggested
      ? 'We detected a possible execution or strategy signal. Accumulated signals must produce sufficient evidence before recommending a brief improvement.'
      : 'The signals from this conversation have been retained. As signals accumulate, they strengthen the evidence supporting future recommendations.',
  )

  return (
    <section className="pointer-events-auto max-h-[calc(100vh-32px)] w-full max-w-[620px] overflow-y-auto rounded-[1.25rem] border border-[var(--border-subtle)] bg-[color:var(--surface-2)]/94 p-4 text-[color:var(--steel-200)]/72 shadow-[0_24px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8FB6C9]/72">
            Conversation Complete
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/38">
            Active briefing · {label(record.desiredOutcome, 'Current objective')}
          </p>
          {onAskGeorge && (
            <button
              type="button"
              onClick={onAskGeorge}
              className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#BFD9FF]/68 transition hover:text-[#DCE9FF]"
            >
              Ask GEORGE
            </button>
          )}
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
          <p className="mt-2 text-[11px] leading-5 text-white/38">
            Signals create evidence over time; one conversation is not a verdict.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {onNextCall && (
          <button
            type="button"
            onClick={onNextCall}
            className="rounded-[0.75rem] border border-[#BFD9FF]/28 bg-[#BFD9FF]/[0.08] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.17em] text-white/90 transition hover:border-[#DCE9FF]/48 hover:bg-[#BFD9FF]/[0.13]"
          >
            Next Call
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-white/46">
              Continue with the current preparation.
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowReviewConversation((current) => !current)}
          className="rounded-[0.75rem] border border-white/[0.12] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.17em] text-white/72 transition hover:border-white/[0.24] hover:text-white"
        >
          {showReviewConversation ? 'Hide review' : 'Review conversation'}
          <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-white/42">
            Summary, evidence, and executed assets.
          </span>
        </button>

         {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-[0.75rem] border border-white/[0.12] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.17em] text-white/58 transition hover:border-white/[0.24] hover:text-white"
          >
            Finish
            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-white/38">
              Return to GEORGE.
            </span>
          </button>
        )}
      </div>

       {showReviewConversation && (
        <div className="george-motion-fade-soft mt-4 border-t border-white/[0.07] pt-4">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">
            Review conversation
          </p>

          {showWhy && (
            <div className="mt-3 rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.04] p-3">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">Why</p>
              <p className="mt-2 text-[12px] leading-5 text-[color:var(--steel-200)]/76">{whyText}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowWhy((current) => !current)}
            className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#BFD9FF]/62 transition hover:text-[#DCE9FF]"
          >
            {showWhy ? 'Hide why' : 'Why?'}
          </button>

      {(formulaExecutionAvailable || scriptExecutionAvailable) && (
        <div className="mt-5 rounded-[1rem] border border-[#8FB6C9]/[0.14] bg-[#8FB6C9]/[0.035] p-4">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">
            Retain Learning
          </p>
          <p className="mt-2 text-[12px] leading-5 text-white/54">
            Choose what should remain available after this conversation.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {formulaExecutionAvailable && (
              <button
                type="button"
                disabled={retentionState === "saving"}
                onClick={() => retainExecutedAssets("formula")}
                className="rounded-[0.75rem] border border-white/[0.11] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Formula
              </button>
            )}

            {scriptExecutionAvailable && (
              <button
                type="button"
                disabled={retentionState === "saving"}
                onClick={() => retainExecutedAssets("script")}
                className="rounded-[0.75rem] border border-white/[0.11] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Script
              </button>
            )}

            {formulaExecutionAvailable && scriptExecutionAvailable && (
              <button
                type="button"
                disabled={retentionState === "saving"}
                onClick={() => retainExecutedAssets("both")}
                className="rounded-[0.75rem] border border-[#BFD9FF]/30 bg-[#BFD9FF]/[0.07] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/88 transition hover:border-[#DCE9FF]/48 hover:bg-[#BFD9FF]/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Both
              </button>
            )}

            <button
              type="button"
              disabled={retentionState === "saving"}
              onClick={() => retainExecutedAssets("neither")}
              className="rounded-[0.75rem] border border-white/[0.08] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/42 transition hover:border-white/20 hover:text-white/68 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Neither
            </button>
          </div>

          {retentionState !== "idle" && (
            <p
              className={`mt-3 text-[11px] leading-5 ${
                retentionState === "error"
                  ? "text-[#FFC8C8]"
                  : retentionState === "saved"
                    ? "text-[#AEE8C8]"
                    : "text-white/42"
              }`}
            >
              {retentionState === "saving"
                ? "Saving retention decision…"
                : retentionMessage}
            </p>
          )}
        </div>
      )}

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

            {scriptExecutionAvailable && (
              <div className="rounded-[0.95rem] border border-[#AEB6FF]/[0.12] bg-[#AEB6FF]/[0.035] p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#D9DDFF]/42">
                  Executed Script
                </p>
                <div className="mt-2 inline-flex max-w-full items-center rounded-[10px] border border-white/[0.11] bg-white/[0.025] px-3 py-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.11em] text-white/72">
                    {scriptId} · v{scriptVersion} · {scriptLineCount ?? 0} lines
                  </span>
                </div>
                <p className="mt-2 text-[10px] leading-5 text-white/36">
                  Formula {scriptFormulaId} · v{scriptFormulaVersion}
                </p>
              </div>
            )}

            <div className="rounded-[0.95rem] border border-[var(--border-subtle)] bg-[color:var(--surface-3)]/70 p-3">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Signals detected</p>
              <p className="mt-1 text-[12px] leading-5 text-[color:var(--steel-200)]/72">{label(record.summary)}</p>
              <p className="mt-2 text-[11px] leading-5 text-white/38">
                {signalCount > 1
                  ? `We detected ${signalCount} meaningful signals. As signals accumulate across future conversations, they strengthen the evidence supporting this briefing.`
                  : signalCount === 1
                    ? 'We detected one meaningful signal. As signals accumulate across future conversations, they strengthen the evidence supporting this briefing.'
                    : 'No distinct signal was attached to this record. The conversation remains available for future context.'}
              </p>
            </div>

            {debriefObservations.length > 0 && (
              <div className="rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.04] p-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">Signal details</p>
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
        </div>
      )}
    </section>
  )
}
