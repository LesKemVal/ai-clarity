"use client";

type ContinuityRestorePanelProps = {
  email: string;
  linkSent: boolean;
  sending: boolean;
  onEmailChange: (email: string) => void;
  onSendLink: () => void;
  onUseDifferentEmail: () => void;
  onFounderCode: () => void;
  onOptions: () => void;
  onClose: () => void;
};

export function ContinuityRestorePanel({
  email,
  linkSent,
  sending,
  onEmailChange,
  onSendLink,
  onUseDifferentEmail,
  onFounderCode,
  onOptions,
  onClose,
}: ContinuityRestorePanelProps) {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close continuity panel"
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
        className="pointer-events-auto fixed inset-0 z-[200] bg-black george-motion-fade-soft/24 -[8px]"
      />

      <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center px-4 py-6 overflow-y-auto">
        <div
          className="pointer-events-auto w-full max-w-[360px] rounded-[1.35rem] border border-white/[0.055] bg-[#05070B]/42 p-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.14)] ring-1 ring-white/[0.018] -[14px]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4">
            <div className="inline-flex rounded-full border border-white/[0.055] bg-black/28 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/58">
              GEORGE Continuity
            </div>

            <p className="mt-4 text-[15px] font-medium text-[#F4F6FA]/92">
              Restore this device.
            </p>

            <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/42">
              A secured link verifies continuity, tier access, and LIVE
              eligibility.
            </p>
          </div>

          {linkSent ? (
            <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[12px] text-[#D7DBE4]">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-medium text-[#D7DBE4]/90">
                    Link sent
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#D7DBE4]/42">
                    Check your email and open the GEORGE link.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onUseDifferentEmail}
                className="mt-7 text-[11px] text-[#D7DBE4]/48 transition hover:text-[#D7DBE4]/80"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[1rem] border border-white/[0.05] bg-black/18 px-3.5 py-2.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D7DBE4]/38">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    onEmailChange(
                      event.target.value.trim().toLowerCase(),
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mt-2 w-full bg-transparent text-sm text-[#D7DBE4] outline-none placeholder:text-[#D7DBE4]/22"
                />
              </div>

              <button
                type="button"
                disabled={sending}
                onClick={onSendLink}
                className="w-full rounded-full border border-white/[0.07] bg-[#D7DBE4]/88 px-4 py-2.5 text-[12px] font-medium tracking-[0.06em] text-[#05070B] transition hover:bg-white disabled:opacity-45"
              >
                {sending ? "Sending…" : "Send secure link"}
              </button>

              <p className="px-1 text-[10.5px] leading-5 text-[#D7DBE4]/35">
                Intelligent and Brilliant use verified continuity before
                LIVE access.
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.03] pt-2.5">
            <button
              type="button"
              onClick={onFounderCode}
              className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
            >
              Founder code
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onOptions}
                className="text-[11px] text-[#D7DBE4]/46 transition hover:text-[#D7DBE4]/80"
              >
                Options
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
      </div>
    </>
  );
}
