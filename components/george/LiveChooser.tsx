'use client'

import { useEffect, useState } from 'react'
import { fetchGeorgeSessionAuthority } from '@/lib/george/session-authority'

type LiveChooserProps = {
  open: boolean
  hasAccess?: boolean
  hasLiveSession?: boolean
  onClose: () => void
  onStartLiveConversation: () => void
  onResumeLiveConversation: () => void
  onClearLiveSessions?: () => void
  onUpgrade?: () => void
  onEnterCode?: () => void
}

export default function LiveChooser({
  open,
  hasAccess = false,
  hasLiveSession = false,
  onClose,
  onStartLiveConversation,
  onResumeLiveConversation,
  onClearLiveSessions,
  onUpgrade,
  onEnterCode,
}: LiveChooserProps) {
  const [sessionAccess, setSessionAccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        if (cancelled) return
        setSessionAccess(Boolean(authority.liveAccess))
        setSessionChecked(true)
      })
      .catch(() => {
        if (cancelled) return
        setSessionAccess(false)
        setSessionChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  if (!open) return null

  const effectiveHasAccess = hasAccess || sessionAccess

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') onClose()
        }}
        className="fixed inset-0 z-[200] bg-black/50 transition-opacity duration-150 backdrop-blur-[2px]"
      />

      <div className="fixed inset-0 z-[210] flex items-end justify-center px-4 pb-[132px] md:items-center md:pb-0">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[388px] rounded-[1.08rem] border border-white/[0.075] bg-[#07090E]/95 px-3.5 py-3.5 shadow-[0_24px_72px_rgba(0,0,0,0.52)] backdrop-blur-[18px] transition-all duration-200 ease-out"
        >
          <div className="mb-3 flex items-start justify-between border-b border-white/[0.055] pb-3">
            <div className="pr-12">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/34">LIVE room</div>
              <div className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-white/88">Start or resume.</div>
              <div className="mt-1 text-[12px] leading-5 text-white/45">
                {effectiveHasAccess
                  ? hasLiveSession
                    ? 'Resume a saved room or prepare a clean one.'
                    : 'No saved LIVE room found. Start a clean room.'
                  : sessionChecked
                    ? 'Restore account access to use LIVE.'
                    : 'Checking LIVE access...'}
              </div>
            </div>

            <button
              type="button"
              aria-label="Close LIVE chooser"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 transition hover:border-white/[0.14] hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {effectiveHasAccess ? (
              <>
                {hasLiveSession && (
                  <button type="button" onClick={onResumeLiveConversation} className="w-full rounded-xl border border-[#AEB6FF]/[0.13] bg-[#AEB6FF]/[0.055] px-4 py-3 text-left text-sm font-semibold text-[#E3E7FF]/88 transition hover:border-[#AEB6FF]/[0.22] hover:bg-[#AEB6FF]/[0.085]">
                    Resume LIVE
                    <span className="mt-1 block text-[11px] font-normal leading-4 text-white/42">Continue from the last saved room.</span>
                  </button>
                )}

                <button type="button" onClick={onStartLiveConversation} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/76 transition hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-white">
                  Start New
                  <span className="mt-1 block text-[11px] font-normal leading-4 text-white/38">Prepare a clean conversation room.</span>
                </button>

                {hasLiveSession && onClearLiveSessions && (
                  <button type="button" onClick={onClearLiveSessions} className="w-full rounded-xl px-4 py-2.5 text-left text-[12px] text-white/34 transition hover:bg-white/[0.035] hover:text-white/62">
                    Clear old LIVE sessions
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" onClick={onEnterCode || onUpgrade} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/82 transition hover:border-white/[0.11] hover:bg-white/[0.04]">
                  Restore Account
                </button>

                <button type="button" onClick={onUpgrade} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/76 transition hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-white">
                  View Access Options
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
