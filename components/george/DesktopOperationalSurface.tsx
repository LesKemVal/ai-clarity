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
        <div className="relative h-full w-full overflow-hidden bg-[#05070A]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.035),transparent_52%)]" />

          <div className="absolute inset-x-[-1.5vw] top-1/2 flex -translate-y-[58%] select-none items-center justify-between text-[clamp(118px,14vw,260px)] font-black uppercase leading-none tracking-[0.02em] text-white/[0.052]">
            <span>G</span>
            <span>E</span>
            <span>O</span>
            <span>R</span>
            <span>G</span>
            <span>E</span>
          </div>

          <div className="absolute inset-x-0 top-1/2 mt-[74px] flex justify-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.58em] text-[#D9C2A3]/45">
              NEXT <span className="mx-5 text-[#D9C2A3]/22">•</span> MOVE <span className="mx-5 text-[#D9C2A3]/22">•</span> FORWARD
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] hidden overflow-hidden bg-[#05070A] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,125,190,0.04),transparent_70%)]" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[560px] -translate-y-6">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[#F4F7FF]/42">
            GEORGE
          </div>

          <div className="mx-auto mt-5 max-w-[480px] text-[20px] font-light leading-8 tracking-[-0.03em] text-[#F4F7FF]/72">
            Bring the situation.
            <br />
            Find the next useful move.
          </div>
        </div>
      </div>
    </div>
  )
}
