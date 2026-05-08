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
        className={compact ? "h-8 w-[42px] object-contain" : "h-10 w-[68px] object-contain"}
      />
      {!compact && (
        <div className="flex flex-col leading-tight">
          {showCore && (
            <span className="text-[11px] tracking-widest text-white/40">
              BRANES
            </span>
          )}
          <span className="text-sm text-white/80">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )
}
