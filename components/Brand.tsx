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
        src="/branding/logo.png"
        alt="BRANESx"
        className="h-9 w-9 rounded-full object-cover shadow-[0_0_18px_rgba(124,140,255,0.35)]"
      />
      {!compact && (
        <div className="flex flex-col leading-tight">
          {showCore && (
            <span className="text-[11px] tracking-widest text-white/40">
              BRANESx
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
