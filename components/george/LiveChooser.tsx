'use client'

type LiveChooserProps = {
  open: boolean
  hasAccess?: boolean
  hasLiveSession?: boolean
  onClose: () => void
  onStartLiveConversation: () => void
  onResumeLiveConversation: () => void
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
  onUpgrade,
  onEnterCode,
}: LiveChooserProps) {
  if (!open) return null

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            onClose()
          }
        }}
        className="fixed inset-0 z-[200] bg-black/42 transition-opacity duration-150"
      />

      <div className="fixed inset-0 z-[210] flex items-end justify-center px-4 pb-[132px] md:items-center md:pb-0">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[360px] rounded-[1.05rem] border border-white/[0.075] bg-[#0B0D12]/92 px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.38)] transition-all duration-200 ease-out"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="pr-12">
              <div className="text-[11px] tracking-[0.18em] text-white/72">
                LIVE
              </div>

              <div className="mt-1 text-[11px] text-white/45">
                {hasAccess
                  ? hasLiveSession
                    ? 'Resume LIVE or prepare a new room.'
                    : 'Prepare a room before LIVE starts.'
                  : 'LIVE access required.'}
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
            {hasAccess ? (
              <>
                {hasLiveSession && (
                  <button
                    type="button"
                    onClick={onResumeLiveConversation}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/82 transition hover:border-white/[0.11] hover:bg-white/[0.04]"
                  >
                    Resume LIVE
                  </button>
                )}

                <button
                  type="button"
                  onClick={onStartLiveConversation}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/76 transition hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-white"
                >
                  Start New
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/82 transition hover:border-white/[0.11] hover:bg-white/[0.04]"
                >
                  Unlock LIVE
                </button>

                <button
                  type="button"
                  onClick={onEnterCode}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-white/76 transition hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-white"
                >
                  Enter Access Code
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
