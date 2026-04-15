'use client'

type BrandProps = {
  subtitle?: string
  compact?: boolean
}

export default function Brand({
  subtitle = 'GEORGE active',
  compact = false,
}: BrandProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2.5' : 'gap-3.5'}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#7C8CFF] bg-black text-[15px] font-black tracking-[-0.04em] text-[#7C8CFF] shadow-[0_0_24px_rgba(124,140,255,0.28)]">
        <span className="relative top-[-0.5px]">B</span>
      </div>

      <div className="min-w-0 leading-none">
        <div className="flex items-center gap-2">
          <span className="block text-sm font-semibold tracking-[0.24em] text-neutral-100">
            BRANES
          </span>

          {!compact && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#7C8CFF]/20 bg-[#7C8CFF]/8 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] branes-pulse-1" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                Core
              </span>
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] branes-pulse-1" />
          <span className="truncate text-[11px] text-neutral-500">
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  )
}
