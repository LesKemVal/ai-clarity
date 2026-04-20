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
    <div className={`flex items-center ${compact ? 'gap-3' : 'gap-3'}`}>
      <div
        className={`relative flex items-center justify-center rounded-full border border-[#7C8CFF] bg-black text-[#7C8CFF] shadow-[0_0_28px_rgba(124,140,255,0.24)] ${
          compact ? 'h-10 w-10 text-[18px]' : 'h-12 w-12 text-[24px]'
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
                : 'text-[17px] font-semibold tracking-[0.16em]'
            }`}
          >
            BRANESx
          </span>


        </div>

        <div className={`${compact ? 'mt-1' : 'mt-2'} flex items-center gap-2`}>
          <span className="h-1 w-1 rounded-full bg-[#7C8CFF]/70" />
          <span
            className={`truncate ${
              compact ? 'text-[11px] text-neutral-500' : 'text-[14px] text-neutral-500'
            }`}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  )
}
