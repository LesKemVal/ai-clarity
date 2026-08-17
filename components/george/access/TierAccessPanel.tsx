"use client";

type TierAccessPanelProps = {
  headline: string;
  currentLabel: string;
  currentIncludes: string[];
  nextCopy: string;
  cta: string;
  onUpgrade: () => void;
  onRestoreAccess: () => void;
  onClose: () => void;
};

export function TierAccessPanel({
  headline,
  currentLabel,
  currentIncludes,
  nextCopy,
  cta,
  onUpgrade,
  onRestoreAccess,
  onClose,
}: TierAccessPanelProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close access panel"
        onClick={onClose}
        className="fixed inset-0 z-[200] cursor-default bg-black george-motion-fade-soft/45 backdrop-blur-[14px]"
      />

      <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto px-4 py-6">
        <div
          className="pointer-events-auto w-full max-w-[390px] rounded-[1.35rem] border border-white/[0.07] bg-[#05070B]/86 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.52)] ring-1 ring-white/[0.025] backdrop-blur-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4">
            <div className="inline-flex rounded-full border border-white/[0.055] bg-black/28 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/58">
              GEORGE Access
            </div>

            <p className="mt-4 text-[12px] uppercase tracking-[0.22em] text-[#D7DBE4]/38">
              {headline}
            </p>

            <p className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-[#F4F6FA]/94">
              {currentLabel}
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3.5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DBE4]/32">
              Includes
            </div>

            <div className="mt-3 grid gap-2">
              {currentIncludes.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[12px] leading-5 text-[#D7DBE4]/58"
                >
                  <span className="h-1 w-1 rounded-full bg-[#AEB6FF]/54" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 rounded-[1rem] border border-[#AEB6FF]/[0.08] bg-[#AEB6FF]/[0.035] px-3.5 py-3 text-[12px] leading-5 text-[#D7DBE4]/52">
            {nextCopy}
          </p>

          <button
            type="button"
            onClick={onUpgrade}
            className="george-access-action mt-4 w-full rounded-full px-4 py-2.5 text-[12px] font-medium tracking-[0.06em]"
          >
            {cta}
          </button>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.03] pt-2.5">
            <button
              type="button"
              onClick={onRestoreAccess}
              className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
            >
              Restore access
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
