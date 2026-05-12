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
    <div className="flex items-center gap-2 overflow-hidden">
      <img
        src="/bxx34.png"
        alt="BRANESx"
        className={
          compact
            ? "h-[26px] w-auto shrink-0 object-contain opacity-95"
            : "h-[34px] w-auto shrink-0 object-contain opacity-95"
        }
      />

      {!compact && (
        <div className="ml-1 flex flex-col leading-tight">
          {showCore && (
            <span className="text-[9px] tracking-[0.18em] text-white/30">
              BRANES
            </span>
          )}

          <span className="text-[11px] text-white/62">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )
}
