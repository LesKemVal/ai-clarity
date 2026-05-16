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
    <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/42 px-4 pb-[112px] backdrop-blur-[3px] md:items-center md:pb-0">
      <button
        type="button"
        aria-label="Close LIVE entry"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-[390px] overflow-hidden rounded-[1.15rem] border border-white/[0.06] bg-[#0B0D12]/94 text-white shadow-[0_22px_70px_rgba(0,0,0,0.52)] ring-1 ring-white/[0.025]">
        <div className="border-b border-white/[0.045] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">
              LIVE
            </p>

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] uppercase tracking-[0.16em] text-white/28 transition hover:text-white/58"
            >
              Close
            </button>
          </div>

          <p className="mt-3 text-[15px] font-semibold tracking-[-0.025em] text-white/90">
            {hasAccess
              ? hasLiveSession
                ? 'Continue where the room left off.'
                : 'Prepare the room before LIVE starts.'
              : 'LIVE requires access.'}
          </p>

          <p className="mt-1.5 text-[12px] leading-5 text-white/42">
            {hasAccess
              ? hasLiveSession
                ? 'Resume context, or start clean with room setup.'
                : 'Set context, language, and control words first.'
              : 'Unlock LIVE or enter an access code.'}
          </p>
        </div>

        <div className="space-y-2 p-3">
          {hasAccess ? (
            <>
              {hasLiveSession && (
                <button
                  type="button"
                  onClick={onResumeLiveConversation}
                  className="group flex w-full items-center justify-between rounded-[0.85rem] border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-left transition hover:border-white/[0.13] hover:bg-white/[0.055]"
                >
                  <span>
                    <span className="block text-sm font-medium text-white/88">Resume</span>
                    <span className="mt-0.5 block text-[11px] text-white/36">Open saved LIVE context</span>
                  </span>
                  <span className="text-white/28 transition group-hover:text-white/60">→</span>
                </button>
              )}

              <button
                type="button"
                onClick={onStartLiveConversation}
                className="group flex w-full items-center justify-between rounded-[0.85rem] border border-white/[0.055] bg-black/24 px-4 py-3 text-left transition hover:border-white/[0.11] hover:bg-white/[0.03]"
              >
                <span>
                  <span className="block text-sm font-medium text-white/82">Start New</span>
                  <span className="mt-0.5 block text-[11px] text-white/34">Open Prep Room first</span>
                </span>
                <span className="text-white/24 transition group-hover:text-white/56">→</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onUpgrade}
                className="group flex w-full items-center justify-between rounded-[0.85rem] border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left transition hover:border-white/[0.13] hover:bg-white/[0.065]"
              >
                <span>
                  <span className="block text-sm font-medium text-white/88">Unlock LIVE</span>
                  <span className="mt-0.5 block text-[11px] text-white/36">Use real-time conversational support</span>
                </span>
                <span className="text-white/28 transition group-hover:text-white/60">→</span>
              </button>

              <button
                type="button"
                onClick={onEnterCode}
                className="group flex w-full items-center justify-between rounded-[0.85rem] border border-white/[0.055] bg-black/24 px-4 py-3 text-left transition hover:border-white/[0.11] hover:bg-white/[0.03]"
              >
                <span>
                  <span className="block text-sm font-medium text-white/82">Enter Access Code</span>
                  <span className="mt-0.5 block text-[11px] text-white/34">Restore founder or trial access</span>
                </span>
                <span className="text-white/24 transition group-hover:text-white/56">→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
