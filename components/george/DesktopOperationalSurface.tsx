export default function DesktopOperationalSurface({
  visible,
  mode = 'idle',
}: {
  visible: boolean
  mode?: 'idle' | 'active'
}) {
  if (!visible) return null

  if (mode !== 'active') {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[112px] bottom-[250px] z-[18] hidden items-center justify-center md:flex">
        <div className="relative w-full max-w-[980px] px-10 opacity-92 transition-opacity duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.088),transparent_58%)]" />

          <div className="relative text-center">
            <div className="text-[92px] font-[260] tracking-[0.34em] text-[#D7DBE4]/[0.065]">
              GEORGE
            </div>

            <div className="mt-5 text-[15px] font-light tracking-[0.12em] text-[#D7DBE4]/42">
              Set the direction. GEORGE maps the tactical route.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] overflow-hidden bg-[#05070A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,120,185,0.035),transparent_68%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.025]" />
      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_12s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.018] to-transparent blur-[32px]" />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[720px] -translate-y-8">
          <div className="mx-auto mb-9 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.045] bg-black/18 text-[11px] font-semibold tracking-[-0.02em] text-[#D7DBE4]/46 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
            Bx
          </div>

          <div className="text-[52px] font-[240] tracking-[0.34em] text-[#D7DBE4]/[0.055] md:text-[82px]">
            GEORGE
          </div>

          <div className="mx-auto mt-7 max-w-[440px] text-[10px] uppercase leading-6 tracking-[0.24em] text-[#D7DBE4]/28 md:text-[11px] md:tracking-[0.28em]">
            Direction. Execution. Live support.
          </div>

          <div className="mx-auto mt-10 grid max-w-[560px] grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.18em] text-[#D7DBE4]/20 md:text-[10px]">
            <div className="rounded-full border border-white/[0.035] bg-black/12 px-3 py-2">
              Think
            </div>
            <div className="rounded-full border border-white/[0.035] bg-black/12 px-3 py-2">
              Decide
            </div>
            <div className="rounded-full border border-white/[0.035] bg-black/12 px-3 py-2">
              Move
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
