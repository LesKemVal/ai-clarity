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
  onPrepRoom?: () => void
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
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/58 px-4 backdrop-blur-[6px]">
      <button
        type="button"
        aria-label="Close LIVE chooser"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-[360px] rounded-[1.35rem] border border-white/[0.07] bg-[#0B0D12]/94 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <div className="mb-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">GEORGE LIVE</p>
          <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white">
            Continue or prepare first.
          </p>
        </div>

        {hasAccess ? (
          <div className="space-y-2.5">
            {hasLiveSession && (
              <button
                type="button"
                onClick={onResumeLiveConversation}
                className="w-full rounded-[1rem] bg-white px-5 py-3.5 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Resume
              </button>
            )}

            <button
              type="button"
              onClick={onStartLiveConversation}
              className="w-full rounded-[1rem] border border-white/[0.075] bg-white/[0.025] px-5 py-3.5 text-sm font-semibold text-white/78 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white"
            >
              Start New
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onUpgrade}
              className="w-full rounded-[1rem] bg-white px-5 py-3.5 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
            >
              Unlock LIVE
            </button>

            <button
              type="button"
              onClick={onEnterCode}
              className="w-full rounded-[1rem] border border-white/[0.075] bg-white/[0.025] px-5 py-3.5 text-sm font-semibold text-white/78 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white"
            >
              Enter Access Code
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full text-[11px] uppercase tracking-[0.18em] text-white/34 transition hover:text-white/62"
        >
          Close
        </button>
      </div>
    </div>
  )
}
