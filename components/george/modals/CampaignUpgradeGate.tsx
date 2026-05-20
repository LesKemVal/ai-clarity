'use client'

type CampaignUpgradeGateProps = {
  onClose: () => void
  onUpgrade: () => void
}

export default function CampaignUpgradeGate({
  onClose,
  onUpgrade,
}: CampaignUpgradeGateProps) {
  return (
    <div className="fixed inset-x-0 bottom-[96px] z-[95] flex justify-center px-4 transition-all duration-150 ease-out">
      <div className="w-full max-w-[420px] rounded-[1.35rem] border border-white/[0.08] bg-[#0B0D12]/78 px-5 py-4 shadow-[0_18px_54px_rgba(0,0,0,0.42)]">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/72">
              Structured LIVE
            </p>
            <p className="mb-2 mt-1 text-[14px] font-semibold text-[#D7DBE4]">
              This is a structured LIVE session.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-neutral-500">
              Structured LIVE support is being prepared.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-neutral-500 transition hover:border-white/25 hover:bg-white/[0.022] hover:text-[#D7DBE4]/92"
          >
            Close
          </button>
        </div>

        <div className="rounded-[1rem] border border-white/[0.05] bg-black/35 px-5 py-4 text-xs leading-6 text-neutral-300 shadow-inner shadow-black/30">
          <div className="font-medium text-[#D7DBE4]/80">
            Structured LIVE will let you:
          </div>
          <div className="mt-1.5 space-y-1">
            <div>• resume structured conversations</div>
            <div>• use scripts and guided flow</div>
            <div>• continue where you left off</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className="mt-4 w-full max-w-full rounded-[1.2rem] border border-white/[0.09] bg-white/[0.032] px-5 py-4 text-sm font-semibold text-[#D7DBE4] shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition duration-150 hover:border-white/[0.18] hover:bg-white/[0.075]"
        >
          Upgrade to continue this campaign
        </button>
      </div>
    </div>
  )
}
