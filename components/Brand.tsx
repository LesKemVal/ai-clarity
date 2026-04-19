'use client'

type BrandProps = {
  subtitle?: string
  compact?: boolean
  showCore?: boolean
}

export default function Brand({
  subtitle = 'GEORGE',
  compact = false,
  showCore = true,
}: BrandProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4.5'}`}>
      <div
        className={`relative flex items-center justify-center rounded-full border border-[#7C8CFF] bg-black text-[#7C8CFF] shadow-[0_0_28px_rgba(124,140,255,0.24)] ${
          compact ? 'h-10 w-10 text-[18px]' : 'h-14 w-14 text-[28px]'
        }`}
      >
        <span className="font-semibold tracking-[-0.04em]">B</span>
      </div>

      <div className="min-w-0 leading-none">
        <div className="flex items-center gap-3">
          <span
            className={`block text-neutral-100 ${
              compact
                ? 'text-[13px] font-semibold tracking-[0.24em]'
                : 'text-[22px] font-semibold tracking-[0.28em]'
            }`}
          >
            BRANES
          </span>

          {!compact && showCore && (
            <div className="flex items-center gap-2 rounded-full border border-[#7C8CFF]/30 bg-[#0B1020] px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7C8CFF] branes-pulse-1" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">
                Core
              </span>
            </div>
          )}
        </div>

        <div className={`${compact ? 'mt-1' : 'mt-2'} flex items-center gap-2.5`}>
          <span className="h-2 w-2 rounded-full bg-[#7C8CFF] branes-pulse-1" />
          <span
            className={`truncate ${
              compact ? 'text-[11px] text-neutral-500' : 'text-[18px] text-neutral-500'
            }`}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  )
}
