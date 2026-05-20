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
        src="/logofav.png"
        alt="BRANESx"
        className={
          compact
            ? "h-20 w-20 shrink-0 rounded-[1.25rem] object-contain opacity-95 md:h-16 md:w-16"
            : "h-[72px] w-[72px] shrink-0 rounded-[1.35rem] object-contain opacity-95"
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
