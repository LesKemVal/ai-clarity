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
    <div className="rounded-[0.85rem] border border-white/[0.07] bg-white/[0.018] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#D7DCFF]/54">
            Relevant Documentation
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#D7DBE4]/44">
            Add materials that may improve timing, judgment, and execution.
          </p>
        </div>

        {document && !reading && (
          <div className="shrink-0 rounded-full border border-[#8FB6C9]/[0.14] bg-[#8FB6C9]/[0.06] px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] text-[#D7DCFF]/68">
            Ready
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.045] pt-3">
        <label className="cursor-pointer rounded-full border border-[#8FB6C9]/24 bg-[#8FB6C9]/[0.045] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#D7DCFF]/76 transition hover:border-[#8FB6C9]/40 hover:bg-[#8FB6C9]/[0.075]">
          Upload Documentation
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
          />
        </label>

        <span className="text-[9px] uppercase tracking-[0.16em] text-white/24">
          PDF · DOCX · TXT · Images
        </span>
      </div>

      {reading && (
        <div className="mt-3 rounded-[0.72rem] border border-white/[0.055] bg-black/22 px-3 py-2">
          <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-white/34">
            <span>{activeStep}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
            <div
              className="h-full rounded-full bg-[#8FB6C9]/70 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {attachedDocuments.length > 0 && (
        <div className="mt-3 rounded-[0.72rem] border border-white/[0.055] bg-black/20 px-3 py-2">
          {attachedDocuments.map((item) => (
            <div key={item.title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] text-white/68">{item.title}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/26">
                    {item.kind || 'document'} · {reading ? 'processing' : 'ready'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-full border border-white/[0.06] px-2 py-1 text-[8px] uppercase tracking-[0.13em] text-white/32 transition hover:border-red-200/[0.14] hover:text-red-100/70"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {LIFECYCLE_OPTIONS.filter((option) => option.id !== 'delete_now').map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleLifecycleChange(option.id)}
                    className={`rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.1em] transition ${
                      lifecycle === option.id
                        ? 'border-[#8FB6C9]/32 bg-[#8FB6C9]/[0.08] text-[#D7DCFF]/76'
                        : 'border-white/[0.055] bg-white/[0.015] text-white/30 hover:border-white/[0.12] hover:text-white/58'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-3 border-t border-white/[0.045] pt-3">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/28">
            Suggested materials
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {recommendations.map((item) => (
              <span
                key={item.title}
                title={item.reason || ''}
                className="rounded-full border border-white/[0.055] bg-white/[0.018] px-2.5 py-1.5 text-[10px] text-white/48"
              >
                {item.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
