'use client'

type TierTickerProps = {
  currentTier: 'smart' | 'intelligent' | 'brilliant' | string
  tierPrimarySignal: string
  hasLiveGeorgeAccess: boolean
  onPress: () => void
}

function FlameIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 text-[#F2B36D] drop-shadow-[0_0_8px_rgba(242,179,109,0.20)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22c3.7 0 6.5-2.6 6.5-6.2 0-2.2-1.1-4.2-2.8-5.5.1 1.4-.5 2.4-1.4 3.1.1-3.4-1.7-6.1-4.5-8.4.3 2.9-.9 4.7-2.3 6.2-1.1 1.2-2 2.5-2 4.5C5.5 19.4 8.3 22 12 22Z" />
    </svg>
  )
}

export default function TierTicker({
  currentTier,
  tierPrimarySignal,
  hasLiveGeorgeAccess,
  onPress,
}: TierTickerProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="relative inline-flex h-5 w-[270px] max-w-[58vw] items-center overflow-hidden text-left text-[11px] font-medium tracking-[0.05em] text-[#D7DBE4]/42 transition hover:text-[#D7DBE4]/72"
    >
      <span className="absolute inset-0 flex items-center gap-1.5 animate-[tierSignalPrimary_4.8s_ease-in-out_infinite]">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {currentTier !== 'smart' && <FlameIcon />}
        </span>
        <span className="whitespace-nowrap">{tierPrimarySignal}</span>
      </span>

      {hasLiveGeorgeAccess && (
        <span className="absolute inset-0 flex items-center gap-1.5 animate-[tierSignalSecondary_4.8s_ease-in-out_infinite]">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            <FlameIcon />
          </span>
          <span className="whitespace-nowrap">You have access to LIVE GEORGE</span>
        </span>
      )}
    </button>
  )
}
