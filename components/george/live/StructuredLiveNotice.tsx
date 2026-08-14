"use client";

type StructuredLiveNoticeProps = {
  onClose: () => void;
};

export function StructuredLiveNotice({
  onClose,
}: StructuredLiveNoticeProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close structured LIVE notice"
        onClick={onClose}
        className="fixed inset-0 z-[240] bg-black george-motion-fade-soft/68 -[10px]"
      />

      <div className="fixed inset-0 z-[141] flex items-center justify-center px-4">
        <div className="w-full max-w-[360px] rounded-[1.5rem] border border-white/[0.07] bg-[#000000]/94 p-5 shadow-[0_24px_72px_rgba(0,0,0,0.46)]  ">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/72">
            LIVE STRUCTURE
          </div>

          <div className="mt-2 text-[16px] font-semibold text-[#D7DBE4]">
            Coming soon.
          </div>

          <div className="mt-3 text-[12px] leading-5 text-[#D7DBE4]/58">
            LIVE is currently focused on stabilizing individual real-time
            assistance before expanding into structured LIVE environments.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl border border-white/[0.075] bg-white/[0.025] px-4 py-3 text-sm font-medium text-[#D7DBE4]/82 transition hover:border-white/[0.09] hover:bg-white/[0.026] hover:text-[#D7DBE4]"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
