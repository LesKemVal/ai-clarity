'use client'

import { useMemo, useState, type ChangeEvent } from 'react'

type PrepDocument = {
  name: string
  summary: string
  kind: string
}

type LifecycleOption =
  | 'retain'
  | 'delete_after_conversation'
  | 'delete_after_24_hours'
  | 'delete_after_7_days'
  | 'delete_now'

type RecommendedDocument = {
  title: string
  reason?: string
}

type Props = {
  recommendations?: RecommendedDocument[]
  document: PrepDocument | null
  reading: boolean
  onUpload: (file: File | null) => void
  onRemove: () => void
}

const PROCESSING_STEPS = [
  'Preparing document',
  'Extracting text',
  'Identifying relevant information',
  'Attaching to Conversation Package',
]

const LIFECYCLE_OPTIONS: Array<{ id: LifecycleOption; label: string }> = [
  { id: 'retain', label: 'Retain' },
  { id: 'delete_after_conversation', label: 'Delete after conversation' },
  { id: 'delete_after_24_hours', label: 'Delete after 24 hours' },
  { id: 'delete_after_7_days', label: 'Delete after 7 days' },
  { id: 'delete_now', label: 'Delete now' },
]

export function RelevantDocumentationPanel({
  recommendations = [],
  document,
  reading,
  onUpload,
  onRemove,
}: Props) {
  const [lifecycle, setLifecycle] = useState<LifecycleOption>('retain')
  const [deleteIntent, setDeleteIntent] = useState<'keep_learning' | 'forget_document_learning'>('keep_learning')
  const [showDeleteDecision, setShowDeleteDecision] = useState(false)

  const progress = reading ? 62 : document ? 100 : 0
  const activeStep = reading ? PROCESSING_STEPS[1] : document ? 'Ready for this conversation' : 'Waiting for document'

  const attachedDocuments = useMemo(() => {
    if (!document) return []
    return [{ title: document.name, kind: document.kind, summary: document.summary }]
  }, [document])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    onUpload(file)
    event.currentTarget.value = ''
  }

  const handleLifecycleChange = (option: LifecycleOption) => {
    setLifecycle(option)

    if (option === 'delete_now') {
      setShowDeleteDecision(true)
    }
  }

  return (
    <div className="rounded-[0.95rem] border border-[#8FB6C9]/[0.12] bg-[#071018]/62 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/68">
            Relevant Documentation
          </div>
          <p className="mt-2 max-w-[34rem] text-[12px] leading-5 text-[#D7DBE4]/58">
            These documents may improve my understanding of this conversation.
          </p>
        </div>

        {document && !reading && (
          <div className="shrink-0 rounded-full border border-emerald-300/[0.16] bg-emerald-300/[0.08] px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-emerald-100/72">
            Ready
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-white/[0.055] pt-3">
        <div className="text-[9px] uppercase tracking-[0.22em] text-white/30">
          Recommended by GEORGE
        </div>

        {recommendations.length ? (
          <div className="mt-2 space-y-2">
            {recommendations.map((item) => (
              <div
                key={item.title}
                className="rounded-[0.72rem] border border-white/[0.055] bg-white/[0.018] px-3 py-2"
              >
                <div className="text-[12px] text-white/70">{item.title}</div>
                {item.reason && (
                  <div className="mt-1 text-[11px] leading-4 text-white/34">{item.reason}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] leading-5 text-white/36">
            No recommendations yet. GEORGE will suggest useful documents when prior Conversation Packages or related assets become available.
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-white/[0.055] pt-3">
        <div className="text-[9px] uppercase tracking-[0.22em] text-white/30">
          Available for this Conversation
        </div>

        {attachedDocuments.length ? (
          <div className="mt-2 space-y-2">
            {attachedDocuments.map((item) => (
              <div
                key={item.title}
                className="rounded-[0.78rem] border border-white/[0.065] bg-black/24 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] text-white/72">{item.title}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/28">
                      {item.kind || 'document'} · {reading ? 'processing' : 'ready'}
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-100/62">
                    {reading ? 'Working' : '✓ Ready'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-5">
                  {LIFECYCLE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleLifecycleChange(option.id)}
                      className={`rounded-[0.6rem] border px-2 py-1.5 text-[9px] uppercase tracking-[0.11em] transition ${
                        lifecycle === option.id
                          ? 'border-[#8FB6C9]/32 bg-[#8FB6C9]/[0.08] text-[#D7DCFF]/76'
                          : 'border-white/[0.055] bg-white/[0.015] text-white/34 hover:border-white/[0.12] hover:text-white/62'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {showDeleteDecision && (
                  <div className="mt-3 rounded-[0.7rem] border border-red-200/[0.10] bg-red-200/[0.035] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-red-100/58">
                      Delete document?
                    </div>
                    <div className="mt-2 grid gap-1.5">
                      {[
                        ['keep_learning', 'Keep what I learned'],
                        ['forget_document_learning', 'Forget everything from this document'],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDeleteIntent(id as typeof deleteIntent)}
                          className={`rounded-[0.58rem] px-2 py-1.5 text-left text-[11px] transition ${
                            deleteIntent === id
                              ? 'bg-white/[0.06] text-white/74'
                              : 'text-white/36 hover:bg-white/[0.035] hover:text-white/62'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteDecision(false)
                          setLifecycle('retain')
                        }}
                        className="rounded-[0.56rem] border border-white/[0.06] px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/38 hover:text-white/68"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteDecision(false)
                          onRemove()
                        }}
                        className="rounded-[0.56rem] border border-red-200/[0.14] bg-red-200/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-red-100/58 hover:text-red-100/82"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] leading-5 text-white/34">
            No document attached yet.
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-white/[0.055] pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-[0.72rem] border border-[#8FB6C9]/22 bg-[#8FB6C9]/[0.055] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D7DCFF]/78 transition hover:bg-[#8FB6C9]/[0.085]">
            Upload documentation
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {document && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-[0.72rem] border border-white/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 transition hover:border-white/[0.16] hover:text-white/72"
            >
              Remove
            </button>
          )}

          <span className="text-[10px] uppercase tracking-[0.14em] text-white/25">
            PDF · DOCX · TXT · Images
          </span>
        </div>

        {(reading || document) && (
          <div className="mt-3 rounded-[0.72rem] border border-white/[0.055] bg-black/24 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-white/48">
                {activeStep}
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                {progress}%
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#8FB6C9]/60 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {reading && (
              <div className="mt-2 grid gap-1 text-[10px] leading-4 text-white/28">
                {PROCESSING_STEPS.map((step) => (
                  <span key={step}>{step}…</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
