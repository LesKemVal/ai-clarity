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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,125,190,0.05),transparent_70%)]" />
      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_12s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.022] to-transparent blur-[32px]" />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[720px] -translate-y-5">
          <div className="mx-auto mb-7 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.055] bg-black/22 text-[12px] font-semibold tracking-[-0.02em] text-[#D7DBE4]/58 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
            Bx
          </div>

          <div className="text-[13px] uppercase tracking-[0.32em] text-[#8FB6C9]/58">
            GEORGE OPERATING LAYER
          </div>

          <div className="mx-auto mt-5 max-w-[520px] text-[18px] font-light leading-8 tracking-[-0.02em] text-[#D7DBE4]/62">
            Use GEORGE to navigate decisions, pressure, conversations, planning, and execution in real time.
          </div>

          <div className="mx-auto mt-9 grid max-w-[640px] gap-3 text-left md:grid-cols-3">
            {[
              ['Ask better', 'Bring the situation. GEORGE helps clarify what matters, what is missing, and what to do next.'],
              ['Move smarter', 'GEORGE adapts around timing, pressure, tone, context, and the outcome you are trying to reach.'],
              ['Use LIVE', 'For active conversations, GEORGE can support pacing, wording, openings, objections, and pressure shifts.'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.05rem] border border-white/[0.045] bg-black/18 px-4 py-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/58">
                  {title}
                </div>

                <div className="mt-2 text-[13px] leading-6 text-[#D7DBE4]/42">
                  {body}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-7 max-w-[520px] text-[12px] leading-6 text-[#D7DBE4]/32">
            Runtime systems help shape clarity, compression, pacing, memory, and response timing — so GEORGE can stay useful when reality changes.
          </div>
        </div>
      </div>
    </div>
  )
}
