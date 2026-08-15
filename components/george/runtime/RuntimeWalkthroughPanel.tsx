"use client";

type RuntimeWalkthroughPanelProps = {
  step: number;
  onNext: () => void;
  onComplete: () => void;
};

export function RuntimeWalkthroughPanel({
  step,
  onNext,
  onComplete,
}: RuntimeWalkthroughPanelProps) {
  return (
    <div className="fixed inset-0 z-[95] bg-black george-motion-fade-soft/72 -[10px] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88 p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#D7DBE4]/72">
          Runtime
        </p>

        {step === 1 && (
          <p className="text-sm leading-7 text-[#D7DBE4]">
            Focus menu sets the room. Choose negotiation, interview,
            debate, speech, study, or everyday pressure.
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
              onClick={onComplete}
              className="w-full max-w-full rounded-[1rem] bg-white px-5 py-4 text-sm font-medium text-black"
            >
              End
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
