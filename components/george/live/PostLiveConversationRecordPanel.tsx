'use client'

type ConversationRecordProjection = {
  desiredOutcome?: string
  conversationType?: string
  conversationContext?: string
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
}: PostLiveConversationRecordPanelProps) {
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

  return (
    <section className="pointer-events-auto w-full max-w-[720px] rounded-[1.25rem] border border-white/[0.07] bg-[#05070B]/88 p-4 text-[#DCEBFF]/72 shadow-[0_24px_90px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8FF0C7]/72">
            Conversation Record
          </p>
          <h2 className="mt-1 text-[15px] font-medium text-[#F4F7FB]/86">
            Post-LIVE operational memory
          </h2>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#D7DBE4]/48 transition hover:border-white/[0.16] hover:text-[#D7DBE4]/72"
          >
            Close
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[0.95rem] border border-white/[0.055] bg-white/[0.025] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Desired outcome</p>
          <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/72">{label(record.desiredOutcome)}</p>
        </div>

        <div className="rounded-[0.95rem] border border-white/[0.055] bg-white/[0.025] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Context</p>
          <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/72">
            {label(record.conversationType, 'Conversation')} · {label(record.conversationContext, 'Context pending')}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-[0.95rem] border border-white/[0.055] bg-white/[0.025] p-3">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Summary</p>
        <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/72">{label(record.summary)}</p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-[0.95rem] border border-[#8FF0C7]/[0.12] bg-[#8FF0C7]/[0.045] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#8FF0C7]/54">Outcome Review</p>
          <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/76">
            {label(record.latestOutcome?.currentState || record.latestOutcome?.observedProgress)}
          </p>
          <p className="mt-2 text-[11px] leading-5 text-[#DCEBFF]/52">
            {label(record.latestOutcome?.bestAvailablePath, 'Next path pending')}
          </p>
        </div>

        <div className="rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.045] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/42">Learning</p>
          <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/72">
            {label(record.latestLearning?.learning, 'No promoted learning yet')}
          </p>
        </div>
      </div>

      {(record.operationalDebrief?.summary || debriefObservations.length > 0) && (
        <div className="mt-3 rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.04] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/48">DeBriefing</p>
          <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/76">
            {label(record.operationalDebrief?.summary, 'GEORGE preserved the interaction evidence for future preparation.')}
          </p>
          {debriefObservations.length > 0 && (
            <ul className="mt-2 space-y-1 text-[11px] leading-5 text-[#DCEBFF]/56">
              {debriefObservations.map((item) => (
                <li key={`${item.label}-${item.detail}`}>
                  <span className="text-[#BFD9FF]/72">{label(item.label, 'Observation')}:</span> {label(item.detail, '')}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {transcriptHighlights.length > 0 && (
        <div className="mt-3 rounded-[0.95rem] border border-white/[0.055] bg-white/[0.025] p-3">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Transcript highlights</p>
          <div className="mt-2 space-y-2">
            {transcriptHighlights.map((item) => {
              const isConcern = item.kind === 'concern'
              return (
                <div
                  key={`${item.kind}-${item.label}-${item.excerpt}`}
                  className={isConcern
                    ? "rounded-[0.8rem] border border-[#FFB4B4]/[0.18] bg-[#FFB4B4]/[0.055] p-2"
                    : "rounded-[0.8rem] border border-[#8FB6FF]/[0.2] bg-[#8FB6FF]/[0.06] p-2"}
                >
                  <p className={isConcern
                    ? "text-[9px] uppercase tracking-[0.16em] text-[#FFB4B4]/70"
                    : "text-[9px] uppercase tracking-[0.16em] text-[#8FB6FF]/72"}
                  >
                    {isConcern ? 'Concern' : 'Signal'} · {label(item.label, 'Operational moment')}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#F4F7FB]/76">“{label(item.excerpt, 'Transcript evidence pending')}”</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#DCEBFF]/52">{label(item.reason, '')}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#DCEBFF]/46">{label(item.recommendedUse, '')}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-3 rounded-[0.95rem] border border-white/[0.055] bg-white/[0.025] p-3">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#BFD9FF]/36">Future actions</p>
        {futureActions.length > 0 ? (
          <ul className="mt-2 space-y-1 text-[12px] leading-5 text-[#DCEBFF]/72">
            {futureActions.map((action) => (
              <li key={action}>We can {action.charAt(0).toLowerCase()}{action.slice(1)}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[12px] leading-5 text-[#DCEBFF]/46">No future action has been promoted yet.</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-[#D7DBE4]/38">
        <span className="rounded-full border border-white/[0.055] px-3 py-1">
          Documents: {documentationCount}
        </span>
        <span className="rounded-full border border-white/[0.055] px-3 py-1">
          Transcript evidence: {record.transcriptEvidenceAvailable ? 'Available' : 'Not attached'}
        </span>
      </div>
    </section>
  )
}
