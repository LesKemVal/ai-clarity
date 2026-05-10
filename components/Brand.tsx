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
        src="/logo900.png"
        alt="BRANESx"
        className={
          compact
            ? "h-[32px] w-[32px] shrink-0 rounded-[4px] object-cover opacity-90"
            : "h-[42px] w-[42px] shrink-0 rounded-[5px] object-cover opacity-90"
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
