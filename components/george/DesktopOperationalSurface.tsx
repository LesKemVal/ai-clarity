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
      <div className="pointer-events-none fixed inset-x-0 top-[112px] bottom-[250px] z-[18] hidden items-center justify-center lg:flex">
        <div className="relative w-full max-w-[980px] px-10 opacity-92 transition-opacity duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.06),transparent_58%)]" />

          <div className="relative text-center">
            <div className="text-[78px] font-[260] tracking-[0.28em] text-[#F4F7FF]/[0.05]">
              GEORGE
            </div>

            <div className="mt-5 text-[14px] font-light tracking-[0.08em] text-[#F4F7FF]/40">
              Bring the situation. Find the next useful move.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] hidden overflow-hidden bg-[#05070A] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,125,190,0.04),transparent_70%)]" />
      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_12s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.014] to-transparent blur-[32px]" />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[560px] -translate-y-6">
          <div className="mx-auto mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.04] bg-black/18 text-[11px] font-semibold tracking-[-0.02em] text-[#F4F7FF]/52 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
            Bx
          </div>

          <div className="text-[11px] uppercase tracking-[0.26em] text-[#F4F7FF]/42">
            NORMAL GEORGE
          </div>

          <div className="mx-auto mt-5 max-w-[480px] text-[20px] font-light leading-8 tracking-[-0.03em] text-[#F4F7FF]/72">
            Bring the situation.
            <br />
            Find the next useful move.
          </div>

          <div className="mx-auto mt-5 max-w-[440px] text-[12px] leading-6 text-[#F4F7FF]/34">
            Use GEORGE for planning, pressure, replies, decisions, interviews, negotiations, and real-world momentum.
          </div>
        </div>
      </div>
    </div>
  )
}
