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
    <div className="flex items-center gap-2">
      <img
        src="/logo900.png"
        alt="BRANESx"
        className={compact
          ? "h-6 w-auto object-contain opacity-90"
          : "h-7 w-auto object-contain opacity-90"}
      />

      {!compact && (
        <div className="ml-1 flex flex-col leading-tight">
          {showCore && (
            <span className="text-[10px] tracking-[0.22em] text-white/34">
              BRANES
            </span>
          )}

          <span className="text-xs text-white/62">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )
}
