'use client'

type WalkthroughModalProps = {
  step: number
  onNext: () => void
  onEnd: () => void
}

export default function WalkthroughModal({
  step,
  onNext,
  onEnd,
}: WalkthroughModalProps) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/72 px-4 backdrop-blur-[8px]">
      <div className="w-full max-w-sm rounded-[1.35rem] border border-white/[0.08] bg-[#0B0D12]/78 p-5 text-center shadow-[0_18px_54px_rgba(0,0,0,0.42)]">
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#D7DBE4]/72">
          Runtime
        </p>

        {step === 1 && (
          <p className="text-sm leading-7 text-[#D7DBE4]">
            Focus menu sets the room. Choose negotiation, interview, debate, speech, study, or everyday pressure.
          </p>
        )}
        {step === 2 && (
          <p className="text-sm leading-7 text-[#D7DBE4]">
            Voice speed controls how fast GEORGE responds in your ear.
          </p>
        )}
        {step === 3 && (
          <p className="text-sm leading-7 text-[#D7DBE4]">
            Mic button lets GEORGE listen while you stay in motion.
          </p>
        )}
        {step === 4 && (
          <p className="text-sm leading-7 text-[#D7DBE4]">
            LIVE cues give fast lines, warnings, and framing in real time.
          </p>
        )}

        <div className="mt-5">
          {step < 4 ? (
            <button
              type="button"
              onClick={onNext}
              className="w-full max-w-full rounded-[1rem] bg-white px-5 py-4 text-sm font-medium text-black"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnd}
              className="w-full max-w-full rounded-[1rem] bg-white px-5 py-4 text-sm font-medium text-black"
            >
              End
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
