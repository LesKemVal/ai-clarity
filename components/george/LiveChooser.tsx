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
      <button
        type="button"
        aria-label="Close LIVE chooser"
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/52 backdrop-blur-[14px]"
      />

      <div className="fixed inset-0 z-[210] flex items-center justify-center px-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[min(440px,calc(100vw-32px))] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 px-3 py-2.5 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
              LIVE Room
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[13px] text-white/28 transition hover:text-white/72"
            >
              ×
            </button>
          </div>

          <div className="mb-3">
            <div className="text-[18px] font-semibold tracking-[-0.04em] text-white/88">
              Start or resume.
            </div>

            <div className="mt-1 text-[11px] leading-5 text-white/34">
              {effectiveHasAccess
                ? hasLiveSession
                  ? 'Resume a saved room or prepare a clean one.'
                  : 'No saved LIVE conversation found. Start a clean room.'
                : sessionChecked
                  ? 'Restore account access to use LIVE.'
                  : 'Checking LIVE access...'}
            </div>
          </div>

          <div className="grid gap-1">
            {effectiveHasAccess ? (
              <>
                {hasLiveSession && (
                  <button
                    type="button"
                    onClick={onResumeLiveConversation}
                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white"
                  >
                    Resume
                  </button>
                )}

                <button
                  type="button"
                  onClick={onStartLiveConversation}
                  className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white"
                >
                  Start new
                </button>

                {hasLiveSession && onClearLiveSessions && (
                  <button
                    type="button"
                    onClick={onClearLiveSessions}
                    className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-red-100/52 transition hover:text-red-100/82"
                  >
                    Clear old sessions
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onEnterCode || onUpgrade}
                  className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white"
                >
                  Restore account
                </button>

                <button
                  type="button"
                  onClick={onUpgrade}
                  className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:text-white"
                >
                  View access
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
