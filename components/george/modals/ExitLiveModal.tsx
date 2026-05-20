'use client'

type ExitLiveModalProps = {
  onClose: () => void
  onSaveAndExit: () => void
  onLeaveWithoutSaving: () => void
}

export default function ExitLiveModal({
  onClose,
  onSaveAndExit,
  onLeaveWithoutSaving,
}: ExitLiveModalProps) {
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
        className="fixed inset-0 z-[220] bg-black/74 transition-opacity duration-150"
      />

      <div className="fixed inset-0 z-[230] flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] rounded-[1.35rem] border border-white/[0.075] bg-[#0B0D12]/80 p-4 shadow-[0_18px_54px_rgba(0,0,0,0.42)] transition-all duration-150 ease-out">
          <div className="mb-2 text-[11px] tracking-[0.22em] text-[#D7DBE4]/72">
            LEAVE LIVE
          </div>

          <div className="text-[15px] font-semibold text-[#D7DBE4]">
            Exit
          </div>

          <div className="mt-2 text-[12px] leading-5 text-[#D7DBE4]/62">
            Return to GEORGE.
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <button type="button" onClick={onSaveAndExit} className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3 text-left text-sm font-medium text-[#D7DBE4] transition hover:border-white/[0.09] hover:bg-white/[0.032]">
              Save and exit
            </button>

            <button type="button" onClick={onLeaveWithoutSaving} className="w-full rounded-xl border border-red-400/12 bg-red-400/[0.045] px-4 py-3 text-left text-sm font-medium text-red-100/82 transition hover:bg-red-400/[0.045]">
              Leave without saving
            </button>

            <button type="button" onClick={onClose} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm font-medium text-[#D7DBE4]/76 transition hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-[#D7DBE4]">
              Continue session
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
