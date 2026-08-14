"use client";

type LiveExitPanelProps = {
  onClose: () => void;
  onNewLive: () => void;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
};

export function LiveExitPanel({
  onClose,
  onNewLive,
  onSaveAndExit,
  onDiscardAndExit,
}: LiveExitPanelProps) {
  return (
    <>
      <style>{`
        .george-live-route {
          filter: blur(14px);
          transition: filter 180ms ease;
        }
      `}</style>

      <div
        role="button"
        tabIndex={0}
        aria-label="Close leave LIVE popup"
        onClick={onClose}
        onKeyDown={(event) => {
          if (
            event.key === "Escape" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black george-motion-fade-soft/58 px-4 backdrop-blur-[14px]"
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-[360px] rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/94 px-4 py-4 shadow-[0_24px_72px_rgba(0,0,0,0.46)]"
        >
          <div className="text-[9px] uppercase tracking-[0.22em] text-white/28">
            LIVE
          </div>

          <div className="mt-1 text-[16px] font-semibold tracking-[-0.025em] text-white/86">
            Leave LIVE?
          </div>

          <div className="mt-2 text-[11px] leading-5 text-white/38">
            Choose what happens to this conversation before leaving the room.
          </div>

          <div className="mt-4 grid gap-1">
            <button
              type="button"
              onClick={onNewLive}
              className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/62 transition hover:text-white active:scale-[0.98]"
            >
              New LIVE
            </button>

            <button
              type="button"
              onClick={onSaveAndExit}
              className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/62 transition hover:text-white active:scale-[0.98]"
            >
              Save and exit
            </button>

            <button
              type="button"
              onClick={onDiscardAndExit}
              className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/42 transition hover:text-white/72 active:scale-[0.98]"
            >
              Exit without saving
            </button>

            <button
              type="button"
              onClick={onClose}
              className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/42 transition hover:text-white/72 active:scale-[0.98]"
            >
              Continue LIVE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
