"use client";

type LiveSessionDetailsPanelProps = {
  receiverLabel: string;
  communicationStyle: string;
  voiceOn: boolean;
  liveRoomActive: boolean;
  room?: string | null;
  role?: string | null;
  outcome?: string | null;
  secondaryOutcome?: string | null;
  onClose: () => void;
};

export function LiveSessionDetailsPanel({
  receiverLabel,
  communicationStyle,
  voiceOn,
  liveRoomActive,
  room,
  role,
  outcome,
  secondaryOutcome,
  onClose,
}: LiveSessionDetailsPanelProps) {
  const details = [
    ["Receiver", receiverLabel],
    ["Communication", communicationStyle],
    ["Language Assist", "Automatic"],
    ["Voice", voiceOn ? "Audio On" : "Muted"],
    ["Conversation", liveRoomActive ? "Active" : "Inactive"],
    ["Room", room || "Not specified"],
    ["Role", role || "Not specified"],
    ["Outcome", outcome || "Not specified"],
    ["Secondary", secondaryOutcome || "None"],
  ];

  return (
    <div className="fixed inset-0 z-[340] flex items-end justify-center px-4 pb-6 pt-10 sm:items-center sm:pb-10">
      <button
        type="button"
        aria-label="Close session details"
        onClick={onClose}
        className="absolute inset-0 bg-black/54 [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]"
      />

      <div className="relative w-full max-w-[420px] rounded-[1.15rem] border border-white/[0.075] bg-[#05080D]/94 p-4 shadow-[0_28px_92px_rgba(0,0,0,0.62)]">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-[#AEB6FF]/42">
              LIVE
            </div>

            <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.035em] text-white/88">
              Session Details
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close session details"
            onClick={onClose}
            className="rounded-full border border-white/[0.07] px-2 py-1 text-[12px] leading-none text-white/44 transition hover:bg-white/[0.04] hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="divide-y divide-white/[0.055] border-y border-white/[0.055]">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[112px_1fr] gap-3 py-2.5 text-[12px] leading-5"
            >
              <div className="uppercase tracking-[0.18em] text-white/28">
                {label}
              </div>

              <div className="text-[#D7DBE4]/68">
                {String(value)}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] leading-5 text-white/34">
          These are the details GEORGE is using during LIVE. They remain
          available without occupying the runtime HUD.
        </p>
      </div>
    </div>
  );
}
